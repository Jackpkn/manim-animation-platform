import { GoogleGenAI } from "@google/genai";
import { systemPrompt } from "./system-propmt";

// Initialize Google Gen AI SDK
const API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

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
  name: string;
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
  project?: AiProject;
}

function postProcessSceneCode(code: string): string {
  let processedCode = code.trim();
  const fromManimImport = "from manim import *";

  if (!processedCode.includes(fromManimImport)) {
    processedCode = `${fromManimImport}\n\n${processedCode}`;
  }

  if (!processedCode.includes("config.background_color")) {
    const importRegex = /^(from manim import .*?\n|import .*?\n)+/m;
    if (importRegex.test(processedCode)) {
      processedCode = processedCode.replace(
        importRegex,
        `$&\n# Set dark background\nconfig.background_color = "#1C1C1C"\n`
      );
    } else {
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
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        // @ts-ignore - thinkingConfig is not yet in the types
        thinkingConfig: {
          // @ts-ignore
          thinkingLevel: "low",
        },
      },
    });

    const generatedText = response.text;
    if (!generatedText) {
      return {
        explanation: "Error: Invalid or incomplete response received from AI.",
        project: undefined,
      };
    }

    let cleanedJsonText = generatedText.trim();
    // Remove markdown code blocks if present
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

      if (!parsedResponse.explanation || typeof parsedResponse.explanation !== "string") {
        return {
          explanation: "Error: AI response is missing a valid explanation.",
          project: undefined,
        };
      }

      if (!parsedResponse.project || typeof parsedResponse.project !== "object") {
        return { explanation: parsedResponse.explanation, project: undefined };
      }

      const project = parsedResponse.project;

      // Validate project structure
      if (!Array.isArray(project.scenes)) {
        return {
          explanation: parsedResponse.explanation + "\n\nError: Project data from AI is malformed (scenes).",
          project: undefined,
        };
      }

      const processedScenes = project.scenes.map((scene: Partial<AiScene>) => {
        if (typeof scene.content !== "string") {
          return {
            ...scene,
            content: "// Error: AI provided no code for this scene.",
          } as AiScene;
        }
        return {
          id: scene.id || `generated-scene-${Date.now()}-${Math.random()}`,
          name: scene.name || "untitled_scene.py",
          sceneClass: scene.sceneClass || "DefaultScene",
          description: scene.description || "No description provided.",
          content: postProcessSceneCode(scene.content),
          dependencies: Array.isArray(scene.dependencies) ? scene.dependencies : [],
          duration: typeof scene.duration === "number" ? scene.duration : 0,
          tags: Array.isArray(scene.tags) ? scene.tags : [],
        } as AiScene;
      });

      const validatedProject: AiProject = {
        scenes: processedScenes,
        combinedOutput: project.combinedOutput as AiCombinedOutput,
        assets: project.assets as AiAsset[],
      };

      return {
        explanation: parsedResponse.explanation,
        project: validatedProject,
      };
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      return {
        explanation: "Error: AI returned a response that was not valid JSON.",
        project: undefined,
      };
    }
  } catch (error) {
    console.error("Error in generateManimResponse:", error);
    return {
      explanation: error instanceof Error ? `Generation error: ${error.message}` : "Unknown error occurred",
      project: undefined,
    };
  }
}

export async function enhancePrompt(prompt: string): Promise<string> {
  if (!API_KEY) {
    throw new Error("API key is not configured for prompt enhancement");
  }

  const enhancementPrompt = `You are an expert prompt engineer. Your goal is to take a user-provided prompt and make it more specific, descriptive, and detailed. The prompt is about creating an animation using the Manim library in Python. Focus on adding details that would help the AI generate more accurate and visually appealing Manim code. Return ONLY the enhanced prompt, nothing else. Do not explain. User Prompt: ${prompt}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: enhancementPrompt,
    });

    const enhancedText = response.text;
    if (!enhancedText) {
      console.warn("AI returned an empty enhanced prompt, using original.");
      return prompt;
    }
    return enhancedText.trim();
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    return prompt;
  }
}
