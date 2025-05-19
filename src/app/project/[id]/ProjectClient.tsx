import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useProject } from "@/lib/project-hook";
import ProjectHeader from "@/components/project/ProjectHeader";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import IDE from "@/components/project/IDE";
import AnimationPreviewSection from "@/components/project/AnimationPreviewSection";
import type { Project } from "@/lib/drizzle-orm";
import AIChatSection from "@/components/project/AIChatSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectClientProps {
  project: Project;
}

export default function ProjectClient({ project }: ProjectClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPromptProcessed = useRef(false);

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
  } = useProject({ id: project.id.toString() });

  const initialPrompt = searchParams.get("initialPrompt");

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
      const currentPathWithoutQuery = `/project/${project.id}`;
      router.replace(currentPathWithoutQuery);
    }
  }, [
    initialPrompt,
    handleSendMessage,
    isGenerating,
    conversation.length,
    project.id,
    router,
  ]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <ProjectHeader
        projectId={project.id.toString()}
        onSave={handleSaveCode}
      />

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
