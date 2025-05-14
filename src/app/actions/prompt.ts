'use server'

import { enhancePrompt } from "@/lib/gemini";

export async function enhancePromptAction(prompt: string) {
    try {
        const enhancedPrompt = await enhancePrompt(prompt);
        return { success: true, enhancedPrompt };
    } catch (error) {
        console.error("Error in enhancePromptAction:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to enhance prompt"
        };
    }
} 