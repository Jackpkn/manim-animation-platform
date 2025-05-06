import React, { useState } from "react";
import { motion } from "framer-motion";

// Define the prop type for the onSubmit callback
interface AnimationPromptInputProps {
  onSubmitAnimation: (prompt: string) => void;
  isLoading: boolean;
}

export default function AnimationPromptInput({
  onSubmitAnimation,
  isLoading,
}: AnimationPromptInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmitAnimation(prompt.trim()); // Call the parent's handler
    }
  };

  return (
    <motion.div
      // Note: The initial/animate/variants/transition would typically
      // be handled by the parent (HeroSection) or passed as props.
      // For simplicity here, we'll assume HeroSection wraps this
      // and handles the primary animation for the whole block.
      className="max-w-3xl mx-auto mb-20"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="relative">
            <textarea
              placeholder="Describe your animation: 'Create a 3D graph showing the relationship between x^2 + y^2 = z with rotation...'"
              className="w-full py-6 px-6 bg-gray-900/90 backdrop-blur-xl text-white rounded-2xl border border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition duration-200 placeholder-gray-500 resize-none h-28 md:h-36"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{
                lineHeight: "1.6rem",
              }}
            />
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                {/* Use the SVG from public */}
                <img src="/ai.svg" alt="AI Icon" className="w-5 h-5" />
                <span>AI will generate code for you</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className={`px-8 py-3 rounded-xl font-medium flex items-center gap-2 ${
                  isLoading || !prompt.trim()
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                } transition-all duration-200`}
              >
                {isLoading ? (
                  <>
                    {/* Use the SVG from public */}
                    <img
                      src="/loading.svg"
                      alt="Loading"
                      className="w-5 h-5 animate-spin"
                    />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Create Animation</span>
                    {/* Use the SVG from public */}
                    <img
                      src="/forward-arrow.svg"
                      alt="Arrow"
                      className="w-5 h-5"
                    />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
