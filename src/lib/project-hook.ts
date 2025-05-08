import { useState, useCallback } from "react";

interface UseProjectReturn {
  videoUrl: string | undefined;
  isExecuting: boolean;
  error: string | undefined;
  activeTab: string;
  code: string;
  prompt: string; // This state is mainly for the chat input area within the ProjectPage
  isGenerating: boolean;
  conversation: { role: string; content: string; code?: string }[];
  setVideoUrl: (url: string | undefined) => void;
  setActiveTab: (tab: string) => void;
  setCode: (code: string) => void;
  setPrompt: (prompt: string) => void;
  handleRunAnimation: () => Promise<void>;
  handleSaveCode: () => Promise<void>;
  handleDownload: () => void;
  handleSendMessage: (inputPrompt?: string) => Promise<void>;
}

// params.id is currently unused in the hook for fetching data,
// but kept as per original signature.
export function useProject(params: { id: string }): UseProjectReturn {
  const [videoUrl, setVideoUrl] = useState<string>();
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string>();
  const [activeTab, setActiveTab] = useState("code");
  const [code, setCode] = useState(`from manim import *

class MyAnimation(Scene):
        def construct(self):
                # Your animation code here
                circle = Circle()
                self.play(Create(circle))
                self.wait(1)`);
  const [prompt, setPrompt] = useState(""); // State for the chat input within the page
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversation, setConversation] = useState<
    { role: string; content: string; code?: string }[]
  >([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI assistant. I can help you create animations with Manim. Just tell me what you'd like to animate.",
    },
  ]);

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
    } catch (error: any) {
      // Catch network errors etc.
      setError(`Failed to execute animation: ${error.message}`);
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
    if (videoUrl) {
      const a = document.createElement("a");
      a.href = videoUrl;
      // Suggest a filename based on project ID or a generic name
      a.download = `animation-${params.id || "export"}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert("No video preview available to download.");
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
          body: JSON.stringify({ prompt: actualPrompt }), // Send the actual prompt
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle API errors (e.g., rate limiting, internal server error from AI)
          setError(
            data.error ||
              `AI generation failed: HTTP error! status: ${response.status}`
          );
          setConversation((prevConv) => [
            // Use functional update for reliability
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
            // Use functional update for reliability
            ...prevConv, // Keep previous messages (including the one just added above)
            {
              role: "assistant",
              content:
                data.explanation ||
                "Here's the animation code based on your request.",
              code: data.code, // Include code in conversation for display
            },
          ]);
        } else {
          // Handle successful response but no code (e.g., AI couldn't understand)
          const assistantResponse = {
            role: "assistant",
            content:
              data.explanation ||
              "I'm having trouble generating that animation. Could you provide more details?",
          };
          setConversation((prevConv) => [...prevConv, assistantResponse]); // Use functional update for reliability
        }
      } catch (error: any) {
        // Catch network errors etc.
        console.error("Error generating code:", error);
        setConversation((prevConv) => [
          // Use functional update for reliability
          ...prevConv,
          {
            role: "assistant",
            content: `Sorry, I encountered a network error while trying to generate your animation code: ${error.message}`,
          },
        ]);
        setError(`Generation failed: ${error.message}`);
      } finally {
        setIsGenerating(false);
      }
    },
    [prompt, conversation, setConversation, setIsGenerating, setError, setCode]
  ); // Dependencies for useCallback

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
    setVideoUrl,
    setActiveTab,
    setCode,
    setPrompt,
    handleRunAnimation,
    handleSaveCode,
    handleDownload,
    handleSendMessage,
  };
}
