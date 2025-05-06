"use client";

import { useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeEditor from "@/components/CodeEditor";
import Preview from "@/components/Preview";

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [videoUrl, setVideoUrl] = useState<string>();
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string>();

  const handleRunAnimation = async (code: string) => {
    setIsExecuting(true);
    setError(undefined);

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

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Project {params.id}
        </h1>
      </header>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full p-4">
              <Tabs defaultValue="ai" className="h-full">
                <TabsList>
                  <TabsTrigger value="ai">AI Assistant</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                </TabsList>
                <TabsContent value="ai" className="h-[calc(100%-40px)]">
                  <div className="h-full bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    {/* AI Assistant content will go here */}
                    <p className="text-gray-600 dark:text-gray-400">
                      AI Assistant will help you create animations...
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="code" className="h-[calc(100%-40px)]">
                  <CodeEditor
                    onRun={handleRunAnimation}
                    onSave={function (code: string): void {
                      throw new Error("Function not implemented.");
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full p-4">
              <Preview
                videoUrl={videoUrl}
                isExecuting={isExecuting}
                error={error}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
