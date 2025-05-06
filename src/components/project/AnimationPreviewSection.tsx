// components/project/AnimationPreviewSection.tsx
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import React from "react"; // Import React

interface AnimationPreviewSectionProps {
  videoUrl?: string;
  isExecuting: boolean;
  error?: string;
  onDownload: () => void;
}

const AnimationPreviewSection = React.memo(function AnimationPreviewSection({
  videoUrl,
  isExecuting,
  error,
  onDownload,
}: AnimationPreviewSectionProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Animation Preview</h2>
        <Button
          variant="outline"
          onClick={onDownload}
          disabled={!videoUrl || isExecuting}
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>

      <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center flex-1">
        {" "}
        {/* Use flex-1 here too */}
        {isExecuting ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">
              Generating animation...
            </p>
          </div>
        ) : error ? (
          <div className="p-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md max-w-lg">
            <p className="font-semibold mb-2">Error</p>
            <p className="font-mono text-sm whitespace-pre-wrap">{error}</p>
          </div>
        ) : videoUrl ? (
          <video src={videoUrl} controls className="w-full h-full rounded-md" />
        ) : (
          <div className="text-center p-6">
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No animation yet
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Run your code to see the preview here
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

export default AnimationPreviewSection;
