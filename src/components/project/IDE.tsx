import React, { useState, useEffect } from "react";
import CodeEditorSection from "./CodeEditorSection";
import FileExplorer, { FileType, FileSystemItem } from "./FileExplorer";

export default function IDE({
  code,
  onCodeChange,
  onRunAnimation,
  isExecuting,
}: {
  code: string;
  onCodeChange: (code: string) => void;
  onRunAnimation: () => void;
  isExecuting: boolean;
  aiGeneratedCode?: string;
}) {
  // Initialize file system with the main code file and scenes folder
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
            "# Main Python file\nfrom manim import *\n\n# Import your scenes here\n\n# Render configurations\n",
          type: "file",
        },
        // {
        //   id: "folder-scenes",
        //   name: "scenes",
        //   type: "folder",
        //   isOpen: true,
        //   children: [
        //     {
        //       id: "file",
        //       name: "screne.py",
        //       content:
        //         code ||
        //         "# Main Python file\nfrom manim import *\n\n# Import your scenes here\n\n# Render configurations\n",
        //       type: "file",
        //     },
        //   ],
        // },
      ],
    },
  ];

  const [fileSystem, setFileSystem] =
    useState<FileSystemItem[]>(initialFileSystem);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

  // Find the main file and select it by default
  useEffect(() => {
    const mainFile = findFileById("file-main", fileSystem);
    if (mainFile) {
      setSelectedFile(mainFile);
    }
  }, []);

  // Initialize the main file with code from parent component
  useEffect(() => {
    if (code) {
      const updatedFileSystem = updateFileContent(
        "file-main",
        code,
        fileSystem
      );
      setFileSystem(updatedFileSystem);

      if (selectedFile?.id === "file-main") {
        setSelectedFile({
          ...selectedFile,
          content: code,
        });
      }
    }
  }, [code]);

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

      if (selectedFile.id === "file-main") {
        onCodeChange(newCode);
      }
    }
  };

  // Handle file selection
  const handleFileSelect = (file: FileType) => {
    setSelectedFile(file);
  };

  // Add a new scene file and update main.py imports
  const addNewScene = (sceneName: string) => {
    // Format class name (e.g., "my_scene" -> "MyScene")
    const className = sceneName
      .split(/[_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");

    const fileName = sceneName.endsWith(".py") ? sceneName : `${sceneName}.py`;

    const newFile: FileType = {
      id: `file-${Date.now()}`,
      name: fileName,
      content: `from manim import *\n\nclass ${className}(Scene):\n    def construct(self):\n        # Your animation here\n        circle = Circle()\n        self.play(Create(circle))`,
      type: "file",
    };

    // Update main.py to import the new scene
    const mainFile = findFileById("file-main", fileSystem);
    const importStatement = `from scenes.${sceneName.replace(
      ".py",
      ""
    )} import ${className}`;

    let newMainContent = mainFile?.content || "";
    if (!newMainContent.includes(importStatement)) {
      newMainContent = `${importStatement}\n${newMainContent}`;
    }

    // Update the file system
    const updatedFileSystem = fileSystem.map((item) => {
      if (item.id === "folder-scenes" && item.type === "folder") {
        return {
          ...item,
          children: [...item.children, newFile],
        };
      } else if (item.id === "file-main") {
        return { ...item, content: newMainContent };
      }
      return item;
    });

    setFileSystem(updatedFileSystem);
    setSelectedFile(newFile);

    // Update main file content in parent if needed
    if (mainFile?.id === "file-main") {
      onCodeChange(newMainContent);
    }
  };

  // Handle file system changes from FileExplorer
  const handleFileSystemChange = (newFileSystem: FileSystemItem[]) => {
    setFileSystem(newFileSystem);

    // If the currently selected file was deleted, select main.py
    if (selectedFile && !findFileById(selectedFile.id, newFileSystem)) {
      const mainFile = findFileById("file-main", newFileSystem);
      setSelectedFile(mainFile);
    }
  };

  return (
    <div className="flex h-full bg-gray-900 text-white gap-2 border border-gray-700">
      <FileExplorer
        fileSystem={fileSystem}
        onFileSelect={handleFileSelect}
        selectedFileId={selectedFile?.id || null}
        onAddScene={addNewScene}
        setFileSystem={function (
          value: React.SetStateAction<FileSystemItem[]>
        ): void {
          throw new Error("Function not implemented.");
        }}
      />

      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <CodeEditorSection
            code={selectedFile.content}
            onCodeChange={handleCodeChange}
            onRunAnimation={onRunAnimation}
            isExecuting={isExecuting}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            <p>Select a file from the explorer to start editing</p>
          </div>
        )}
      </div>
    </div>
  );
}
