import axios from "axios";
import { GeminiRequest, GeminiResponse } from "./types";

// Replace with your actual API key
const API_KEY = process.env.GEMINI_API_KEY;
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export async function generateManimCode(
  prompt: string
): Promise<GeminiResponse> {
  try {
    // Format the prompt to generate good Manim code
    const formattedPrompt = `
    I need Python code using the Manim animation library to create a mathematical or educational animation. 
    
    Here's what I want:
    ${prompt}
    
    Please provide complete, executable Manim code that:
    1. Creates a Scene class inheriting from Scene
    2. Implements the construct method
    3. Uses appropriate Manim objects (Text, MathTex, Rectangle, Circle, Arrow, etc.)
    4. Includes appropriate animations (Write, FadeIn, Transform, etc.)
    5. Has appropriate timing with self.wait() calls
    
    Return only the code with no explanation. The code should be complete and ready to run with Manim.
    `;

    const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
      contents: [
        {
          parts: [
            {
              text: formattedPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
      },
    });

    // Extract the response text
    const generatedText = response.data.candidates[0].content.parts[0].text;

    // Clean up the code (remove markdown code blocks if present)
    const cleanedCode = generatedText.replace(/```python|```/g, "").trim();

    return { text: cleanedCode };
  } catch (error) {
    console.error("Error generating Manim code:", error);
    return {
      text: "",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
