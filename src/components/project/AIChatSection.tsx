// components/project/AIChatSection.tsx
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import React from "react"; // Import React

interface Message {
  role: string;
  content: string;
}

interface AIChatSectionProps {
  conversation: Message[];
  isGenerating: boolean;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSendMessage: () => void;
}

const AIChatSection = React.memo(function AIChatSection({
  conversation,
  isGenerating,
  prompt,
  onPromptChange,
  onSendMessage,
}: AIChatSectionProps) {
  // We keep the prompt state management within this component
  // as it's primarily related to the input UI here.
  // The parent component will handle the API call and updating the conversation.

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.shiftKey === false && prompt.trim()) {
      e.preventDefault();
      onSendMessage();
    }
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
