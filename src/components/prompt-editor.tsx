"use client";

import { useState } from "react";
import { Code, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PromptEditorProps {
  initialPrompt: string;
  onGenerateCode: (prompt: string) => Promise<void>;
  isGenerating: boolean;
}

export function PromptEditor({
  initialPrompt,
  onGenerateCode,
  isGenerating,
}: PromptEditorProps) {
  const [prompt, setPrompt] = useState(initialPrompt);

  const handleSubmit = async () => {
    if (prompt.trim()) {
      await onGenerateCode(prompt);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-2">
        <h3 className="text-sm font-medium text-gray-700">
          Describe your animation
        </h3>
        <p className="text-xs text-gray-500">
          Be specific about the objects, their positions, and the animations you
          want to see.
        </p>
      </div>

      <Textarea
        className="w-full flex-grow p-4 font-mono text-sm mb-4 min-h-64"
        placeholder="Describe the animation you want to create... (e.g., Create a scene with three squares that transform into a cube)"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isGenerating || !prompt.trim()}
        >
          {isGenerating ? (
            <>
              Generating...
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              Generate Manim Code
              <Code className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
