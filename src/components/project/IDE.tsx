import React, { useState, useEffect } from "react";
import CodeEditorSection from "./CodeEditorSection";
import FileExplorer, {
  FileType,
  FolderType,
  FileSystemItem,
} from "./FileExplorer";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  // Initialize file system with the main code file
  const initialFileSystem: FileSystemItem[] = [
    {
      id: "folder-1",
      name: "src",
      type: "folder",
      isOpen: true,
      children: [
        {
          id: "file-1",
          name: "main.py",
          content: code || "# Main Python file\n\nprint('Hello, world!')",
          type: "file",
        },
      ],
    },
  ];

  const [fileSystem, setFileSystem] =
    useState<FileSystemItem[]>(initialFileSystem);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

  // Find the main file and select it by default
  useEffect(() => {
    const mainFile = findFileById("file-1", fileSystem);
    if (mainFile) {
      setSelectedFile(mainFile);
    }
  }, []);

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

  // Initialize the main file with code from parent component
  useEffect(() => {
    if (code) {
      const updatedFileSystem = updateFileContent("file-1", code, fileSystem);
      setFileSystem(updatedFileSystem);

      // If main file is currently selected, update its content in the state
      if (selectedFile?.id === "file-1") {
        setSelectedFile({
          ...selectedFile,
          content: code,
        });
      }
    }
  }, [code]);

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

      // Update the selected file with new content
      setSelectedFile({
        ...selectedFile,
        content: newCode,
      });

      // If the selected file is the main file, update the parent component state
      if (selectedFile.id === "file-1") {
        onCodeChange(newCode);
      }
    }
  };

  // Handle file selection
  const handleFileSelect = (file: FileType) => {
    setSelectedFile(file);
  };

  return (
    <div className="flex h-full bg-gray-900 text-white gap-2 border   border-gray-700">
      <FileExplorer
        fileSystem={fileSystem}
        onFileSelect={handleFileSelect}
        selectedFileId={selectedFile?.id || null}
      />

      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <>
            <CodeEditorSection
              code={selectedFile.content}
              onCodeChange={handleCodeChange}
              onRunAnimation={onRunAnimation}
              isExecuting={isExecuting}
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            <p>Select a file from the explorer to start editing</p>
          </div>
        )}
      </div>
    </div>
  );
}
