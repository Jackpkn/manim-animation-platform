import axios from "axios";
import { systemPrompt } from "./system-propmt";

// Replace with your actual API key
const API_KEY = process.env.GEMINI_API_KEY;
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function generateManimResponse(
  prompt: string
): Promise<{ explanation: string; code: string }> {
  if (!API_KEY) {
    // Log error server-side, but return a user-friendly message
    console.error("GEMINI_API_KEY environment variable is not set.");
    return {
      explanation: "Error: API key is not configured.",
      code: "# API key missing\n# Please set the GEMINI_API_KEY environment variable.",
    };
  }

  try {
    const response = await axios.post(
      `${API_URL}?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nUser request: ${prompt}`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Basic validation for response structure
    if (
      !response.data ||
      !response.data.candidates ||
      !response.data.candidates[0] ||
      !response.data.candidates[0].content ||
      !response.data.candidates[0].content.parts ||
      !response.data.candidates[0].content.parts[0] ||
      !response.data.candidates[0].content.parts[0].text
    ) {
      console.error(
        "Invalid or empty response structure from Gemini API:",
        response.data
      );

      return {
        explanation: "Error: Invalid response received from AI.",
        code: "",
      };
    }

    const generatedText = response.data.candidates[0].content.parts[0].text;
    let explanation = "";
    let code = "";
    const defaultExplanation = "Here is the generated code:";

    // --- Parsing Logic ---

    // First, look for the CODE block using the markers and the code block syntax
    // This regex looks for [CODE] followed by ```python or ```, captures the content inside,
    // and goes up to the closing ```
    const strictCodeBlockRegex = /\[CODE\]\s*```(?:python)?\n([\s\S]*?)\n```/;
    const strictCodeMatch = generatedText.match(strictCodeBlockRegex);
    const fallbackCodeBlockRegex = /```(?:python)?\n([\s\S]*?)\n```/;
    const fallbackCodeMatch = generatedText.match(fallbackCodeBlockRegex);

    if (strictCodeMatch && strictCodeMatch[1]) {
      // Strict format [CODE] + ```...``` found
      code = strictCodeMatch[1].trim();
      const explanationTextBeforeCode = generatedText
        .substring(0, strictCodeMatch.index)
        .trim();

      const explanationMarkerRegex = /\[EXPLANATION\]([\s\S]*)/;
      const explanationMatch = explanationTextBeforeCode.match(
        explanationMarkerRegex
      );

      if (explanationMatch && explanationMatch[1]) {
        // Found [EXPLANATION] before the code block
        explanation = explanationMatch[1].trim();
      } else {
        // No [EXPLANATION] marker found before the code block,
        // use the text before the code block as explanation, or default
        console.warn(
          "AI response contained code block but missing or misplaced [EXPLANATION] marker."
        );
        explanation = explanationTextBeforeCode || defaultExplanation;
      }
    } else {
      // Strict [CODE] + ```...``` format not found.
      // Fallback: Look for *any* markdown code block (```python or ```)
      const fallbackCodeBlockRegex = /```(?:python)?\n([\s\S]*?)\n```/;
      const fallbackCodeMatch = generatedText.match(fallbackCodeBlockRegex);

      if (fallbackCodeMatch && fallbackCodeMatch[1]) {
        // Found a code block, even if not preceded by [CODE] marker
        code = fallbackCodeMatch[1].trim();

        // Assume text *before* the code block is the explanation
        const textBeforeCode = generatedText
          .substring(0, fallbackCodeMatch.index)
          .trim();
        // Clean up potential [EXPLANATION] or [CODE] markers if they exist but were not in the strict format
        explanation = textBeforeCode
          .replace(/\[EXPLANATION\]/g, "")
          .replace(/\[CODE\]/g, "")
          .trim();

        if (!explanation) {
          explanation = defaultExplanation;
        }
        console.warn(
          "AI response contained code block but not in strict [EXPLANATION][CODE] format."
        );
      } else {
        console.warn("AI response did not contain any markdown code block.");
        code = "";
        explanation =
          generatedText.trim() || "AI did not return any code or explanation.";
      }
    }

    // --- End Parsing Logic ---

    if (code.trim() && !code.includes("config.background_color")) {
      // Add imports only if they are missing and code is not empty
      const fromManimImport = "from manim import *";
      if (!code.includes(fromManimImport)) {
        code = `${fromManimImport}\n\n${code}`;
      }
      code = code.replace(/^from manim import \*/m, "").trim();
      code = `${fromManimImport}\n\n# Set dark background\nconfig.background_color = "#1C1C1C"\n\n${code}`;
    } else if (!code.trim() && (strictCodeMatch || fallbackCodeMatch)) {
      console.warn("AI returned an empty code block after markers.");
      code = "";
      if (!explanation || explanation === defaultExplanation) {
        explanation = "AI returned code block markers but no code inside.";
      }
    }

    if (!explanation && code.trim()) {
      explanation = defaultExplanation;
    }
    return { explanation, code };
  } catch (error) {
    console.error("Error in generateManimResponse:", error);
    let errorMessage = "Failed to generate response due to an API error.";
    if (axios.isAxiosError(error)) {
      errorMessage = `Gemini API error: ${error.response?.data?.error?.message || error.message
        }`;
      console.error(
        "Axios error details:",
        error.response?.data || error.message
      );
    } else if (error instanceof Error) {
      errorMessage = `Generation error: ${error.message}`;
    }
    return { explanation: errorMessage, code: "" };
  }
}

// New function to enhance the prompt
export async function enhancePrompt(prompt: string): Promise<string> {
  console.log("API Key available:", !!API_KEY); // Log if API key exists
  console.log("API Key length:", API_KEY?.length); // Log API key length (without exposing the key)

  if (!API_KEY) {
    console.error("GEMINI_API_KEY environment variable is not set.");
    throw new Error("API key is not configured");
  }

  const enhancementPrompt = `You are an expert prompt engineer. Your goal is to take a user-provided prompt and make it more specific, descriptive, and detailed. The prompt is about creating an animation using the Manim library in Python. Focus on adding details that would help the AI generate more accurate and visually appealing Manim code. Return ONLY the enhanced prompt, nothing else. Do not explain. User Prompt: ${prompt}`;

  try {
    console.log("Making API request to enhance prompt...");
    const response = await axios.post(
      `${API_URL}?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: enhancementPrompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("API Response received:", {
      hasData: !!response.data,
      hasCandidates: !!response.data?.candidates,
      candidateCount: response.data?.candidates?.length,
    });

    if (
      !response.data ||
      !response.data.candidates ||
      !response.data.candidates[0] ||
      !response.data.candidates[0].content ||
      !response.data.candidates[0].content.parts ||
      !response.data.candidates[0].content.parts[0] ||
      !response.data.candidates[0].content.parts[0].text
    ) {
      console.error(
        "Invalid or empty response structure from Gemini API:",
        response.data
      );
      throw new Error("Invalid response received from AI");
    }

    const enhancedText = response.data.candidates[0].content.parts[0].text.trim();

    // If the response is empty or just whitespace
    if (!enhancedText) {
      throw new Error("AI returned an empty response");
    }

    return enhancedText;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      throw new Error(
        `API error: ${error.response?.data?.error?.message || error.message}`
      );
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Failed to enhance prompt");
    }
  }
}
