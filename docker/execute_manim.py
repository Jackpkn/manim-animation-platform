import os
import sys
import json
import subprocess
from pathlib import Path

def execute_manim_code(code_file, output_dir, quality="medium_quality"):
    """Execute a manim code file and return the generated video path"""
    try:
        cmd = [
            "python", "-m", "manim", 
            code_file,
            f"--{quality}",
            "-o", output_dir
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            return {
                "success": False,
                "error": result.stderr,
                "output": result.stdout
            }
        
        # Find the generated video file (usually in media/videos/)
        video_dir = Path(output_dir)
        video_files = list(video_dir.glob("**/*.mp4"))
        
        if not video_files:
            return {
                "success": False,
                "error": "No video file was generated",
                "output": result.stdout
            }
        
        return {
            "success": True,
            "video_path": str(video_files[0]),
            "output": result.stdout
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "output": ""
        }

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({
            "success": False,
            "error": "Please provide code file and output directory",
            "output": ""
        }))
        sys.exit(1)
    
    code_file = sys.argv[1]
    output_dir = sys.argv[2]
    quality = sys.argv[3] if len(sys.argv) > 3 else "medium_quality"
    
    result = execute_manim_code(code_file, output_dir, quality)
    print(json.dumps(result))