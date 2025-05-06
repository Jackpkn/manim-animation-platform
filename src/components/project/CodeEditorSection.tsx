// components/project/CodeEditorSection.tsx
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import React from "react"; // Import React

interface CodeEditorSectionProps {
  code: string;
  onCodeChange: (code: string) => void;
  onRunAnimation: () => void;
  isExecuting: boolean;
}

const CodeEditorSection = React.memo(function CodeEditorSection({
  code,
  onCodeChange,
  onRunAnimation,
  isExecuting,
}: CodeEditorSectionProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Code Editor</h2>
        <Button onClick={onRunAnimation} disabled={isExecuting}>
          <PlayCircle className="mr-2 h-4 w-4" />
          Run Animation
        </Button>
      </div>

      <div className="relative rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 flex-1">
        {" "}
        {/* Use flex-1 to fill space */}
        <Textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          className="w-full h-full p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" // Use resize-none as container handles resize
          placeholder="Write your Manim code here..."
        />
      </div>
    </div>
  );
});

export default CodeEditorSection;
