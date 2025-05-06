import React, { useState, useEffect } from "react";
import { Folder, File, ChevronRight, ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// File system types (keep your existing types)
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
  children: (FileType | FolderType)[];
};

export type FileSystemItem = FileType | FolderType;

const isFolder = (item: FileSystemItem): item is FolderType => {
  return item.type === "folder";
};

interface FileExplorerProps {
  fileSystem: FileSystemItem[];
  onFileSelect: (file: FileType) => void;
  selectedFileId: string | null;
}

export default function FileExplorer({
  fileSystem,
  onFileSelect,
  selectedFileId,
}: FileExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFileSystem, setFilteredFileSystem] =
    useState<FileSystemItem[]>(fileSystem);

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
    setFilteredFileSystem(updatedFileSystem);
  };

  // File/Folder item component
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
          className={`flex items-center px-2 py-1 hover:bg-gray-700 rounded cursor-pointer ${
            isSelected ? "bg-blue-800 hover:bg-blue-700" : ""
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isFolder(item) ? (
            <>
              <button
                onClick={() => toggleFolder(item.id)}
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
              <File size={16} className="ml-5 mr-2 text-gray-300" />
              <span
                className="flex-1"
                onClick={() => item.type === "file" && onFileSelect(item)}
              >
                {item.name}
              </span>
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
    <div className="h-full flex flex-col bg-gray-900 text-white border-r border-gray-700 w-64">
      <div className="p-2 border-b border-gray-700">
        <h2 className="font-semibold mb-2">EXPLORER</h2>
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
            No files found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
