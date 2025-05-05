'use client';

import { useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import Preview from "@/components/Preview";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState<string>();
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string>();

  const handleRunAnimation = async (code: string) => {
    setIsExecuting(true);
    setError(undefined);

    try {
      // Save the code to a temporary file
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
      }
    } catch (error) {
      setError('Failed to execute animation');
      console.error('Error executing animation:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSaveCode = (code: string) => {
    // TODO: Implement code saving
    console.log("Saving code:", code);
  };

  const handleDownload = () => {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manim Animation Platform
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CodeEditor onRun={handleRunAnimation} onSave={handleSaveCode} />
          <Preview
            videoUrl={videoUrl}
            onDownload={handleDownload}
            isExecuting={isExecuting}
            error={error}
          />
        </div>

        {/* Examples Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Example Animations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Basic Shapes",
              "Text Animation",
              "Transformations",
              "Mathematical Graphs",
              "3D Objects",
              "Custom Animations"
            ].map((example, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {example}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Click to load example
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
