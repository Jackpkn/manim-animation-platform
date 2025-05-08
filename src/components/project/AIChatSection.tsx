// components/project/AIChatSection.tsx
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowUp, Code, Copy } from "lucide-react";
import React from "react";
import { Card } from "../ui/card";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
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
            <Card
              key={index}
              className={`p-4 rounded-lg shadow-sm relative ${
                message.role === "assistant"
                  ? `${
                      isGenerating ? "gradient-border" : ""
                    } bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200`
                  : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>

              {message.code && (
                <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-pink-500 dark:text-pink-400 flex items-center bg-pink-100/30 dark:bg-pink-900/20 px-2 py-0.5 rounded-full">
                      <Code size={12} className="mr-1" />
                      Python
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

                  <SyntaxHighlighter
                    language="python"
                    style={oneDark}
                    className="text-sm font-mono text-gray-100 bg-gray-800 rounded-md p-3 overflow-x-auto max-h-60 border border-gray-700"
                    customStyle={{
                      maxHeight: "15rem",
                      borderRadius: "0.5rem",
                    }}
                  >
                    {message.code}
                  </SyntaxHighlighter>
                </div>
              )}
            </Card>
          ))}
          {/* Generating message bubble */}
          {isGenerating && (
            // Add the gradient-border class here
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 relative gradient-border">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 dark:text-blue-400">
                  Generating response...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex space-x-3 items-end">
          {/* Wrapper div for Textarea - add the conditional class here */}
          <div
            className={`relative flex-1 ${
              isGenerating ? "gradient-border-textarea-wrapper" : ""
            }`}
          >
            <Textarea
              placeholder="Describe what animation you want to create..."
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              // Keep necessary Tailwind classes
              className="min-h-[80px] resize-none rounded-xl focus:ring-2 focus:ring-blue-400 w-full relative z-[1] bg-gray-50 dark:bg-gray-900"
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button
            onClick={onSendMessage}
            disabled={!prompt.trim() || isGenerating}
            className="self-end h-10 w-10 rounded-full p-0 bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* === Consolidated styled-jsx block === */}
      <style jsx>{`
        /* Animation for the message bubble border */
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        /* Style for the generating message bubble border */
        .gradient-border::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 0.5rem; /* Matches rounded-lg */
          padding: 1px; /* Border thickness */
          background: linear-gradient(
            90deg,
            #3b82f6,
            /* blue-500 */ #8b5cf6,
            /* violet-500 */ #ec4899,
            /* pink-500 */ #3b82f6
          );
          background-size: 300% 300%;
          animation: gradientMove 2s ease infinite;
          -webkit-mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        /* Animation for the textarea border */
        @keyframes gradientMoveTextarea {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        /* Style for the Textarea border when generating */
        .gradient-border-textarea-wrapper::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 0.75rem; /* Matches rounded-xl */
          padding: 1.5px; /* Border thickness */
          background: linear-gradient(
            90deg,
            #3b82f6,
            /* blue-500 */ #8b5cf6,
            /* violet-500 */ #ec4899,
            /* pink-500 */ #3b82f6
          );
          background-size: 300% 300%;
          animation: gradientMoveTextarea 4s ease infinite; /* Slightly longer animation for a calmer effect */
          -webkit-mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none; /* Ensure clicks/interactions pass through */
        }
      `}</style>
    </div>
  );
});

export default AIChatSection;
