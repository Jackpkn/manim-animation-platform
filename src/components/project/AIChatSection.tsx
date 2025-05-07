// components/project/AIChatSection.tsx
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Code, Copy } from "lucide-react";
import React from "react";

interface Message {
  role: string;
  content: string;
  code?: string; // Added code property
}

interface AIChatSectionProps {
  conversation: Message[];
  isGenerating: boolean;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSendMessage: () => void;
  onUseCode?: (code: string) => void; // Optional callback to use code
}

const AIChatSection = React.memo(function AIChatSection({
  conversation,
  isGenerating,
  prompt,
  onPromptChange,
  onSendMessage,
  onUseCode,
}: AIChatSectionProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.shiftKey === false && prompt.trim()) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
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
              <p className="whitespace-pre-wrap">{message.content}</p>

              {message.code && (
                <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400 flex items-center">
                      <Code size={12} className="mr-1" /> Python
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(message.code || "")}
                        className="h-6 px-2 text-xs"
                      >
                        <Copy size={12} className="mr-1" /> Copy
                      </Button>
                      {onUseCode && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onUseCode(message.code || "")}
                          className="h-6 px-2 text-xs"
                        >
                          Use Code
                        </Button>
                      )}
                    </div>
                  </div>
                  <pre className="text-sm text-gray-300 overflow-x-auto max-h-60">
                    <code>{message.code}</code>
                  </pre>
                </div>
              )}
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
            onChange={(e) => onPromptChange(e.target.value)}
            className="min-h-[80px] resize-none"
            onKeyDown={handleKeyDown}
          />
          <Button
            onClick={onSendMessage}
            disabled={!prompt.trim() || isGenerating}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});

export default AIChatSection;
