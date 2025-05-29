// @/lib/project-hook.ts

import { useState, useCallback, useEffect } from "react";

// File type interface (moved here)
interface FileType {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  sceneClass?: string;
  children?: FileType[];
  isOpen?: boolean;
}

interface UseProjectReturn {
  videoUrl: string | null;
  isExecuting: boolean;
  error: string | undefined;
  activeTab: string;
  prompt: string;
  isGenerating: boolean;
  conversation: { role: string; content: string; code?: string }[];
  fileSystem: FileType[];
  openFiles: FileType[];
  selectedFile: FileType | null;
  selectedScenes: string[];
  combineScenes: boolean;

  setVideoUrl: (url: string | null) => void;
  setActiveTab: (tab: string) => void;
  setPrompt: (prompt: string) => void;
  handleRunAnimation: () => Promise<void>;
  handleSaveCode: () => Promise<void>;
  handleDownload: () => void;
  handleSendMessage: (inputPrompt?: string) => Promise<string | undefined>;
  handleMultiSceneRun: () => Promise<void>;
  handleFileSelect: (file: FileType) => void;
  handleCloseFile: (fileId: string) => void;
  handleCodeChange: (newCode: string) => void;
  toggleFolder: (folderId: string) => void;
  setSelectedScenes: React.Dispatch<React.SetStateAction<string[]>>;
  setCombineScenes: React.Dispatch<React.SetStateAction<boolean>>;
}

const STORAGE_KEY = (id: string) => `project_${id}`;

// Initial File System Structure
const initialFileSystem: FileType[] = [
  {
    id: "scenes-folder",
    name: "scenes",
    type: "folder",
    isOpen: true,
    children: [
      {
        id: "scene-1",
        name: "intro.py",
        content: `from manim import *

class IntroScene(Scene):
    def construct(self):
        title = Text("Welcome to Manim", font_size=48)
        title.set_color_by_gradient(BLUE, GREEN)
        
        self.play(Write(title))
        self.wait(1)
        
        subtitle = Text("Create Beautiful Animations", font_size=24)
        subtitle.next_to(title, DOWN, buff=0.5)
        
        self.play(FadeIn(subtitle))
        self.wait(2)`,
        type: "file",
        sceneClass: "IntroScene",
      },
      {
        id: "scene-2",
        name: "math_demo.py",
        content: `from manim import *

class MathDemo(Scene):
    def construct(self):
        equation = MathTex(r"e^{i\pi} + 1 = 0")
        equation.scale(2)
        
        self.play(Write(equation))
        self.wait(1)
        
        explanation = Text("Euler's Identity")
        explanation.next_to(equation, UP, buff=1)
        
        self.play(FadeIn(explanation))
        self.wait(2)`,
        type: "file",
        sceneClass: "MathDemo",
      },
    ],
  },
  {
    id: "assets-folder",
    name: "assets",
    type: "folder",
    isOpen: false,
    children: [],
  },
];

