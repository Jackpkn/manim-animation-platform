import { useState } from "react";

interface UseProjectReturn {
  videoUrl: string | undefined;
  isExecuting: boolean;
  error: string | undefined;
  activeTab: string;
  code: string;
  prompt: string;
  isGenerating: boolean;
  conversation: { role: string; content: string }[];
  setVideoUrl: (url: string | undefined) => void;
  setActiveTab: (tab: string) => void;
  setCode: (code: string) => void;
  setPrompt: (prompt: string) => void;
  handleRunAnimation: () => Promise<void>;
  handleSaveCode: () => Promise<void>;
  handleDownload: () => void;
  handleSendMessage: () => Promise<void>;
}

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
  const [prompt, setPrompt] = useState("");
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

      if (data.error) {
        setError(data.error);
      } else if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
      }
    } catch (error) {
      setError("Failed to execute animation");
      console.error("Error executing animation:", error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSaveCode = async () => {
    console.log("Saving code:", code);
  };

  const handleDownload = () => {
    if (videoUrl) {
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = `animation-${params.id}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleSendMessage = async () => {
    if (!prompt.trim()) return;

    const newMessage = { role: "user", content: prompt };
    setConversation([...conversation, newMessage]);
    setPrompt("");

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: newMessage.content }),
      });

      const data = await response.json();

      if (data.code) {
        setCode(data.code);
        setConversation([
          ...conversation,
          newMessage,
          {
            role: "assistant",
            content: data.explanation || "Here's the animation you requested.",
            code: data.code,
          },
        ]);
      } else {
        setConversation([
          ...conversation,
          newMessage,
          {
            role: "assistant",
            content:
              "I'm having trouble generating that animation. Could you provide more details?",
          },
        ]);
      }
    } catch (error) {
      console.error("Error generating code:", error);
      setConversation([
        ...conversation,
        newMessage,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error while trying to generate your animation code.",
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

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
