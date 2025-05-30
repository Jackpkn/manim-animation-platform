// app/api/generate/route.ts (or pages/api/generate.ts)
import { NextResponse } from "next/server";
import {
  generateManimResponse,
  GenerateManimProjectResponse,
} from "@/lib/gemini"; // Adjust path

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        {
          explanation: "Prompt is required",
          project: undefined,
        } as GenerateManimProjectResponse,
        { status: 400 }
      );
    }

    // generateManimResponse now returns GenerateManimProjectResponse
    const aiResponse: GenerateManimProjectResponse =
      await generateManimResponse(prompt);

    // Return the full structure
    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error("Error in /api/generate route:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate project structure";
    return NextResponse.json(
      {
        explanation: `Server error: ${message}`,
        project: undefined,
      } as GenerateManimProjectResponse,
      { status: 500 }
    );
  }
}
