"use client";

import { useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, PlayCircle, Save, Download } from "lucide-react";

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
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Animation Project: {params.id}
          </h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleSaveCode}>
              <Save className="mr-2 h-4 w-4" />
              Save Project
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {conversation.map((message, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        message.role === "assistant"
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      <p>{message.content}</p>
                    </div>
                  ))}
                  {isGenerating && (
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
                        <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse delay-300"></div>
                        <span className="text-blue-600 dark:text-blue-400">
                          Generating response...
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Describe what animation you want to create..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[80px] resize-none"
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        e.shiftKey === false &&
                        prompt.trim()
                      ) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!prompt.trim() || isGenerating}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Code Editor</h2>
                  <Button onClick={handleRunAnimation} disabled={isExecuting}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Run Animation
                  </Button>
                </div>

                <div className="relative rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-[600px] p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Write your Manim code here..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="preview" className="flex-1 p-6 overflow-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Animation Preview</h2>
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    disabled={!videoUrl || isExecuting}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center">
                  {isExecuting ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-500 dark:text-gray-400">
                        Generating animation...
                      </p>
                    </div>
                  ) : error ? (
                    <div className="p-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md max-w-lg">
                      <p className="font-semibold mb-2">Error</p>
                      <p className="font-mono text-sm whitespace-pre-wrap">
                        {error}
                      </p>
                    </div>
                  ) : videoUrl ? (
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full rounded-md"
                    />
                  ) : (
                    <div className="text-center p-6">
                      <p className="text-gray-500 dark:text-gray-400 mb-2">
                        No animation yet
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm">
                        Run your code to see the preview here
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
