import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Constants
const TEMP_DIR = path.join(process.cwd(), "tmp");
const OUTPUT_DIR = path.join(process.cwd(), "public/videos");
const DOCKER_IMAGE = "manim-animation-platform";

// Make sure directories exist
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

interface CompileResult {
  success: boolean;
  videoPath?: string;
  error?: string;
}

/**
 * Compile Manim code to a video using Docker
 */
export async function compileManimCode(
  code: string,
  className?: string
): Promise<CompileResult> {
  try {
    // Generate unique ID for this compilation
    const compilationId = crypto.randomUUID();
    const tempScriptPath = path.join(TEMP_DIR, `${compilationId}.py`);

    // Extract class name from code if not provided
    if (!className) {
      const classMatch = code.match(
        /class\s+([a-zA-Z0-9_]+)\s*\(\s*Scene\s*\)/
      );
      if (classMatch && classMatch[1]) {
        className = classMatch[1];
      } else {
        return {
          success: false,
          error: "Could not find Scene class in the provided code",
        };
      }
    }

    // Write code to temp file
    fs.writeFileSync(tempScriptPath, code);

    // Create temp output directory
    const tempOutputDir = path.join(TEMP_DIR, compilationId);
    fs.mkdirSync(tempOutputDir, { recursive: true });

    // Build Docker image if it doesn't exist
    try {
      execSync(`docker image inspect ${DOCKER_IMAGE}`);
    } catch (error) {
      console.log("Building Docker image...");
      execSync(`docker build -t ${DOCKER_IMAGE} -f docker/Dockerfile docker/`);
    }

    // Run Docker container to compile the Manim code
    console.log(`Compiling Manim animation for class: ${className}`);
    const dockerCmd = `docker run --rm -v ${TEMP_DIR}:/app/input -v ${OUTPUT_DIR}:/app/output ${DOCKER_IMAGE} python -m manim /app/input/${compilationId}.py ${className} -o /app/output`;

    execSync(dockerCmd, { stdio: "inherit" });

    // Find the generated video file (Manim typically outputs to a media/videos/directory)
    const videoFiles = fs
      .readdirSync(OUTPUT_DIR)
      .filter(
        (file) => file.endsWith(".mp4") && className && file.includes(className)
      );

    if (videoFiles.length === 0) {
      return {
        success: false,
        error: "No video file was generated",
      };
    }

    // Return path to the video file
    const videoPath = `/videos/${videoFiles[0]}`;

    // Clean up temp files
    fs.unlinkSync(tempScriptPath);

    return {
      success: true,
      videoPath,
    };
  } catch (error) {
    console.error("Error compiling Manim code:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error occurred during compilation",
    };
  }
}

/**
 * Combine multiple videos into one using FFmpeg
 */
export async function combineVideos(
  videoPaths: string[]
): Promise<CompileResult> {
  try {
    if (videoPaths.length === 0) {
      return {
        success: false,
        error: "No videos provided",
      };
    }

    // Generate unique ID for this compilation
    const combinationId = crypto.randomUUID();
    const outputPath = path.join(OUTPUT_DIR, `combined_${combinationId}.mp4`);
    const listFilePath = path.join(TEMP_DIR, `${combinationId}_list.txt`);

    // Create file list for FFmpeg
    const fileContent = videoPaths
      .map(
        (videoPath) => `file '${path.join(process.cwd(), "public", videoPath)}'`
      )
      .join("\n");

    fs.writeFileSync(listFilePath, fileContent);

    // Run FFmpeg to combine videos
    const ffmpegCmd = `ffmpeg -f concat -safe 0 -i ${listFilePath} -c copy ${outputPath}`;
    execSync(ffmpegCmd);

    // Clean up
    fs.unlinkSync(listFilePath);

    return {
      success: true,
      videoPath: `/videos/combined_${combinationId}.mp4`,
    };
  } catch (error) {
    console.error("Error combining videos:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error occurred while combining videos",
    };
  }
}