export function useProject(params: { id: string }): UseProjectReturn {
  // Helper to find a file by ID in the fileSystem
  const findFileById = useCallback(
    (id: string, items: FileType[]): FileType | null => {
      for (const item of items) {
        if (item.type === "file" && item.id === id) {
          return item;
        } else if (item.type === "folder" && item.children) {
          const found = findFileById(id, item.children);
          if (found) return found;
        }
      }
      return null;
    },
    []
  );

  // Helper to update a file's content in the nested fileSystem
  const updateFileSystemContent = useCallback(
    (items: FileType[], fileId: string, newContent: string): FileType[] => {
      return items.map((item) => {
        if (item.id === fileId && item.type === "file") {
          return { ...item, content: newContent };
        } else if (item.type === "folder" && item.children) {
          return {
            ...item,
            children: updateFileSystemContent(
              item.children,
              fileId,
              newContent
            ),
          };
        }
        return item;
      });
    },
    []
  );

  // Helper to toggle folder isOpen state
  const toggleFolderState = useCallback(
    (items: FileType[], folderId: string): FileType[] => {
      return items.map((item) => {
        if (item.id === folderId && item.type === "folder") {
          return { ...item, isOpen: !item.isOpen };
        } else if (item.type === "folder" && item.children) {
          return {
            ...item,
            children: toggleFolderState(item.children, folderId),
          };
        }
        return item;
      });
    },
    []
  );

  // Project state
  const [fileSystem, setFileSystem] = useState<FileType[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY(params.id));
      if (saved) {
        try {
          const data = JSON.parse(saved);
          return data.fileSystem || initialFileSystem;
        } catch (e) {
          console.error("Error parsing saved fileSystem:", e);
        }
      }
    }
    return initialFileSystem;
  });

  const [openFiles, setOpenFiles] = useState<FileType[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY(params.id));
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.openFileIds && Array.isArray(data.openFileIds)) {
            // Reconstruct FileType objects from IDs
            return data.openFileIds
              .map((id: string) =>
                findFileById(id, data.fileSystem || initialFileSystem)
              )
              .filter(Boolean); // Filter out nulls
          }
        } catch (e) {
          console.error("Error parsing saved openFiles:", e);
        }
      }
    }
    return [];
  });

  const [selectedFile, setSelectedFile] = useState<FileType | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY(params.id));
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.selectedFileId) {
            // Reconstruct FileType object from ID
            return findFileById(
              data.selectedFileId,
              data.fileSystem || initialFileSystem
            );
          }
        } catch (e) {
          console.error("Error parsing saved selectedFile:", e);
        }
      }
    }
    return null;
  });

  const [selectedScenes, setSelectedScenes] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY(params.id));
      if (saved) {
        try {
          const data = JSON.parse(saved);
          return data.selectedScenes || [];
        } catch (e) {
          console.error("Error parsing saved selectedScenes:", e);
        }
      }
    }
    return [];
  });

  const [combineScenes, setCombineScenes] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY(params.id));
      if (saved) {
        try {
          const data = JSON.parse(saved);
          return data.combineScenes || false;
        } catch (e) {
          console.error("Error parsing saved combineScenes:", e);
        }
      }
    }
    return false;
  });

  const [videoUrl, setVideoUrl] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY(params.id));
      if (saved) {
        try {
          const data = JSON.parse(saved);
          return data.videoUrl || null;
        } catch (e) {
          console.error("Error parsing saved videoUrl:", e);
        }
      }
    }
    return null;
  });

  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string>();
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY(params.id));
      if (saved) {
        try {
          const data = JSON.parse(saved);
          return data.activeTab || "code";
        } catch (e) {
          console.error("Error parsing saved activeTab:", e);
        }
      }
    }
    return "code";
  });

  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversation, setConversation] = useState<
    { role: string; content: string; code?: string }[]
  >(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY(params.id));
      if (saved) {
        try {
          const data = JSON.parse(saved);
          return (
            data.conversation || [
              {
                role: "assistant",
                content:
                  "Hello! I'm your AI assistant. I can help you create animations with Manim. Just tell me what you'd like to animate.",
              },
            ]
          );
        } catch (e) {
          console.error("Error parsing saved conversation:", e);
        }
      }
    }
    return [
      {
        role: "assistant",
        content:
          "Hello! I'm your AI assistant. I can help you create animations with Manim. Just tell me what you'd like to animate.",
      },
    ];
  });

  // Initialize with first file selected if none is selected
  useEffect(() => {
    if (!selectedFile && fileSystem.length > 0) {
      const firstFile = findFileById("scene-1", fileSystem);
      if (firstFile) {
        setSelectedFile(firstFile);
        setOpenFiles([firstFile]);
      } else {
        const trySelectFirstFile = (items: FileType[]): FileType | null => {
          for (const item of items) {
            if (item.type === "file") return item;
            if (item.type === "folder" && item.children) {
              const found = trySelectFirstFile(item.children);
              if (found) return found;
            }
          }
          return null;
        };
        const fallbackFile = trySelectFirstFile(fileSystem);
        if (fallbackFile) {
          setSelectedFile(fallbackFile);
          setOpenFiles([fallbackFile]);
        }
      }
    }
  }, [fileSystem, selectedFile, findFileById]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = {
        videoUrl,
        activeTab,
        conversation,
        fileSystem,
        openFileIds: openFiles.map((f) => f.id),
        selectedFileId: selectedFile?.id || null,
        selectedScenes,
        combineScenes,
      };
      localStorage.setItem(STORAGE_KEY(params.id), JSON.stringify(data));
    }
  }, [
    videoUrl,
    activeTab,
    conversation,
    fileSystem,
    openFiles,
    selectedFile,
    selectedScenes,
    combineScenes,
    params.id,
  ]);

  // File system actions
  const handleFileSelect = useCallback(
    (file: FileType) => {
      setSelectedFile(file);
      if (!openFiles.some((f) => f.id === file.id)) {
        setOpenFiles((prev) => [...prev, file]);
      }
    },
    [openFiles]
  );

  const handleCloseFile = useCallback(
    (fileId: string) => {
      setOpenFiles((prev) => {
        const newFiles = prev.filter((f) => f.id !== fileId);
        if (selectedFile?.id === fileId && newFiles.length > 0) {
          setSelectedFile(newFiles[0]);
        } else if (selectedFile?.id === fileId) {
          setSelectedFile(null);
        }
        return newFiles;
      });
    },
    [selectedFile]
  );

  const handleCodeChange = useCallback(
    (newCode: string) => {
      if (!selectedFile) return;

      setFileSystem((prev) =>
        updateFileSystemContent(prev, selectedFile.id, newCode)
      );

      setSelectedFile((prev) => (prev ? { ...prev, content: newCode } : null));
    },
    [selectedFile, updateFileSystemContent]
  );

  const toggleFolder = useCallback(
    (folderId: string) => {
      setFileSystem((prev) => toggleFolderState(prev, folderId));
    },
    [toggleFolderState]
  );

  // Manim execution actions
  const handleRunAnimation = useCallback(async () => {
    if (!selectedFile && selectedScenes.length === 0) {
      setError("No file or scenes selected to run.");
      return;
    }

    setIsExecuting(true);
    setError(undefined);
    setActiveTab("preview");

    if (selectedScenes.length > 0) {
      // Multi-scene run
      const scenesToRun = selectedScenes
        .map((sceneId) => {
          const file = findFileById(sceneId, fileSystem);
          return {
            fileName: file?.name || "",
            className: file?.sceneClass || "",
            content: file?.content || "",
          };
        })
        .filter((scene) => scene.fileName && scene.content);

      try {
        const response = await fetch("/api/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scenes: scenesToRun,
            combineVideos: combineScenes,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || `HTTP error! status: ${response.status}`);
        } else if (data.videoUrl) {
          setVideoUrl(data.videoUrl);
          setError(undefined);
        } else {
          setError(
            data.error ||
              "An unknown error occurred during multi-scene execution."
          );
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(`Failed to execute multi-scene animation: ${errorMessage}`);
        console.error("Error executing multi-scene animation:", error);
      } finally {
        setIsExecuting(false);
      }
    } else if (selectedFile) {
      // Single file run
      try {
        const response = await fetch("/api/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: selectedFile.content || "" }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || `HTTP error! status: ${response.status}`);
        } else if (data.videoUrl) {
          setVideoUrl(data.videoUrl);
          setError(undefined);
        } else {
          setError(data.error || "An unknown error occurred during execution.");
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(`Failed to execute animation: ${errorMessage}`);
        console.error("Error executing animation:", error);
      } finally {
        setIsExecuting(false);
      }
    }
  }, [selectedFile, selectedScenes, combineScenes, findFileById, fileSystem]); // Dependencies updated

  const handleSaveCode = async () => {
    // In a real application, you'd send `selectedFile.content` and `selectedFile.id` to your backend.
    if (selectedFile) {
      console.log(
        `Saving file ${selectedFile.name} (simulated):`,
        selectedFile.content
      );
      alert(`File '${selectedFile.name}' saved (simulated)!`);
      // Example: fetch('/api/save-file', { method: 'POST', body: JSON.stringify({ id: selectedFile.id, content: selectedFile.content }) });
    } else {
      alert("No file selected to save.");
    }
  };

  const handleDownload = useCallback(() => {
    if (!videoUrl) {
      console.error("No video URL available for download");
      return;
    }

    try {
      const a = document.createElement("a");
      a.href = videoUrl;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `animation-${params.id || "export"}-${timestamp}.mp4`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading video:", error);
      setError("Failed to download video. Please try again.");
    }
  }, [videoUrl, params.id]);

  // AI chat actions
  const handleSendMessage = useCallback(
    async (inputPrompt?: string): Promise<string | undefined> => {
      const actualPrompt = inputPrompt?.trim() || prompt.trim();

      if (!actualPrompt) {
        console.warn("Attempted to send empty message.");
        return undefined;
      }

      // Prevent duplicate messages if user clicks multiple times
      if (!inputPrompt) {
        const lastMessage = conversation[conversation.length - 1];
        if (
          lastMessage?.role === "user" &&
          lastMessage?.content === actualPrompt
        ) {
          console.log("Duplicate manual chat message detected, skipping...");
          return undefined;
        }
      }

      const newUserMessage = { role: "user", content: actualPrompt };
      setConversation((prevConv) => [...prevConv, newUserMessage]);

      if (!inputPrompt) {
        setPrompt("");
      }

      setIsGenerating(true);
      setError(undefined);

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: actualPrompt,
            currentCode: selectedFile?.content || "", // Pass current file content
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.error ||
              `AI generation failed: HTTP error! status: ${response.status}`
          );
          setConversation((prevConv) => [
            ...prevConv,
            {
              role: "assistant",
              content: `Sorry, I encountered an error generating that: ${
                data.error || response.statusText
              }`,
            },
          ]);
          return undefined;
        } else if (data.code) {
          setConversation((prevConv) => [
            ...prevConv,
            {
              role: "assistant",
              content:
                data.explanation ||
                "Here's the animation code based on your request.",
              code: data.code,
            },
          ]);
          return data.code;
        } else {
          const assistantResponse = {
            role: "assistant",
            content:
              data.explanation ||
              "I'm having trouble generating that animation. Could you provide more details?",
          };
          setConversation((prevConv) => [...prevConv, assistantResponse]);
          return undefined;
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        console.error("Error generating code:", error);
        setConversation((prevConv) => [
          ...prevConv,
          {
            role: "assistant",
            content: `Sorry, I encountered a network error while trying to generate your animation code: ${errorMessage}`,
          },
        ]);
        setError(`Generation failed: ${errorMessage}`);
        return undefined;
      } finally {
        setIsGenerating(false);
      }
    },
    [prompt, conversation, selectedFile?.content] // Add selectedFile.content to dependencies
  );

  // handleMultiSceneRun is now integrated into handleRunAnimation
  const handleMultiSceneRun = useCallback(async () => {
    // This function can now simply call handleRunAnimation as all logic is combined
    await handleRunAnimation();
  }, [handleRunAnimation]);

  const handleSetVideoUrl = useCallback((url: string | null) => {
    setVideoUrl(url || null);
  }, []);

  return {
    videoUrl,
    isExecuting,
    error,
    activeTab,
    prompt,
    isGenerating,
    conversation,
    fileSystem,
    openFiles,
    selectedFile,
    selectedScenes,
    combineScenes,
    setVideoUrl: handleSetVideoUrl,
    setActiveTab,
    setPrompt,
    handleRunAnimation,
    handleSaveCode,
    handleDownload,
    handleSendMessage,
    handleMultiSceneRun,
    handleFileSelect,
    handleCloseFile,
    handleCodeChange,
    toggleFolder,
    setSelectedScenes,
    setCombineScenes,
  };
}
