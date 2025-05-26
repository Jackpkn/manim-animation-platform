// components/project/ImprovedIDE.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, Film, Combine } from "lucide-react";
import CodeEditorSection from "./CodeEditorSection";
import FileExplorer, { FileType, FileSystemItem } from "./FileExplorer";
import { Label } from "@radix-ui/react-label";
import { Switch } from "@radix-ui/react-switch";

interface SceneInfo {
  fileName: string;
  className: string;
  content: string;
}

interface IDEProps {
  code: string;
  onCodeChange: (code: string) => void;
  onRunAnimation: () => void;
  isExecuting: boolean;
  onMultiSceneRun: (scenes: SceneInfo[], combineVideos: boolean) => void;
}

export default function ImprovedIDE({
  code,
  onCodeChange,
  onRunAnimation,
  isExecuting,
  onMultiSceneRun,
}: IDEProps) {
  // Initialize file system with better structure
  const initialFileSystem: FileSystemItem[] = [
    {
      id: "folder-project",
      name: "project",
      type: "folder",
      isOpen: true,
      children: [
        {
          id: "file-main",
          name: "main.py",
          content:
            code ||
            `from manim import *

class IntroScene(Scene):
    def construct(self):
        # Introduction scene
        title = Text("Welcome to Manim!", font_size=48)
        self.play(Write(title))
        self.wait(2)
        self.play(FadeOut(title))

class CircleScene(Scene):
    def construct(self):
        # Circle animation scene
        circle = Circle(radius=2, color=BLUE)
        self.play(Create(circle))
        self.play(circle.animate.set_color(RED))
        self.wait(1)`,
          type: "file",
        },
        {
          id: "folder-scenes",
          name: "scenes",
          type: "folder",
          isOpen: true,
          children: [
            {
              id: "file-scene1",
              name: "geometric_shapes.py",
              content: `from manim import *

class SquareScene(Scene):
    def construct(self):
        square = Square(side_length=3, color=GREEN)
        self.play(Create(square))
        self.play(Rotate(square, PI/4))
        self.wait(1)

class TriangleScene(Scene):
    def construct(self):
        triangle = Triangle(color=YELLOW)
        self.play(Create(triangle))
        self.play(triangle.animate.scale(2))
        self.wait(1)`,
              type: "file",
            },
          ],
        },
      ],
    },
  ];

  const [fileSystem, setFileSystem] =
    useState<FileSystemItem[]>(initialFileSystem);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const [detectedScenes, setDetectedScenes] = useState<SceneInfo[]>([]);
  const [combineMode, setCombineMode] = useState(true);
  const [showSceneList, setShowSceneList] = useState(false); // Added showSceneList state

  // Find file by ID in the file system
  const findFileById = (
    id: string,
    items: FileSystemItem[]
  ): FileType | null => {
    for (const item of items) {
      if (item.type === "file" && item.id === id) {
        return item;
      } else if (item.type === "folder") {
        const foundInFolder = findFileById(id, item.children);
        if (foundInFolder) return foundInFolder;
      }
    }
    return null;
  };

  // Get all files from the file system
  const getAllFiles = (items: FileSystemItem[]): FileType[] => {
    const files: FileType[] = [];
    for (const item of items) {
      if (item.type === "file") {
        files.push(item);
      } else if (item.type === "folder") {
        files.push(...getAllFiles(item.children));
      }
    }
    return files;
  };

  // Extract scene classes from code
  const extractSceneClasses = (content: string): string[] => {
    const patterns = [
      /class\s+([a-zA-Z0-9_]+)\s*\(\s*Scene\s*\)/g,
      /class\s+([a-zA-Z0-9_]+)\s*\(\s*MovingCameraScene\s*\)/g,
      /class\s+([a-zA-Z0-9_]+)\s*\(\s*ThreeDScene\s*\)/g,
      /class\s+([a-zA-Z0-9_]+)\s*\(\s*ZoomedScene\s*\)/g,
    ];

    const classes = new Set<string>();

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        classes.add(match[1]);
      }
    }

    return Array.from(classes);
  };

  // Detect all scenes in the project
  useEffect(() => {
    const allFiles = getAllFiles(fileSystem);
    const scenes: SceneInfo[] = [];
    const seenSceneClassNames = new Set<string>(); // Track seen class names

    for (const file of allFiles) {
      if (file.name.endsWith(".py") && file.content) {
        const sceneClasses = extractSceneClasses(file.content);
        for (const className of sceneClasses) {
          if (!seenSceneClassNames.has(className)) {
            scenes.push({
              fileName: file.name,
              className,
              content: file.content,
            });
            seenSceneClassNames.add(className);
          }
        }
      }
    }

    setDetectedScenes(scenes);
  }, [fileSystem]);

  // Initialize selected file
  useEffect(() => {
    if (!selectedFile) {
      const mainFile = findFileById("file-main", fileSystem);
      if (mainFile) {
        setSelectedFile(mainFile);
      }
    }
  }, [fileSystem, selectedFile]);

  // Update file content in the file system
  const updateFileContent = (
    fileId: string,
    newContent: string,
    items: FileSystemItem[]
  ): FileSystemItem[] => {
    return items.map((item) => {
      if (item.type === "file" && item.id === fileId) {
        return { ...item, content: newContent };
      } else if (item.type === "folder") {
        return {
          ...item,
          children: updateFileContent(fileId, newContent, item.children),
        };
      }
      return item;
    });
  };

  // Handle code changes
  const handleCodeChange = (newCode: string) => {
    if (selectedFile) {
      const updatedFileSystem = updateFileContent(
        selectedFile.id,
        newCode,
        fileSystem
      );
      setFileSystem(updatedFileSystem);

      setSelectedFile({
        ...selectedFile,
        content: newCode,
      });

      // Update main code if editing main.py
      if (selectedFile.id === "file-main") {
        onCodeChange(newCode);
      }
    }
  };

  // Handle file selection
  const handleFileSelect = (file: FileType) => {
    setSelectedFile(file);
  };

  // Add a new scene file
  const addNewScene = (sceneName: string) => {
    const className = sceneName
      .split(/[_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");

    const fileName = sceneName.endsWith(".py") ? sceneName : `${sceneName}.py`;

    const newFile: FileType = {
      id: `file-${Date.now()}`,
      name: fileName,
      content: `from manim import *

class ${className}(Scene):
    def construct(self):
        # Your animation here
        circle = Circle()
        self.play(Create(circle))
        self.wait(1)`,
      type: "file",
    };

    // Add to scenes folder
    const updatedFileSystem = fileSystem.map((item) => {
      if (item.id === "folder-project" && item.type === "folder") {
        return {
          ...item,
          children: item.children.map((child) => {
            if (child.id === "folder-scenes" && child.type === "folder") {
              return {
                ...child,
                children: [...child.children, newFile],
              };
            }
            return child;
          }),
        };
      }
      return item;
    });

    setFileSystem(updatedFileSystem);
    setSelectedFile(newFile);
  };

  // Handle multi-scene execution
  const handleMultiSceneRun = () => {
    if (detectedScenes.length === 0) {
      alert("No scenes detected. Please create at least one scene class.");
      return;
    }

    onMultiSceneRun(detectedScenes, combineMode);
  };

  // Handle single scene execution (backward compatibility)
  const handleSingleSceneRun = () => {
    if (selectedFile?.id === "file-main") {
      onRunAnimation();
    } else {
      // Run current file as single scene
      if (selectedFile?.content) {
        const scenes = extractSceneClasses(selectedFile.content);
        if (scenes.length > 0) {
          onMultiSceneRun(
            [
              {
                fileName: selectedFile.name,
                className: scenes[0],
                content: selectedFile.content,
              },
            ],
            false
          );
        }
      }
    }
  };

  return (
    <div className="flex h-full bg-gray-900 text-white gap-2 border border-gray-700">
      <div className="w-64 flex-shrink-0 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Project Scenes</div>
            <div className="flex items-center space-x-2">
              <Label
                htmlFor="scene-list-toggle"
                className="text-xs text-gray-500"
              >
                {showSceneList ? "Hide" : "Show"}
              </Label>
              <Switch
                id="scene-list-toggle"
                checked={showSceneList}
                onCheckedChange={(checked) => setShowSceneList(checked)}
              />
            </div>
          </div>
          {showSceneList && (
            <>
              <div className="space-y-1">
                {detectedScenes.map((scene, index) => (
                  <div
                    key={index}
                    className="text-xs bg-gray-800 rounded px-2 py-1"
                  >
                    <div className="font-medium text-blue-400">
                      {scene.className}
                    </div>
                    <div className="text-gray-400">{scene.fileName}</div>
                  </div>
                ))}
              </div>
              {detectedScenes.length === 0 && (
                <div className="text-xs text-gray-500">No scenes detected</div>
              )}
            </>
          )}
        </div>

        <FileExplorer
          fileSystem={fileSystem}
          onFileSelect={handleFileSelect}
          selectedFileId={selectedFile?.id || null}
          onAddScene={addNewScene}
          setFileSystem={setFileSystem}
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Control Panel */}
        <div className="p-4 border-b border-gray-700 justify-between flex">
          <div className="flex gap-2">
            <Button
              onClick={handleSingleSceneRun}
              disabled={isExecuting}
              variant="outline"
              size="sm"
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Run Current
            </Button>

            <Button
              onClick={handleMultiSceneRun}
              disabled={isExecuting || detectedScenes.length === 0}
              size="sm"
            >
              {combineMode ? (
                <>
                  <Combine className="mr-2 h-4 w-4" />
                  Render & Combine
                </>
              ) : (
                <>
                  <Film className="mr-2 h-4 w-4" />
                  Render All
                </>
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={combineMode}
                  onChange={(e) => setCombineMode(e.target.checked)}
                  className="rounded"
                />
                Combine videos
              </label>
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 min-h-0">
          {selectedFile ? (
            <CodeEditorSection
              code={selectedFile.content}
              onCodeChange={handleCodeChange}
              onRunAnimation={handleSingleSceneRun}
              isExecuting={isExecuting}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              <p>Select a file from the explorer to start editing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
