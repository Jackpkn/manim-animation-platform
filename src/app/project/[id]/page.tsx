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
  File,
  X,
  Play,
  Download,
  Save,
  Plus,
  Folder,
  FolderOpen,
  Code,
  Eye,
  MessageSquare,
  Settings,
  Layers,
  Video,
  Sparkles,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CodeEditorSection from "@/components/project/CodeEditorSection";
import AIChatSection from "@/components/project/AIChatSection";
import { useProject } from "@/lib/project-hook"; // Import useProject hook

// File type interface (removed from here, now in useProject.ts)
interface FileType {
  // Re-declare for local type usage, or import from types.ts if available
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  sceneClass?: string;
  children?: FileType[];
  isOpen?: boolean;
}

// Chat message component
const ChatMessage = ({
  message,
  isUser,
}: {
  message: any;
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

// Enhanced Project Page Component
export default function EnhancedProjectPage({
  params,
}: {
  params: { id: string };
}) {
  // Destructure states and functions from the useProject hook
  const {
    videoUrl,
    isExecuting,
    error,
    activeTab,
    prompt,
    isGenerating,
    conversation,
    fileSystem,
    openFiles,
    selectedFile,
    selectedScenes,
    combineScenes,
    setActiveTab,
    setPrompt,
    handleRunAnimation, // Now handles both single and multi-scene
    handleSaveCode,
    handleDownload,
    handleSendMessage, // Now uses selectedFile.content internally
    handleMultiSceneRun, // This now calls handleRunAnimation internally
    handleFileSelect,
    handleCloseFile,
    handleCodeChange,
    toggleFolder,
    setSelectedScenes,
    setCombineScenes,
  } = useProject(params);

  // handleRunAnimationClick is simplified now
  const handleRunAnimationClick = async () => {
    await handleRunAnimation();
  };

  const handleSendMessageClick = async () => {
    // handleSendMessage now internally uses selectedFile.content
    await handleSendMessage(); // No arguments needed here
  };

  const handleUseCode = useCallback(
    (code: string) => {
      // Calls the handleCodeChange from the hook
      handleCodeChange(code);
    },
    [handleCodeChange]
  );

  // renderFileTree remains in the component as it's JSX rendering logic
  const renderFileTree = (items: FileType[], depth = 0): React.ReactNode => {
    return items.map((item) => (
      <div key={item.id}>
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 hover:bg-slate-700/50 cursor-pointer text-sm rounded-md mx-1",
            selectedFile?.id === item.id && "bg-slate-600 text-white",
            `ml-${depth * 4}`
          )}
          onClick={() =>
            item.type === "file"
              ? handleFileSelect(item)
              : toggleFolder(item.id)
          }
        >
          {item.type === "folder" ? (
            <>
              {item.isOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              {item.isOpen ? (
                <FolderOpen className="w-4 h-4" />
              ) : (
                <Folder className="w-4 h-4" />
              )}
            </>
          ) : (
            <>
              <div className="w-4" />
              {/* <File className="w-4 h-4 text-blue-400" /> */}
              <img src="/python.svg"></img>
            </>
          )}

          <span className="flex-1 truncate">{item.name}</span>
          {item.type === "file" && item.sceneClass && (
            <div className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={selectedScenes.includes(item.id)}
                onChange={(e) => {
                  e.stopPropagation(); // Prevent file selection when checking
                  setSelectedScenes((prev) =>
                    e.target.checked
                      ? [...prev, item.id]
                      : prev.filter((id) => id !== item.id)
                  );
                }}
                className="w-3 h-3"
              />
              <Layers className="w-3 h-3 text-purple-400" />
            </div>
          )}
        </div>
        {item.type === "folder" && item.isOpen && item.children && (
          <div className="ml-4">{renderFileTree(item.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Manim Studio
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="gap-2"
            onClick={handleSaveCode}
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button size="sm" variant="ghost" className="gap-2">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* File Explorer */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full bg-slate-900/50 border-r border-slate-700/50">
              <div className="p-4 border-b border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-slate-300">
                    Explorer
                  </h3>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>

                {/* Multi-Scene Controls */}
                <div className="space-y-2 mb-4 p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Multi-Scene</span>
                    <span className="text-purple-400">
                      {selectedScenes.length} selected
                    </span>
                  </div>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={combineScenes}
                      onChange={(e) => setCombineScenes(e.target.checked)}
                      className="w-3 h-3"
                    />
                    <span className="text-slate-300">Combine videos</span>
                  </label>
                </div>
              </div>

              <div className="p-2 overflow-auto">
                {renderFileTree(fileSystem)}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-slate-700/30 hover:bg-slate-600/50 transition-colors" />

          {/* Code Editor & Preview */}
          <ResizablePanel defaultSize={45} minSize={30}>
            <div className="h-full bg-slate-900/30">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="h-full flex flex-col"
              >
                {/* File Tabs */}
                <div className="border-b border-slate-700/50 bg-slate-900/50">
                  <div className="flex items-center overflow-x-auto px-4 py-2 gap-1">
                    {openFiles.map((file) => (
                      <div
                        key={file.id}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer min-w-max",
                          selectedFile?.id === file.id
                            ? "bg-slate-700 text-white shadow-md"
                            : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
                        )}
                        onClick={() => handleFileSelect(file)}
                      >
                        {/* <File className="w-3 h-3" /> */}
                        <img src="/python.svg"></img>
                        <span>{file.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCloseFile(file.id);
                          }}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <TabsList className="w-full justify-start px-4   bg-transparent">
                    <TabsTrigger
                      value="code"
                      className="gap-2 data-[state=active]:bg-slate-700"
                    >
                      <Code className="w-4 h-4" />
                      Editor
                    </TabsTrigger>
                    <TabsTrigger
                      value="preview"
                      className="gap-2 data-[state=active]:bg-slate-700"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="code" className="flex-1 flex flex-col m-0">
                  <div className="flex-1 overflow-hidden">
                    <CodeEditorSection
                      value={selectedFile?.content || ""}
                      onChange={handleCodeChange}
                      language="python"
                    />
                  </div>

                  {/* Action Bar */}
                  <div className="p-4 border-t border-slate-700/50 bg-slate-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      {selectedScenes.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Layers className="w-4 h-4" />
                          {selectedScenes.length} scenes selected
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleRunAnimationClick}
                        disabled={
                          isExecuting ||
                          (!selectedFile && selectedScenes.length === 0)
                        }
                        className={cn(
                          "gap-2 transition-all",
                          selectedScenes.length > 0
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                        )}
                      >
                        {isExecuting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            {selectedScenes.length > 0
                              ? "Run Scenes"
                              : "Run Animation"}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="flex-1 m-0 p-6">
                  <div className="h-full bg-slate-800/30 rounded-xl border border-slate-700/30 flex items-center justify-center">
                    {isExecuting ? (
                      <div className="text-center space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
                        <p className="text-slate-300">
                          Generating animation...
                        </p>
                      </div>
                    ) : videoUrl ? (
                      <div className="w-full h-full flex flex-col">
                        <video
                          src={videoUrl}
                          controls
                          className="flex-1 w-full rounded-lg"
                        />
                        <div className="pt-4 flex justify-center">
                          <Button
                            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
                            onClick={handleDownload}
                          >
                            <Download className="w-4 h-4" />
                            Download Video
                          </Button>
                        </div>
                      </div>
                    ) : error ? (
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                          <X className="w-6 h-6 text-red-400" />
                        </div>
                        <p className="text-red-400">{error}</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <Video className="w-16 h-16 text-slate-500 mx-auto" />
                        <div>
                          <p className="text-slate-300 mb-2">
                            No preview available
                          </p>
                          <p className="text-slate-500 text-sm">
                            Run your animation to see the preview
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-slate-700/30 hover:bg-slate-600/50 transition-colors" />

          {/* AI Chat */}
          <ResizablePanel defaultSize={35} minSize={25}>
            <div className="h-full bg-slate-900/30 border-l border-slate-700/50 flex flex-col">
              <div className="p-4 border-b border-slate-700/50 bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <h3 className="font-medium">AI Assistant</h3>
                  {isGenerating && (
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                {conversation.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message}
                    isUser={message.role === "user"}
                  />
                ))}
                {isGenerating && (
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                    <p className="text-slate-300">AI is thinking...</p>
                  </div>
                )}
              </div>

              <AIChatSection
                conversation={conversation}
                isGenerating={isGenerating}
                prompt={prompt}
                onPromptChange={setPrompt}
                onSendMessage={handleSendMessageClick}
                onUseCode={handleUseCode}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
