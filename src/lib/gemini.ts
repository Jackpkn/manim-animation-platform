import axios from "axios";
import { systemPrompt } from "./system-propmt"; // Assuming this is system-prompt.ts

// Replace with your actual API key
const API_KEY = process.env.GEMINI_API_KEY;
// Using a model known for good JSON output and instruction following.
// Replace with gemini-2.0-flash if that's a model you have access to and prefer.
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

// --- TypeScript Interfaces for AI Response ---
export interface AiScene {
  id: string;
  name: string;
  sceneClass: string;
  description: string;
  content: string;
  dependencies: string[];
  duration: number;
  tags: string[];
}

export interface AiCombinedOutput {
  shouldCombine: boolean;
  transitionType: "fade" | "slide" | "none";
  description: string;
}

export interface AiAsset {
  type: "image" | "audio" | "data";
  name: string; // Changed from "filename.ext" to string for flexibility
  description: string;
  generateInstruction: string;
}

export interface AiProject {
  scenes: AiScene[];
  combinedOutput: AiCombinedOutput;
  assets: AiAsset[];
}

export interface GenerateManimProjectResponse {
  explanation: string;
  project?: AiProject; // Project can be undefined on error or if AI doesn't provide it
}

function postProcessSceneCode(code: string): string {
  let processedCode = code.trim();
  const fromManimImport = "from manim import *";

  if (!processedCode.includes(fromManimImport)) {
    processedCode = `${fromManimImport}\n\n${processedCode}`;
  }

  if (!processedCode.includes("config.background_color")) {
    // Try to insert after imports
    const importRegex = /^(from manim import .*?\n|import .*?\n)+/m;
    if (importRegex.test(processedCode)) {
      processedCode = processedCode.replace(
        importRegex,
        `$&\n# Set dark background\nconfig.background_color = "#1C1C1C"\n`
      );
    } else {
      // Prepend if no imports found
      processedCode = `# Set dark background\nconfig.background_color = "#1C1C1C"\n\n${processedCode}`;
    }
  }
  return processedCode;
}

