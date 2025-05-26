// lib/docker.ts - Improved Docker execution with multi-scene support
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Constants
const TEMP_DIR = path.join(process.cwd(), "tmp");
const OUTPUT_DIR = path.join(process.cwd(), "public/videos");
const DOCKER_IMAGE = "manim-platform"; // Consistent naming

// Ensure directories exist
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

interface SceneInfo {
  className: string;
  fileName: string;
  content: string;
}

interface CompileResult {
  success: boolean;
  videoPath?: string;
  videoUrl?: string;
  error?: string;
  compilationId?: string;
}

interface MultiSceneResult {
  success: boolean;
  individualVideos: { scene: string; videoUrl: string }[];
  combinedVideoUrl?: string;
  error?: string;
}

/**
 * Extract all scene classes from code
 */
function extractSceneClasses(code: string): string[] {
  const patterns = [
    /class\s+([a-zA-Z0-9_]+)\s*\(\s*Scene\s*\)/g,
    /class\s+([a-zA-Z0-9_]+)\s*\(\s*MovingCameraScene\s*\)/g,
    /class\s+([a-zA-Z0-9_]+)\s*\(\s*ThreeDScene\s*\)/g,
    /class\s+([a-zA-Z0-9_]+)\s*\(\s*ZoomedScene\s*\)/g,
  ];

  const classes = new Set<string>();

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      classes.add(match[1]);
    }
  }

  return Array.from(classes);
}

/**
 * Find generated video file with multiple possible locations
 */
function findGeneratedVideo(
  outputDir: string,
  className: string,
  compilationId: string
): string | null {
  const possiblePaths = [
    path.join(outputDir, `${className}.mp4`),
    path.join(outputDir, `${compilationId}_${className}.mp4`),
    path.join(outputDir, compilationId, `${className}.mp4`),
    path.join(outputDir, "videos", `${className}.mp4`),
    path.join(outputDir, "videos", compilationId, `${className}.mp4`),
  ];

  for (const videoPath of possiblePaths) {
    if (fs.existsSync(videoPath)) {
      return videoPath;
    }
  }

  // Fallback: find any .mp4 file containing the class name
  try {
    const findAllMp4Files = (dir: string): string[] => {
      const files: string[] = [];
      const items = fs.readdirSync(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          files.push(...findAllMp4Files(fullPath));
        } else if (
          item.name.endsWith(".mp4") &&
          item.name.includes(className)
        ) {
          files.push(fullPath);
        }
      }
      return files;
    };

    const mp4Files = findAllMp4Files(outputDir);
    if (mp4Files.length > 0) {
      return mp4Files[0]; // Return the first matching file
    }
  } catch (error) {
    console.error("Error searching for video files:", error);
  }

  return null;
}

/**
 * Compile a single Manim scene
 */
