import { useState, useCallback, useEffect } from "react";

interface UseProjectReturn {
  videoUrl: string | null;
  isExecuting: boolean;
  error: string | undefined;
  activeTab: string;
  prompt: string;
  isGenerating: boolean;
  conversation: { role: string; content: string; code?: string }[];
  setVideoUrl: (url: string | null) => void;
  setActiveTab: (tab: string) => void;
  setPrompt: (prompt: string) => void;
  handleRunAnimation: (currentFileContent: string) => Promise<void>;
  handleSaveCode: () => Promise<void>;
  handleDownload: () => void;
  handleSendMessage: (
    inputPrompt?: string,
    currentFileContent?: string
  ) => Promise<string | undefined>;
  handleMultiSceneRun: (
    scenes: { fileName: string; className: string; content: string }[],
    combineVideos: boolean
  ) => Promise<void>;
}

const STORAGE_KEY = (id: string) => `project_${id}`;

export function useProject(params: { id: string }): UseProjectReturn {
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

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = {
        videoUrl,
        activeTab,
        conversation,
      };
      localStorage.setItem(STORAGE_KEY(params.id), JSON.stringify(data));
    }
  }, [videoUrl, activeTab, conversation, params.id]);

  // MODIFIED: Accepts currentFileContent as an argument
  const handleRunAnimation = useCallback(async (currentFileContent: string) => {
    setIsExecuting(true);
    setError(undefined);
    setActiveTab("preview");

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: currentFileContent }),
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
      // Catch network errors etc.
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(`Failed to execute animation: ${errorMessage}`);
      console.error("Error executing animation:", error);
    } finally {
      setIsExecuting(false);
    }
  }, []); // Dependencies are now empty, as it takes content as an argument

  const handleSaveCode = async () => {
    console.log(
      "Saving code (simulated - actual code needs to be passed from ProjectPage's selectedFile): TODO"
    );
    // TODO: Implement actual save logic (API call to save to database)
    // This might involve params.id and the current selected file's content
    alert("Code saved (simulated)!"); // Placeholder
  };

  const handleDownload = () => {
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
  };

  // MODIFIED: Accepts inputPrompt and currentFileContent, returns generated code
  const handleSendMessage = useCallback(
    async (
      inputPrompt?: string,
      currentFileContent?: string
    ): Promise<string | undefined> => {
      const actualPrompt = inputPrompt?.trim() || prompt.trim();

      if (!actualPrompt) {
        console.warn("Attempted to send empty message.");
        return undefined; // Don't send empty messages
      }

      // This check is useful for preventing double-clicks on the chat input send button.
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
      // Use functional update to ensure we use the latest state
      setConversation((prevConv) => [...prevConv, newUserMessage]);

      if (!inputPrompt) {
        setPrompt(""); // Clear the chat input state if user typed it manually
      }

      setIsGenerating(true);
      setError(undefined); // Clear previous errors

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // Pass current code for AI context if available
          body: JSON.stringify({
            prompt: actualPrompt,
            currentCode: currentFileContent,
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
          return undefined; // Indicate failure to caller
        } else if (data.code) {
          // DO NOT setCode here. Return the generated code to the caller (ProjectPage)
          // so ProjectPage can update the specific selected file's content.
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
          return data.code; // Return the generated code
        } else {
          const assistantResponse = {
            role: "assistant",
            content:
              data.explanation ||
              "I'm having trouble generating that animation. Could you provide more details?",
          };
          setConversation((prevConv) => [...prevConv, assistantResponse]);
          return undefined; // Indicate no code was generated
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
        return undefined; // Indicate failure
      } finally {
        setIsGenerating(false);
      }
    },
    [prompt, conversation, setConversation, setIsGenerating, setError]
  );

  const handleMultiSceneRun = useCallback(
    async (
      scenes: { fileName: string; className: string; content: string }[],
      combineVideos: boolean
    ) => {
      setIsExecuting(true);
      setError(undefined);
      setActiveTab("preview");

      try {
        const response = await fetch("/api/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ scenes, combineVideos }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || `HTTP error! status: ${response.status}`);
        } else if (data.videoUrl) {
          setVideoUrl(data.videoUrl);
          setError(undefined); // Clear previous errors on success
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
    },
    [setIsExecuting, setError, setActiveTab, setVideoUrl]
  );

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
    setVideoUrl: handleSetVideoUrl,
    setActiveTab,
    setPrompt,
    handleRunAnimation,
    handleSaveCode,
    handleDownload,
    handleSendMessage,
    handleMultiSceneRun,
  };
}
