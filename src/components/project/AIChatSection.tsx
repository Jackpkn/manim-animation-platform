// components/project/AIChatSection.tsx
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowUp, Code, Copy, MessageSquare, Sparkles, User } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { cn } from "@/lib/utils";

interface Message {
  role: string;
  content: string;
  code?: string;
}

interface AIChatSectionProps {
  conversation: Message[];
  isGenerating: boolean;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSendMessage: () => void;
  onUseCode?: (code: string) => void;
}

const ChatMessage = ({
  message,
  onUseCode,
}: {
  message: Message;
  onUseCode?: (code: string) => void;
}) => {
  const isUser = message.role === "user";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg",
          isUser
            ? "bg-blue-600 shadow-blue-900/20"
            : "bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-900/20"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <MessageSquare className="w-4 h-4 text-white" />
        )}
      </div>

      <div className={cn("flex-1 max-w-[85%] space-y-2", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
            isUser
              ? "bg-blue-600 text-white rounded-tr-none"
              : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {message.code && (
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-md">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-3 h-3 text-blue-400" />
                <span className="text-xs font-medium text-slate-400">Python</span>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-slate-400 hover:text-white"
                  onClick={() => copyToClipboard(message.code || "")}
                  title="Copy code"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                {onUseCode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs gap-1 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                    onClick={() => onUseCode(message.code || "")}
                  >
                    Use
                  </Button>
                )}
              </div>
            </div>
            <SyntaxHighlighter
              language="python"
              style={oneDark}
              customStyle={{
                margin: 0,
                padding: "1rem",
                fontSize: "0.8rem",
                background: "transparent",
              }}
              wrapLines={true}
              wrapLongLines={true}
            >
              {message.code}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  );
};

const AIChatSection = React.memo(function AIChatSection({
  conversation,
  isGenerating,
  prompt,
  onPromptChange,
  onSendMessage,
  onUseCode,
}: AIChatSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when conversation changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation, isGenerating]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.shiftKey === false && prompt.trim()) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
      >
        {conversation.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 opacity-50">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-sm">Start a conversation to generate animations</p>
          </div>
        )}

        {conversation.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            onUseCode={onUseCode}
          />
        ))}

        {isGenerating && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-900/20 animate-pulse">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none p-3 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs text-slate-400 font-medium">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="relative bg-slate-800/50 rounded-xl border border-slate-700 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
          <Textarea
            placeholder="Describe your animation..."
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[50px] max-h-[200px] w-full bg-transparent border-none focus-visible:ring-0 resize-none text-slate-200 placeholder:text-slate-500 py-3 pl-3 pr-12"
            rows={1}
            style={{ height: "auto" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
          <Button
            size="icon"
            onClick={onSendMessage}
            disabled={!prompt.trim() || isGenerating}
            className={cn(
              "absolute right-2 bottom-2 h-8 w-8 rounded-lg transition-all",
              prompt.trim() && !isGenerating
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                : "bg-slate-700 text-slate-500"
            )}
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <Code className="w-3 h-3" />
            Manim Python
          </span>
          <span>•</span>
          <span>Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );
});

export default AIChatSection;
