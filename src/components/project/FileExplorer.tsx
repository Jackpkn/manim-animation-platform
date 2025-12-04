import React, { useState, useEffect } from "react";
import {
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// File system types
export type FileType = {
  id: string;
  name: string;
  content: string;
  type: "file";
};

export type FolderType = {
  id: string;
  name: string;
  type: "folder";
  isOpen: boolean;
  children: FileSystemItem[];
};

export type FileSystemItem = FileType | FolderType;

const isFolder = (item: FileSystemItem): item is FolderType => {
  return item.type === "folder";
};

interface FileExplorerProps {
  fileSystem: FileSystemItem[];
  onFileSelect: (file: FileType) => void;
  selectedFileId: string | null;
  onAddScene?: (name: string) => void;
  setFileSystem: React.Dispatch<React.SetStateAction<FileSystemItem[]>>;
}

const PythonFileIcon = () => (
  <Image src="/python.svg" alt="python icon" width={16} height={16} className="w-4 h-4" />
);

export default function FileExplorer({
  fileSystem,
  onFileSelect,
  selectedFileId,
  onAddScene,
  setFileSystem,
}: FileExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFileSystem, setFilteredFileSystem] =
    useState<FileSystemItem[]>(fileSystem);
  const [isAddingScene, setIsAddingScene] = useState(false);
  const [newSceneName, setNewSceneName] = useState("");

  // Filter files based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFileSystem(fileSystem);
      return;
    }

    const filterItems = (items: FileSystemItem[]): FileSystemItem[] => {
      return items
        .map((item) => {
          if (isFolder(item)) {
            const filteredChildren = filterItems(item.children);
            if (
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              filteredChildren.length > 0
            ) {
              return { ...item, children: filteredChildren };
            }
            return null;
          } else {
            return item.name.toLowerCase().includes(searchQuery.toLowerCase())
              ? item
              : null;
          }
        })
        .filter(Boolean) as FileSystemItem[];
    };

    setFilteredFileSystem(filterItems(fileSystem));
  }, [searchQuery, fileSystem]);

  // Toggle folder open/closed state
  const toggleFolder = (folderId: string) => {
    const updateItem = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.map((item) => {
        if (item.id === folderId && isFolder(item)) {
          return { ...item, isOpen: !item.isOpen };
        } else if (isFolder(item)) {
          return { ...item, children: updateItem(item.children) };
        }
        return item;
      });
    };

    const updatedFileSystem = updateItem(fileSystem);
    setFileSystem(updatedFileSystem);
    setFilteredFileSystem(updateItem(filteredFileSystem));
  };

  const handleAddScene = () => {
    if (!newSceneName.trim()) return;

    const sceneName = newSceneName.endsWith(".py")
      ? newSceneName.slice(0, -3)
      : newSceneName;

    const className = sceneName
      .split(/[_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");

    const newFile: FileType = {
      id: `file-${Date.now()}`,
      name: `${sceneName}.py`,
      content: `from manim import *\n\nclass ${className}(Scene):\n    def construct(self):\n        circle = Circle()\n        self.play(Create(circle))`,
      type: "file",
    };

    // Find or create a scenes folder
    let scenesFolder = fileSystem.find(
      (item) => isFolder(item) && item.name === "scenes"
    ) as FolderType | undefined;

    if (!scenesFolder) {
      scenesFolder = {
        id: `folder-${Date.now()}`,
        name: "scenes",
        type: "folder",
        isOpen: true,
        children: [],
      };
      setFileSystem((prev) => [...prev, scenesFolder!]);
    }

    // Update the scenes folder with new file
    const updatedFileSystem = fileSystem.map((item) => {
      if (isFolder(item) && item.id === scenesFolder?.id) {
        return {
          ...item,
          children: [...item.children, newFile],
        };
      }
      return item;
    });

    setFileSystem(updatedFileSystem);
    onFileSelect(newFile);
    setIsAddingScene(false);
    setNewSceneName("");
  };

  const isPythonFile = (fileName: string) => {
    return fileName.toLowerCase().endsWith(".py");
  };

  const FileSystemItemComponent = ({
    item,
    depth = 0,
  }: {
    item: FileSystemItem;
    depth?: number;
  }) => {
    const isSelected = item.type === "file" && item.id === selectedFileId;

    return (
      <div>
        <div
          className={`flex items-center px-2 py-1 hover:bg-gray-700 rounded cursor-pointer ${isSelected ? "bg-blue-950 hover:bg-blue-700" : ""
            }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => !isFolder(item) && onFileSelect(item)}
        >
          {isFolder(item) ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(item.id);
                }}
                className="mr-1 p-0.5 hover:bg-gray-600 rounded"
              >
                {item.isOpen ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
              <Folder size={16} className="mr-2 text-blue-400" />
              <span className="flex-1">{item.name}</span>
            </>
          ) : (
            <>
              <div className="ml-5 mr-2">
                {isPythonFile(item.name) ? (
                  <PythonFileIcon />
                ) : (
                  <File size={16} className="text-gray-300" />
                )}
              </div>
              <span className="flex-1">{item.name}</span>
            </>
          )}
        </div>

        {isFolder(item) && item.isOpen && (
          <div>
            {item.children.map((child) => (
              <FileSystemItemComponent
                key={child.id}
                item={child}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col   text-white border-r border-gray-700 w-64">
      <div className="p-2 border-b border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">EXPLORER</h2>
          {onAddScene && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6 text-gray-400 hover:text-white"
              onClick={() => setIsAddingScene(true)}
              title="Add new scene"
            >
              <Plus size={16} />
            </Button>
          )}
        </div>

        {isAddingScene && (
          <div className="flex gap-2 mb-2">
            <Input
              autoFocus
              placeholder="Scene name"
              className="bg-gray-800 border-gray-700"
              value={newSceneName}
              onChange={(e) => setNewSceneName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddScene()}
            />
            <Button size="sm" onClick={handleAddScene}>
              Add
            </Button>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search files..."
            className="pl-8 bg-gray-800 border-gray-700 focus-visible:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {filteredFileSystem.length > 0 ? (
          filteredFileSystem.map((item) => (
            <FileSystemItemComponent key={item.id} item={item} />
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No files found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
