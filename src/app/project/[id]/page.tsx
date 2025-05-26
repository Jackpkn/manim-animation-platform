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
import { cn } from "@/lib/utils";

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
    handleMultiSceneRun,
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
    <div className="h-screen flex flex-col bg-[#141413] dark:bg-[#141413]">
      <ProjectHeader projectId={params.id} onSave={handleSaveCode} />

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={35} minSize={20} maxSize={40}>
            {" "}
            {/* Adjusted default and min/max sizes */}
            <AIChatSection
              conversation={conversation}
              isGenerating={isGenerating}
              prompt={prompt}
              onPromptChange={(value: string) => setPrompt(value)}
              onSendMessage={() => handleSendMessage()}
            />
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={65} minSize={60}>
            {" "}
            {/* Adjusted default size */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <div className="px-6 pt-4 border-b border-gray-200 dark:border-gray-700">
                <TabsList className="flex space-x-2">
                  <TabsTrigger
                    value="code"
                    className={cn(
                      "data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100",
                      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 px-3 h-9"
                    )}
                  >
                    Code Editor
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className={cn(
                      "data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100",
                      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 px-3 h-9"
                    )}
                  >
                    Preview
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="code" className="flex-1 overflow-auto">
                {" "}
                {/* Added overflow-auto for scrollable content */}
                <div className="h-full flex flex-col">
                  {" "}
                  {/* Added a container for the IDE */}
                  <IDE
                    code={code}
                    onCodeChange={setCode}
                    onRunAnimation={handleRunAnimation}
                    isExecuting={isExecuting}
                    onMultiSceneRun={handleMultiSceneRun} // Corrected: Using the correct onMultiSceneRun function
                  />
                </div>
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
