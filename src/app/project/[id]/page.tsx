"use client";

import { useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import AIChatSection from "@/components/project/AIChatSection";
import AnimationPreviewSection from "@/components/project/AnimationPreviewSection";
import CodeEditorSection from "@/components/project/CodeEditorSection";
import ProjectHeader from "@/components/project/ProjectHeader";

export default function ProjectPage({ params }: { params: { id: string } }) {
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
    { role: string; content: string }[]
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
    // Implement save functionality
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

    // Simulate AI response
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
            content: `I've created the code for your animation. You can see it in the code tab and run it to preview the result.`,
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

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <ProjectHeader projectId={params.id} onSave={handleSaveCode} />

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={40} minSize={30}>
            <AIChatSection
              conversation={conversation}
              isGenerating={isGenerating}
              prompt={prompt}
              onPromptChange={(value: string) => setPrompt(value)}
              onSendMessage={handleSendMessage}
            />
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={60} minSize={40}>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <div className="px-6 pt-4 border-b border-gray-200 dark:border-gray-700">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="code">Code Editor</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="code" className="flex-1 p-6 overflow-auto">
                <CodeEditorSection
                  code={code}
                  onCodeChange={(value) => setCode(value)}
                  onRunAnimation={handleRunAnimation}
                  isExecuting={isExecuting}
                />
              </TabsContent>

              <TabsContent value="preview" className="flex-1 p-6 overflow-auto">
                <AnimationPreviewSection
                  isExecuting={isExecuting}
                  onDownload={handleDownload}
                  videoUrl={videoUrl}
                  error={error}
                />
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