export async function compileSingleScene(
  code: string,
  className: string,
  compilationId?: string
): Promise<CompileResult> {
  try {
    const id = compilationId || crypto.randomUUID();
    const tempScriptPath = path.join(TEMP_DIR, `${id}.py`);
    const tempOutputDir = path.join(OUTPUT_DIR, id);

    // Create output directory
    if (!fs.existsSync(tempOutputDir)) {
      fs.mkdirSync(tempOutputDir, { recursive: true });
    }

    // Write code to temp file
    fs.writeFileSync(tempScriptPath, code);

    // Build Docker image if it doesn't exist
    try {
      execSync(`docker image inspect ${DOCKER_IMAGE}`, { stdio: "ignore" });
    } catch {
      console.log("Building Docker image...");
      execSync(`docker build -t ${DOCKER_IMAGE} -f docker/Dockerfile docker/`);
    }

    // Run Docker container
    console.log(`Compiling scene: ${className}`);
    const dockerCmd = `docker run --rm \
      -v "${TEMP_DIR}:/app/input" \
      -v "${tempOutputDir}:/app/output" \
      ${DOCKER_IMAGE} \
      python -m manim /app/input/${id}.py ${className} -q m --output_file ${className}`;

    execSync(dockerCmd, { stdio: "pipe" });

    // Find the generated video
    const videoPath = findGeneratedVideo(tempOutputDir, className, id);

    if (!videoPath) {
      return {
        success: false,
        error: `No video file generated for scene: ${className}`,
        compilationId: id,
      };
    }

    // Copy video to main output directory with a predictable name
    const finalVideoName = `${id}_${className}.mp4`;
    const finalVideoPath = path.join(OUTPUT_DIR, finalVideoName);

    fs.copyFileSync(videoPath, finalVideoPath);

    // Clean up temp files
    try {
      fs.unlinkSync(tempScriptPath);
      fs.rmSync(tempOutputDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.warn("Cleanup warning:", cleanupError);
    }

    return {
      success: true,
      videoPath: finalVideoPath,
      videoUrl: `/videos/${finalVideoName}`,
      compilationId: id,
    };
  } catch (error) {
    console.error("Error compiling scene:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown compilation error",
    };
  }
}

/**
 * Compile multiple scenes and optionally combine them
 */
export async function compileMultipleScenes(
  scenes: SceneInfo[],
  combineVideos: boolean = true
): Promise<MultiSceneResult> {
  try {
    const projectId = crypto.randomUUID();
    const individualVideos: { scene: string; videoUrl: string }[] = [];
    const videoPaths: string[] = [];

    // Compile each scene individually
    for (const scene of scenes) {
      const result = await compileSingleScene(
        scene.content,
        scene.className,
        `${projectId}_${scene.className}`
      );

      if (!result.success) {
        return {
          success: false,
          individualVideos,
          error: `Failed to compile scene ${scene.className}: ${result.error}`,
        };
      }

      if (result.videoUrl && result.videoPath) {
        individualVideos.push({
          scene: scene.className,
          videoUrl: result.videoUrl,
        });
        videoPaths.push(result.videoPath);
      }
    }

    let combinedVideoUrl: string | undefined;

    // Combine videos if requested and we have multiple scenes
    if (combineVideos && videoPaths.length > 1) {
      const combineResult = await combineVideosFFmpeg(videoPaths, projectId);
      if (combineResult.success && combineResult.videoUrl) {
        combinedVideoUrl = combineResult.videoUrl;
      }
    } else if (videoPaths.length === 1) {
      // If only one video, use it as the "combined" result
      combinedVideoUrl = individualVideos[0].videoUrl;
    }

    return {
      success: true,
      individualVideos,
      combinedVideoUrl,
    };
  } catch (error) {
    console.error("Error compiling multiple scenes:", error);
    return {
      success: false,
      individualVideos: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Combine multiple videos using FFmpeg
 */
export async function combineVideosFFmpeg(
  videoPaths: string[],
  projectId?: string
): Promise<CompileResult> {
  try {
    if (videoPaths.length === 0) {
      return {
        success: false,
        error: "No videos to combine",
      };
    }

    if (videoPaths.length === 1) {
      // If only one video, return it as-is
      const videoName = path.basename(videoPaths[0]);
      return {
        success: true,
        videoPath: videoPaths[0],
        videoUrl: `/videos/${videoName}`,
      };
    }

    const combinationId = projectId || crypto.randomUUID();
    const outputFileName = `combined_${combinationId}.mp4`;
    const outputPath = path.join(OUTPUT_DIR, outputFileName);
    const listFilePath = path.join(TEMP_DIR, `${combinationId}_list.txt`);

    // Create file list for FFmpeg
    const fileContent = videoPaths
      .map((videoPath) => `file '${path.resolve(videoPath)}'`)
      .join("\n");

    fs.writeFileSync(listFilePath, fileContent);

    // Run FFmpeg to combine videos
    const ffmpegCmd = `ffmpeg -f concat -safe 0 -i "${listFilePath}" -c copy "${outputPath}"`;
    execSync(ffmpegCmd, { stdio: "pipe" });

    // Clean up list file
    fs.unlinkSync(listFilePath);

    return {
      success: true,
      videoPath: outputPath,
      videoUrl: `/videos/${outputFileName}`,
    };
  } catch (error) {
    console.error("Error combining videos:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error combining videos",
    };
  }
}

/**
 * Legacy function for backward compatibility
 */
export async function compileManimCode(
  code: string,
  className?: string
): Promise<CompileResult> {
  if (!className) {
    const classes = extractSceneClasses(code);
    if (classes.length === 0) {
      return {
        success: false,
        error: "No Scene class found in the code",
      };
    }
    className = classes[0]; // Use the first found class
  }

  return compileSingleScene(code, className);
}

// Export helper function
export { extractSceneClasses };
