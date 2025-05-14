"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import AIChatSection from "@/components/project/AIChatSection";
import AnimationPreviewSection from "@/components/project/AnimationPreviewSection";
import ProjectHeader from "@/components/project/ProjectHeader";
import { useProject } from "@/lib/project-hook";
import IDE from "@/components/project/IDE";

interface ProjectParams {
  id: string;
}

export default function ProjectPage({ params }: { params: ProjectParams }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const {
    isExecuting,
    error,
    activeTab,
    code,
    prompt,
    isGenerating,
    conversation,
    setActiveTab,
    setCode,
    setPrompt,
    handleRunAnimation,
    handleSaveCode,
    handleDownload,
    handleSendMessage,
  } = useProject(params);

  const initialPrompt = searchParams.get("initialPrompt");
  const initialPromptProcessed = useRef(false);

  useEffect(() => {
    if (
      initialPrompt &&
      !initialPromptProcessed.current &&
      !isGenerating &&
      conversation.length <= 1
    ) {
      console.log(
        "ProjectPage: Processing initial prompt from URL:",
        initialPrompt
      );
      initialPromptProcessed.current = true;
      handleSendMessage(initialPrompt);
      const currentPathWithoutQuery = `/project/${params.id}`;
      router.replace(currentPathWithoutQuery);
    }
  }, [
    initialPrompt,
    handleSendMessage,
    isGenerating,
    conversation.length,
    params.id,
    router,
  ]);

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
              onSendMessage={() => handleSendMessage()}
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
                <IDE
                  code={code}
                  onCodeChange={setCode}
                  onRunAnimation={handleRunAnimation}
                  isExecuting={isExecuting}
                />
              </TabsContent>

              <TabsContent value="preview" className="flex-1 p-6 overflow-auto">
                <AnimationPreviewSection
                  isExecuting={isExecuting}
                  onDownload={handleDownload}
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