export async function generateManimResponse(
  prompt: string
): Promise<GenerateManimProjectResponse> {
  if (!API_KEY) {
    console.error("GEMINI_API_KEY environment variable is not set.");
    return {
      explanation: "Error: API key is not configured. Please contact support.",
      project: undefined,
    };
  }

  const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`;

  try {
    const response = await axios.post(
      `${API_URL}?key=${API_KEY}`,
      {
        contents: [{ parts: [{ text: fullPrompt }] }],
        // It's highly recommended to use this with models that support it
        // to enforce JSON output, if your chosen model does.
        // generationConfig: {
        //   response_mime_type: "application/json",
        // }
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error(
        "Invalid or empty response structure from Gemini API:",
        JSON.stringify(response.data, null, 2)
      );
      return {
        explanation: "Error: Invalid or incomplete response received from AI.",
        project: undefined,
      };
    }

    const generatedText = response.data.candidates[0].content.parts[0].text;
    let cleanedJsonText = generatedText.trim();

    // Remove markdown ```json ... ``` wrapping if present
    if (cleanedJsonText.startsWith("```json")) {
      cleanedJsonText = cleanedJsonText.substring(7);
      if (cleanedJsonText.endsWith("```")) {
        cleanedJsonText = cleanedJsonText.slice(0, -3);
      }
    } else if (cleanedJsonText.startsWith("```")) {
      cleanedJsonText = cleanedJsonText.substring(3);
      if (cleanedJsonText.endsWith("```")) {
        cleanedJsonText = cleanedJsonText.slice(0, -3);
      }
    }
    cleanedJsonText = cleanedJsonText.trim();

    try {
      const parsedResponse = JSON.parse(cleanedJsonText) as Partial<
        GenerateManimProjectResponse & { project: Partial<AiProject> }
      >;

      if (
        !parsedResponse.explanation ||
        typeof parsedResponse.explanation !== "string"
      ) {
        console.error(
          "AI response JSON missing or has invalid 'explanation' field.",
          parsedResponse
        );
        return {
          explanation: "Error: AI response is missing a valid explanation.",
          project: undefined,
        };
      }

      if (
        !parsedResponse.project ||
        typeof parsedResponse.project !== "object"
      ) {
        console.warn(
          "AI response JSON missing 'project' field. Explanation provided without project details.",
          parsedResponse.explanation
        );
        // Return explanation even if project is missing, as AI might just be conversing.
        return { explanation: parsedResponse.explanation, project: undefined };
      }

      const project = parsedResponse.project;

      // Validate project structure (basic)
      if (!Array.isArray(project.scenes)) {
        console.error(
          "AI response project missing or has invalid 'scenes' array.",
          project
        );
        return {
          explanation:
            parsedResponse.explanation +
            "\n\nError: Project data from AI is malformed (scenes).",
          project: undefined,
        };
      }
      if (
        typeof project.combinedOutput !== "object" ||
        project.combinedOutput === null
      ) {
        console.error(
          "AI response project missing or has invalid 'combinedOutput' object.",
          project
        );
        return {
          explanation:
            parsedResponse.explanation +
            "\n\nError: Project data from AI is malformed (combinedOutput).",
          project: undefined,
        };
      }
      if (!Array.isArray(project.assets)) {
        console.error(
          "AI response project missing or has invalid 'assets' array.",
          project
        );
        return {
          explanation:
            parsedResponse.explanation +
            "\n\nError: Project data from AI is malformed (assets).",
          project: undefined,
        };
      }

      // Post-process scene content
      const processedScenes = project.scenes.map((scene: Partial<AiScene>) => {
        if (typeof scene.content !== "string") {
          console.warn(
            `Scene ${
              scene.id || "unknown"
            } has missing or invalid content. Skipping content processing.`
          );
          return {
            ...scene,
            content: "// Error: AI provided no code for this scene.",
          } as AiScene;
        }
        // Ensure all fields are present, providing defaults if necessary, or throw
        return {
          id: scene.id || `generated-scene-${Date.now()}-${Math.random()}`,
          name: scene.name || "untitled_scene.py",
          sceneClass: scene.sceneClass || "DefaultScene",
          description: scene.description || "No description provided.",
          content: postProcessSceneCode(scene.content),
          dependencies: Array.isArray(scene.dependencies)
            ? scene.dependencies
            : [],
          duration: typeof scene.duration === "number" ? scene.duration : 0,
          tags: Array.isArray(scene.tags) ? scene.tags : [],
        } as AiScene;
      });

      const validatedProject: AiProject = {
        scenes: processedScenes,
        combinedOutput: project.combinedOutput as AiCombinedOutput, // Add more validation if needed
        assets: project.assets as AiAsset[], // Add more validation if needed
      };

      return {
        explanation: parsedResponse.explanation,
        project: validatedProject,
      };
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.error("Raw AI response text that failed parsing:", generatedText);
      return {
        explanation:
          "Error: AI returned a response that was not valid JSON. The raw response might be in the server console. Please try rephrasing your request or try again later.",
        // Optionally include the malformed text in the code block for debugging by user if desired.
        project: undefined,
      };
    }
  } catch (error) {
    console.error("Error in generateManimResponse:", error);
    let errorMessage = "Failed to generate response due to an API error.";
    if (axios.isAxiosError(error)) {
      errorMessage = `Gemini API error: ${
        error.response?.data?.error?.message || error.message
      }`;
      console.error(
        "Axios error details:",
        error.response?.data || error.message
      );
    } else if (error instanceof Error) {
      errorMessage = `Generation error: ${error.message}`;
    }
    return { explanation: errorMessage, project: undefined };
  }
}

// enhancePrompt function remains unchanged as its purpose is separate.
export async function enhancePrompt(prompt: string): Promise<string> {
  // ... (existing enhancePrompt implementation)
  console.log("API Key available:", !!API_KEY);
  console.log(
    "API Key length (indicative):",
    API_KEY ? String(API_KEY).length : 0
  );

  if (!API_KEY) {
    console.error(
      "GEMINI_API_KEY environment variable is not set for enhancePrompt."
    );
    throw new Error("API key is not configured for prompt enhancement");
  }

  const enhancementPrompt = `You are an expert prompt engineer. Your goal is to take a user-provided prompt and make it more specific, descriptive, and detailed. The prompt is about creating an animation using the Manim library in Python. Focus on adding details that would help the AI generate more accurate and visually appealing Manim code. Return ONLY the enhanced prompt, nothing else. Do not explain. User Prompt: ${prompt}`;

  try {
    console.log("Making API request to enhance prompt...");
    const response = await axios.post(
      `${API_URL}?key=${API_KEY}`,
      {
        contents: [{ parts: [{ text: enhancementPrompt }] }],
      },
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("API Response for enhancement received:", {
      hasData: !!response.data,
      hasCandidates: !!response.data?.candidates,
      candidateCount: response.data?.candidates?.length,
    });

    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error(
        "Invalid or empty response structure from Gemini API for enhancement:",
        response.data
      );
      throw new Error("Invalid response received from AI during enhancement");
    }

    const enhancedText =
      response.data.candidates[0].content.parts[0].text.trim();
    if (!enhancedText) {
      console.warn("AI returned an empty enhanced prompt, using original.");
      return prompt;
    }
    return enhancedText;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details (enhancement):", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      throw new Error(
        `API error during enhancement: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
    console.warn("Failed to enhance prompt, returning original prompt.");
    return prompt;
  }
}
