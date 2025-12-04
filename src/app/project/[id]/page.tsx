"use client";
import React, { useCallback } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Play,
  Download,
  Save,
  MessageSquare,
  Settings,
  Layers,
  Video,
  Sparkles,
  Film,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CodeEditorSection from "@/components/project/CodeEditorSection";
import AIChatSection from "@/components/project/AIChatSection";
import SceneList from "@/components/project/SceneList";
import { useProject } from "@/lib/project-hook";
import Image from "next/image";

// Chat message component
const ChatMessage = ({
  message,
  isUser,
}: {
  message: { content: string; code?: string; role: string };
  isUser: boolean;
}) => {
  return (
    <div className={`p-4 ${isUser ? "bg-slate-800/50" : "bg-slate-700/30"}`}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
            isUser
              ? "bg-blue-500"
              : "bg-gradient-to-br from-purple-500 to-pink-500"
          )}
        >
          {isUser ? (
            <span className="text-white text-sm font-medium">U</span>
          ) : (
            <MessageSquare className="w-4 h-4 text-white" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-slate-200 text-sm leading-relaxed">
            {message.content}
          </p>
          {message.code && (
            <div className="bg-slate-900 rounded-lg p-3 border border-slate-700">
              <pre className="text-sm text-slate-300 overflow-x-auto">
                <code>{message.code}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function EnhancedProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const {
    videoUrl,
    isExecuting,
    error,
    activeTab,
    prompt,
    isGenerating,
    conversation,
    fileSystem,
    selectedFile,
    selectedScenes,
    combineScenes,
    setActiveTab,
    setPrompt,
    handleRunAnimation,
    handleSaveCode,
    handleDownload,
    handleSendMessage,
    handleFileSelect,
    handleCodeChange,
    setSelectedScenes,
    setCombineScenes,
  } = useProject(params);

  const handleRunAnimationClick = async () => {
    await handleRunAnimation();
  };

  const handleSendMessageClick = async () => {
    await handleSendMessage();
  };

  const handleUseCode = useCallback(
    (code: string) => {
      handleCodeChange(code);
    },
    [handleCodeChange]
  );

  const handleToggleSceneSelection = (fileId: string, selected: boolean) => {
    setSelectedScenes((prev) =>
      selected
        ? [...prev, fileId]
        : prev.filter((id) => id !== fileId)
    );
  };

  // Extract scenes from file system
  const scenesFolder = fileSystem.find((f) => f.id === "scenes-folder");
  const sceneFiles = scenesFolder?.children || [];

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-blue-500/30">
      {/* Header */}
      <div className="h-14 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-slate-100">Manim</span>
            <span className="text-blue-400">Studio</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 p-1">
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "h-7 px-3 text-xs gap-2 hover:bg-slate-800",
                combineScenes && "bg-blue-600/10 text-blue-400 hover:bg-blue-600/20"
              )}
              onClick={() => setCombineScenes(!combineScenes)}
            >
              <Film className="w-3.5 h-3.5" />
              {combineScenes ? "Combine Mode: ON" : "Combine Mode: OFF"}
            </Button>
          </div>

          <div className="h-6 w-px bg-slate-800 mx-2" />

          <Button
            size="sm"
            variant="ghost"
            className="gap-2 text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={handleSaveCode}
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Sidebar: Scene List & Assets */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-slate-900 border-r border-slate-800">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Scenes
                </h3>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                  {sceneFiles.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto">
                <SceneList
                  files={sceneFiles}
                  selectedFileId={selectedFile?.id || null}
                  selectedScenes={selectedScenes}
                  onSelectFile={handleFileSelect}
                  onToggleSceneSelection={handleToggleSceneSelection}
                  onRunScene={(file) => {
                    handleFileSelect(file);
                    // We need to ensure the state updates before running, 
                    // but for now let's just select it. The user can hit run.
                    // Ideally we'd have a direct "run this file" action.
                  }}
                />
              </div>

              {/* Generate New Scene Button */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <Button
                  className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-900/20"
                  onClick={() => {
                    // Focus chat input
                    const chatInput = document.querySelector('textarea[placeholder="Ask AI to change code..."]') as HTMLTextAreaElement;
                    if (chatInput) chatInput.focus();
                  }}
                >
                  <Wand2 className="w-4 h-4" />
                  New Scene with AI
                </Button>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-slate-800 hover:bg-blue-500/50 transition-colors" />

          {/* Center: Code Editor & Preview */}
          <ResizablePanel defaultSize={50} minSize={30} className="bg-slate-950">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <div className="border-b border-slate-800 bg-slate-900/30 px-4">
                <TabsList className="bg-transparent h-12 w-full justify-start gap-6 p-0">
                  <TabsTrigger
                    value="code"
                    className="data-[state=active]:bg-transparent data-[state=active]:text-blue-400 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-400 rounded-none px-0 pb-3 pt-3 gap-2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Image src="/python.svg" className="opacity-70" alt="python" width={16} height={16} />
                      Code Editor
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className="data-[state=active]:bg-transparent data-[state=active]:text-purple-400 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-400 rounded-none px-0 pb-3 pt-3 gap-2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="code" className="flex-1 flex flex-col m-0 overflow-hidden relative">
                {selectedFile ? (
                  <>
                    <div className="flex-1 overflow-hidden">
                      <CodeEditorSection
                        code={selectedFile.content || ""}
                        onCodeChange={handleCodeChange}
                        language="python"
                      />
                    </div>

                    {/* Floating Run Button */}
                    <div className="absolute bottom-6 right-6 z-10">
                      <Button
                        onClick={handleRunAnimationClick}
                        disabled={isExecuting}
                        size="lg"
                        className={cn(
                          "gap-2 shadow-xl transition-all duration-300 rounded-full pl-6 pr-8 h-14",
                          selectedScenes.length > 1
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105"
                            : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 hover:scale-105"
                        )}
                      >
                        {isExecuting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="font-semibold">Rendering...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 fill-current" />
                            <div className="flex flex-col items-start text-xs">
                              <span className="font-bold text-sm">
                                {selectedScenes.length > 1 ? "Render Sequence" : "Render Scene"}
                              </span>
                              <span className="opacity-80 font-normal">
                                {selectedScenes.length > 1 ? `${selectedScenes.length} scenes selected` : "Current scene"}
                              </span>
                            </div>
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-500">
                    <p>Select a scene to edit code</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="preview" className="flex-1 m-0 p-0 bg-black flex flex-col items-center justify-center relative">
                {isExecuting ? (
                  <div className="text-center space-y-6">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                      <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-blue-400 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">Rendering Animation</h3>
                      <p className="text-slate-400">Manim is calculating frames...</p>
                    </div>
                  </div>
                ) : videoUrl ? (
                  <div className="w-full h-full flex flex-col">
                    <div className="flex-1 relative group">
                      <video
                        src={videoUrl}
                        controls
                        className="w-full h-full object-contain bg-black"
                      />
                    </div>
                    <div className="h-16 border-t border-slate-800 bg-slate-900 flex items-center justify-between px-6">
                      <div className="text-sm text-slate-400">
                        Preview Mode
                      </div>
                      <Button
                        variant="outline"
                        className="gap-2 border-slate-700 hover:bg-slate-800 text-slate-300"
                        onClick={handleDownload}
                      >
                        <Download className="w-4 h-4" />
                        Download MP4
                      </Button>
                    </div>
                  </div>
                ) : error ? (
                  <div className="max-w-md mx-auto p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-6 h-6 text-red-400" />
                    </div>
                    <h3 className="text-red-400 font-semibold mb-2">Rendering Failed</h3>
                    <p className="text-red-300/80 text-sm">{error}</p>
                  </div>
                ) : (
                  <div className="text-center space-y-4 opacity-50">
                    <Video className="w-20 h-20 mx-auto text-slate-600" />
                    <p className="text-slate-400">Run the code to generate a preview</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-slate-800 hover:bg-blue-500/50 transition-colors" />

          {/* Right Sidebar: AI Assistant */}
          <ResizablePanel defaultSize={30} minSize={20} className="bg-slate-900 border-l border-slate-800">
            <AIChatSection
              conversation={conversation}
              isGenerating={isGenerating}
              prompt={prompt}
              onPromptChange={setPrompt}
              onSendMessage={handleSendMessageClick}
              onUseCode={handleUseCode}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
