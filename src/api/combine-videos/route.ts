import { combineVideos } from "@/lib/docker";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { videoPaths } = await request.json();

    if (!videoPaths || !Array.isArray(videoPaths) || videoPaths.length === 0) {
      return NextResponse.json(
        { success: false, error: "Valid video paths array is required" },
        { status: 400 }
      );
    }

    const result = await combineVideos(videoPaths);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      videoUrl: result.videoPath,
    });
  } catch (error) {
    console.error("Error in combine-videos API:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
