// Types for scenes
export interface Scene {
  id: string;
  name: string;
  prompt: string;
  code: string;
  status: "pending" | "generating" | "compiling" | "completed" | "failed";
  videoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Types for API responses
export interface GenerateCodeResponse {
  success: boolean;
  code?: string;
  error?: string;
}

export interface CompileVideoResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
}

export interface CombineVideosResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
}

// Types for Gemini API
export interface GeminiRequest {
  prompt: string;
  options?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

export interface GeminiResponse {
  text: string;
  error?: string;
}
