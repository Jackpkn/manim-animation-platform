"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      const projectId = uuidv4();
      router.push(`/project/${projectId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Manim Animation Platform
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Create beautiful mathematical animations with AI assistance
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              placeholder="Describe your app idea..."
              className="w-full py-3 px-5 h-24 md:h-30 border-gray border-[1px] bg-[#30302e] text-white rounded-xl 
                        focus:outline-none focus:ring-0  
                        transition-shadow duration-200 ease-in-out placeholder-gray-400 
                        resize-none leading-relaxed"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{
                // paddingRight: "7rem",
                textAlign: "left",
                lineHeight: "1.5rem",
              }}
              rows={3}
            />

            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Create
            </button>
          </div>
        </form>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AI-Powered
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get help from our AI assistant to create complex animations
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Real-time Preview
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              See your animations come to life instantly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
