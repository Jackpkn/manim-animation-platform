import { useState, useCallback, useEffect } from "react";

interface UseProjectReturn {
  videoUrl: string | null;
  isExecuting: boolean;
  error: string | undefined;
  activeTab: string;
  code: string;
  prompt: string; // This state is mainly for the chat input area within the ProjectPage
  isGenerating: boolean;
  conversation: { role: string; content: string; code?: string }[];
  setVideoUrl: (url: string | null) => void;
  setActiveTab: (tab: string) => void;
  setCode: (code: string) => void;
  setPrompt: (prompt: string) => void;
  handleRunAnimation: () => Promise<void>;
  handleSaveCode: () => Promise<void>;
  handleDownload: () => void;
  handleSendMessage: (inputPrompt?: string) => Promise<void>;
  handleMultiSceneRun: (
    scenes: { fileName: string; className: string; content: string }[],
    combineVideos: boolean
  ) => Promise<void>;
}

const STORAGE_KEY = (id: string) => `project_${id}`;

// params.id is currently unused in the hook for fetching data,
// but kept as per original signature.
export function useProject(params: { id: string }): UseProjectReturn {
  // Initialize state with values from localStorage if available
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

  const [code, setCode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY(params.id));
      if (saved) {
        try {
          const data = JSON.parse(saved);
          return data.code;
        } catch (e) {
          console.error("Error parsing saved code:", e);
        }
      }
    }
    return `from manim import *

class MyAnimation(Scene):
        def construct(self):
                # Your animation code here
                circle = Circle()
                self.play(Create(circle))
                self.wait(1)`;
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
        code,
        conversation,
      };
      localStorage.setItem(STORAGE_KEY(params.id), JSON.stringify(data));
    }
  }, [videoUrl, activeTab, code, conversation, params.id]);

  const handleRunAnimation = async () => {
    setIsExecuting(true);
    setError(undefined);
    setActiveTab("preview");

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || `HTTP error! status: ${response.status}`);
      } else if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
        setError(undefined); // Clear previous errors on success
      } else {
        // Handle cases where response is 200 but no videoUrl (e.g., validation error from API)
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
  };

  const handleSaveCode = async () => {
    console.log("Saving code:", code);
    // TODO: Implement actual save logic (API call to save to database)
    // This might involve params.id
    alert("Code saved (simulated)!"); // Placeholder
  };

  const handleDownload = () => {
    if (!videoUrl) {
      console.error("No video URL available for download");
      return;
    }

    try {
      // Create a temporary anchor element
      const a = document.createElement("a");
      a.href = videoUrl;

      // Generate a filename based on project ID and timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `animation-${params.id || "export"}-${timestamp}.mp4`;
      a.download = filename;

      // Append to body, click, and remove
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading video:", error);
      setError("Failed to download video. Please try again.");
    }
  };

  // Modified function to accept an optional inputPrompt and wrapped in useCallback
  const handleSendMessage = useCallback(
    async (inputPrompt?: string) => {
      // Determine which prompt to use: the argument or the state
      const actualPrompt = inputPrompt?.trim() || prompt.trim();

      if (!actualPrompt) {
        console.warn("Attempted to send empty message.");
        return; // Don't send empty messages
      }

      // IMPORTANT: The duplicate check inside handleSendMessage is tricky
      // when state updates happen rapidly. Rely primarily on the useEffect
      // logic in ProjectPage with the ref for the *initial* prompt.
      // This check is more useful for preventing double-clicks on the chat input send button.
      if (!inputPrompt) {
        // Only apply this check for manual chat messages from the chat input
        const lastMessage = conversation[conversation.length - 1];
        if (
          lastMessage?.role === "user" &&
          lastMessage?.content === actualPrompt
        ) {
          console.log("Duplicate manual chat message detected, skipping...");
          return;
        }
      }

      // Add user message to conversation immediately
      const newUserMessage = { role: "user", content: actualPrompt };

      // Use functional update to ensure we use the latest state
      setConversation((prevConv) => [...prevConv, newUserMessage]);

      // Only clear the stateful prompt if we used the state, not the argument
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
          body: JSON.stringify({ prompt: actualPrompt }),
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
        } else if (data.code) {
          setCode(data.code);
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
        } else {
          const assistantResponse = {
            role: "assistant",
            content:
              data.explanation ||
              "I'm having trouble generating that animation. Could you provide more details?",
          };
          setConversation((prevConv) => [...prevConv, assistantResponse]);
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
      } finally {
        setIsGenerating(false);
      }
    },
    [prompt, conversation, setConversation, setIsGenerating, setError, setCode]
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

  // Create a wrapper for setVideoUrl to handle undefined values
  const handleSetVideoUrl = useCallback((url: string | null) => {
    setVideoUrl(url || null);
  }, []);

  // Note: The hook currently doesn't load project data based on params.id on mount.
  // If you intend to save/load projects, you'll need to add a useEffect here
  // to fetch project data from your backend using params.id.

  return {
    videoUrl,
    isExecuting,
    error,
    activeTab,
    code,
    prompt,
    isGenerating,
    conversation,
    setVideoUrl: handleSetVideoUrl,
    setActiveTab,
    setCode,
    setPrompt,
    handleRunAnimation,
    handleSaveCode,
    handleDownload,
    handleSendMessage,
    handleMultiSceneRun,
  };
}
