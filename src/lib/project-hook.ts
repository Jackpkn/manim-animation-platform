import { useState, useCallback, useEffect, use } from "react";
import type {
  AiProject,
  AiScene,
  GenerateManimProjectResponse,
} from "./gemini"; // Import new types

// File type interface (updated)
interface FileType {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  sceneClass?: string;
  description?: string; // New
  dependencies?: string[]; // New
  duration?: number; // New
  tags?: string[]; // New
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
  conversation: {
    role: string;
    content: string;
    code?: string;
    project?: AiProject;
  }[]; // Added project to conversation
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
  handleSendMessage: (inputPrompt?: string) => Promise<void>; // Return type changed
  handleMultiSceneRun: () => Promise<void>;
  handleFileSelect: (file: FileType) => void;
  handleCloseFile: (fileId: string) => void;
  handleCodeChange: (newCode: string) => void;
  toggleFolder: (folderId: string) => void;
  setSelectedScenes: React.Dispatch<React.SetStateAction<string[]>>;
  setCombineScenes: React.Dispatch<React.SetStateAction<boolean>>;
}

const STORAGE_KEY = (id: string) => `project_${id}`;
const SCENES_FOLDER_ID = "scenes-folder"; // Define a constant for the scenes folder ID

// Initial File System Structure - ensure "scenes" folder exists
const initialFileSystem: FileType[] = [
  {
    id: SCENES_FOLDER_ID,
    name: "scenes",
    type: "folder",
    isOpen: true,
    children: [
      {
        id: "scene-1", // Example initial file
        name: "intro_example.py",
        content: `from manim import *\n\nconfig.background_color = "#1C1C1C"\n\nclass IntroExample(Scene):\n    def construct(self):\n        title = Text("Manim Project Editor", font_size=48)\n        self.play(Write(title))\n        self.wait(1)`,
        type: "file",
        sceneClass: "IntroExample",
        description: "An example introductory scene.",
        dependencies: [],
        duration: 2,
        tags: ["example", "intro"],
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

// Helper to recursively update/add files in a specific folder
const updateFilesInFolder = (
  items: FileType[],
  targetFolderId: string,
  newSceneFiles: FileType[] // Files to add/replace
): FileType[] => {
  return items.map((item) => {
    if (item.id === targetFolderId && item.type === "folder") {
      // For simplicity, this example replaces all children in the target folder
      // with the new scene files. A more sophisticated merge/update could be implemented.
      // Or, filter out old AI generated files and add new ones.
      // This assumes newSceneFiles are complete representations of what should be in the folder from AI.

      // Simple strategy: remove existing files that have IDs matching new files, then add all new files.
      let existingChildren = item.children || [];
      const newSceneFileIds = new Set(newSceneFiles.map((f) => f.id));
      existingChildren = existingChildren.filter(
        (child) => !newSceneFileIds.has(child.id)
      );

      return {
        ...item,
        children: [...existingChildren, ...newSceneFiles], // Or just newSceneFiles to replace entirely
        isOpen: true, // Ensure folder is open
      };
    } else if (item.type === "folder" && item.children) {
      return {
        ...item,
        children: updateFilesInFolder(
          item.children,
          targetFolderId,
          newSceneFiles
        ),
      };
    }
    return item;
  });
};

export function useProject(params: Promise<{ id: string }>): UseProjectReturn {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const findFileById = useCallback(
    // ... (implementation remains the same)
    (id: string, items: FileType[]): FileType | null => {
      for (const item of items) {
        if (item.id === id) return item; // Can be file or folder
        if (item.type === "folder" && item.children) {
          const found = findFileById(id, item.children);
          if (found) return found;
        }
      }
      return null;
    },
    []
  );

  const [fileSystem, setFileSystem] = useState<FileType[]>(() => {
    // ... (localStorage loading logic for fileSystem)
    if (typeof window !== "undefined") {
      /* ... */
    }
    return initialFileSystem;
  });
  const [openFiles, setOpenFiles] = useState<FileType[]>(() => {
    // ... (localStorage loading logic for openFiles)
    if (typeof window !== "undefined") {
      /* ... */
    }
    return [];
  });
  const [selectedFile, setSelectedFile] = useState<FileType | null>(() => {
    // ... (localStorage loading logic for selectedFile)
    if (typeof window !== "undefined") {
      /* ... */
    }
    return null;
  });

  const [selectedScenes, setSelectedScenes] = useState<string[]>(() => {
    /* ... */ return [];
  });
  const [combineScenes, setCombineScenes] = useState<boolean>(() => {
    /* ... */ return false;
  });
  const [videoUrl, setVideoUrl] = useState<string | null>(() => {
    /* ... */ return null;
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string>();
  const [activeTab, setActiveTab] = useState(() => {
    /* ... */ return "code";
  });
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversation, setConversation] = useState<
    UseProjectReturn["conversation"]
  >(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY(projectId));
      if (saved) {
        try {
          const data = JSON.parse(saved);
          return (
            data.conversation ||
            [
              /* initial message */
            ]
          );
        } catch (e) {
          /* ... */
        }
      }
    }
    return [
      {
        role: "assistant",
        content: "Hello! How can I help you create a Manim animation today?",
      },
    ];
  });

  useEffect(() => {
    // Initialize with first file from "scenes" folder if available and none selected
    if (!selectedFile && fileSystem.length > 0) {
      const scenesFolder = findFileById(SCENES_FOLDER_ID, fileSystem);
      if (
        scenesFolder?.type === "folder" &&
        scenesFolder.children &&
        scenesFolder.children.length > 0
      ) {
        const firstSceneFile = scenesFolder.children.find(
          (child) => child.type === "file"
        );
        if (firstSceneFile) {
          setSelectedFile(firstSceneFile);
          if (!openFiles.some((f) => f.id === firstSceneFile.id)) {
            setOpenFiles((prev) => [...prev, firstSceneFile]);
          }
        }
      }
    }
  }, [fileSystem, selectedFile, openFiles, findFileById]);

  useEffect(() => {
    // Save state to localStorage
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
      localStorage.setItem(STORAGE_KEY(projectId), JSON.stringify(data));
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
    projectId,
  ]);

  const updateFileDetails = useCallback(
    (fileId: string, updateFn: (file: FileType) => FileType) => {
      // ... (updateFileInSystemRecursively remains useful for single file updates)
      // This helper needs to be defined as in your previous version or adapted.
      const recursiveUpdate = (items: FileType[]): FileType[] => {
        return items.map((item) => {
          if (item.id === fileId) return updateFn(item);
          if (item.children)
            return { ...item, children: recursiveUpdate(item.children) };
          return item;
        });
      };
      setFileSystem((prev) => recursiveUpdate(prev));
      setSelectedFile((prev) => (prev?.id === fileId ? updateFn(prev) : prev));
      setOpenFiles((prev) =>
        prev.map((f) => (f.id === fileId ? updateFn(f) : f))
      );
    },
    []
  );

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
      setOpenFiles((prev) => prev.filter((f) => f.id !== fileId));
      if (selectedFile?.id === fileId) {
        setSelectedFile(openFiles.find((f) => f.id !== fileId) || null);
      }
    },
    [selectedFile, openFiles]
  );
  const toggleFolder = useCallback((folderId: string) => {
    setFileSystem((prev) =>
      prev.map((item) => {
        if (item.id === folderId) {
          return { ...item, isOpen: !item.isOpen };
        }
        if (item.children) {
          return {
            ...item,
            children: item.children.map((child) =>
              child.id === folderId
                ? { ...child, isOpen: !child.isOpen }
                : child
            ),
          };
        }
        return item;
      })
    );
  }, []);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      if (!selectedFile) return;
      updateFileDetails(selectedFile.id, (file) => ({
        ...file,
        content: newCode,
      }));
    },
    [selectedFile, updateFileDetails]
  );

  const handleRunAnimation = useCallback(async () => {
    /* ... same as before, uses selectedFile/selectedScenes */
  }, [selectedFile, selectedScenes]);
  const handleSaveCode = async () => {
    /* ... */
  };
  const handleDownload = useCallback(() => {
    /* ... */
  }, []);

  const handleSendMessage = useCallback(
    async (inputPrompt?: string): Promise<void> => {
      const actualPrompt = inputPrompt?.trim() || prompt.trim();
      if (!actualPrompt) return;

      const newUserMessage = { role: "user", content: actualPrompt };
      setConversation((prevConv) => [...prevConv, newUserMessage]);
      if (!inputPrompt) setPrompt("");
      setIsGenerating(true);
      setError(undefined);

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: actualPrompt }), // currentCode not sent for project generation
        });

        // The backend now returns GenerateManimProjectResponse
        const data: GenerateManimProjectResponse = await response.json();

        if (!response.ok) {
          setError(
            data.explanation || `HTTP error! status: ${response.status}`
          );
          setConversation((prevConv) => [
            ...prevConv,
            {
              role: "assistant",
              content: `Sorry, error: ${
                data.explanation || response.statusText
              }`,
            },
          ]);
          return;
        }

        // Add AI's explanation to conversation
        const assistantMessage: UseProjectReturn["conversation"][0] = {
          role: "assistant",
          content: data.explanation,
        };
        if (data.project) {
          assistantMessage.project = data.project; // Store the project structure in conversation for potential display
        }
        setConversation((prevConv) => [...prevConv, assistantMessage]);

        if (data.project && data.project.scenes.length > 0) {
          const newFileItems: FileType[] = data.project.scenes.map(
            (scene: AiScene) => ({
              id: scene.id,
              name: scene.name,
              type: "file",
              content: scene.content,
              sceneClass: scene.sceneClass,
              description: scene.description,
              dependencies: scene.dependencies,
              duration: scene.duration,
              tags: scene.tags,
              isOpen: false, // Or determine based on logic
            })
          );

          setFileSystem((prevFileSystem) =>
            updateFilesInFolder(prevFileSystem, SCENES_FOLDER_ID, newFileItems)
          );

          // Open all new files and select the first one
          setOpenFiles((prevOpenFiles) => {
            const existingOpenIds = new Set(prevOpenFiles.map((f) => f.id));
            const filesToOpen = newFileItems.filter(
              (nf) => !existingOpenIds.has(nf.id)
            );
            return [...prevOpenFiles, ...filesToOpen];
          });
          setSelectedFile(newFileItems[0]); // Select the first generated file

          // Handle combined output
          if (data.project.combinedOutput.shouldCombine) {
            setSelectedScenes(data.project.scenes.map((s) => s.id));
            setCombineScenes(true);
          } else {
            // Optionally clear selected scenes or set to just the first one
            setSelectedScenes([newFileItems[0].id]);
            setCombineScenes(false);
          }

          // Log assets for now
          if (data.project.assets.length > 0) {
            console.log("AI suggested assets:", data.project.assets);
            // You could add another message to conversation about assets
          }
        } else if (data.project && data.project.scenes.length === 0) {
          // AI provided a project structure but no scenes
          console.warn("AI returned a project structure with no scenes.");
        }
        // If no project, the explanation is already added to conversation.
      } catch (e: unknown) {
        const errorMessage =
          e instanceof Error ? e.message : "Unknown error occurred";
        console.error("Error processing AI response:", e);
        setConversation((prevConv) => [
          ...prevConv,
          {
            role: "assistant",
            content: `Sorry, an error occurred while processing the response: ${errorMessage}`,
          },
        ]);
        setError(`Processing failed: ${errorMessage}`);
      } finally {
        setIsGenerating(false);
      }
    },
    [prompt, conversation /* projectId is implicitly handled by STORAGE_KEY */]
  );

  const handleMultiSceneRun = useCallback(async () => {
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
