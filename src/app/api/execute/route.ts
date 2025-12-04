// app/api/execute/route.ts - Improved API with multi-scene support
import { NextResponse } from "next/server";
import {
  compileMultipleScenes,
  compileSingleScene,
  extractSceneClasses,
} from "@/lib/docker";

interface SceneFile {
  name: string;
  content: string;
}

interface ExecuteRequest {
  code?: string; // For single file backward compatibility
  scenes?: SceneFile[]; // For multi-scene support
  combineVideos?: boolean;
}

export async function POST(request: Request) {
  try {
    const body: ExecuteRequest = await request.json();
    console.log("Execute request body:", JSON.stringify(body, null, 2));
    const { code, scenes, combineVideos = true } = body;

    // Handle single code execution (backward compatibility)
    if (code && !scenes) {
      const sceneClasses = extractSceneClasses(code);

      if (sceneClasses.length === 0) {
        return NextResponse.json(
          {
            error: "No valid Scene class found",
            details:
              "Code must contain a class that inherits from Scene (e.g., class MyScene(Scene):)",
            code: code.substring(0, 200) + "...",
          },
          { status: 400 }
        );
      }

      // If single scene in single file
      if (sceneClasses.length === 1) {
        const result = await compileSingleScene(code, sceneClasses[0]);

        if (!result.success) {
          return NextResponse.json(
            {
              error: "Compilation failed",
              details: result.error,
              className: sceneClasses[0],
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          videoUrl: result.videoUrl,
          scenes: [{ scene: sceneClasses[0], videoUrl: result.videoUrl }],
        });
      }

      // Multiple scenes in single file - treat as multi-scene
      const sceneInfos = sceneClasses.map((className) => ({
        className,
        fileName: "main.py",
        content: code,
      }));

      const result = await compileMultipleScenes(sceneInfos, combineVideos);

      if (!result.success) {
        return NextResponse.json(
          {
            error: "Multi-scene compilation failed",
            details: result.error,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        videoUrl: result.combinedVideoUrl,
        individualScenes: result.individualVideos,
        combinedVideo: result.combinedVideoUrl,
      });
    }

    // Handle multi-scene execution
    if (scenes && scenes.length > 0) {
      const sceneInfos: Array<{
        className: string;
        fileName: string;
        content: string;
      }> = [];

      // Process each scene file
      for (const sceneFile of scenes) {
        const sceneClasses = extractSceneClasses(sceneFile.content);

        if (sceneClasses.length === 0) {
          return NextResponse.json(
            {
              error: `No valid Scene class found in ${sceneFile.name}`,
              details: `File ${sceneFile.name} must contain a class that inherits from Scene`,
              fileName: sceneFile.name,
            },
            { status: 400 }
          );
        }

        // Add all scenes from this file
        for (const className of sceneClasses) {
          sceneInfos.push({
            className,
            fileName: sceneFile.name,
            content: sceneFile.content,
          });
        }
      }

      if (sceneInfos.length === 0) {
        return NextResponse.json(
          {
            error: "No scenes found in any files",
            details: "At least one file must contain a valid Scene class",
          },
          { status: 400 }
        );
      }

      const result = await compileMultipleScenes(sceneInfos, combineVideos);

      if (!result.success) {
        return NextResponse.json(
          {
            error: "Multi-scene compilation failed",
            details: result.error,
            sceneCount: sceneInfos.length,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        videoUrl: result.combinedVideoUrl, // Main video URL for preview
        individualScenes: result.individualVideos, // Individual scene videos
        combinedVideo: result.combinedVideoUrl, // Combined video
        sceneCount: sceneInfos.length,
      });
    }

    return NextResponse.json(
      {
        error: "Invalid request",
        details: "Must provide either code or scenes array",
      },
      { status: 400 }
    );
  } catch {
    console.error("Error cleaning up temp files");
    return NextResponse.json(
      {
        error: "Internal server error",
        details: "Unknown error occurred", // Removed reference to 'error' variable
      },
      { status: 500 }
    );
  }
}

// Add a GET endpoint to serve video files properly
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const videoId = url.searchParams.get("id");

    if (!videoId) {
      return NextResponse.json({ error: "Video ID required" }, { status: 400 });
    }

    // Return video URL for the client to fetch
    return NextResponse.json({
      videoUrl: `/videos/${videoId}`,
    });
  } catch {
    return NextResponse.json({ error: "Failed to get video" }, { status: 500 });
  }
}
