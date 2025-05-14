import React, { useState } from "react";
import { motion } from "framer-motion";
import { useUser, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface AnimationPromptInputProps {
  onSubmitAnimation: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

export default function AnimationPromptInput({
  onSubmitAnimation,
  isLoading,
}: AnimationPromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const { isSignedIn } = useUser();
  const { signIn } = useSignIn();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    if (!isSignedIn) {
      try {
        await signIn?.create({
          strategy: "oauth_google",
          redirectUrl: window.location.href,
        });
      } catch (error) {
        console.error("Clerk sign-in failed:", error);
      }
      return;
    }
    await onSubmitAnimation(prompt.trim());
  };

  const handleEnhancePrompt = async () => {
    // Example logic: Replace with actual enhancement logic or API call
    const enhanced = `Enhanced: ${prompt.trim()} (add more detail here...)`;
    setPrompt(enhanced);
  };

  return (
    <motion.div className="max-w-3xl mx-auto mb-20">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          {/* Textarea Container */}
          <div className="relative">
            {/* Textarea */}
            <textarea
              placeholder="Describe your animation: 'Create a 3D graph showing the relationship between x^2 + y^2 = z with rotation...'"
              className="w-full py-6 px-6 bg-gray-900/90 backdrop-blur-xl text-white rounded-2xl border border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition duration-200 placeholder-gray-500 resize-none h-28 md:h-36 pr-14"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{ lineHeight: "1.6rem" }}
              disabled={isLoading}
            />

            {/* Enhance Prompt Button Positioned Absolutely */}
            <button
              type="button"
              onClick={handleEnhancePrompt}
              className="absolute bottom-4 left-4 bg-gray-800/60 hover:bg-gray-700/80 transition p-1 rounded-full"
              title="Enhance Prompt"
              disabled={isLoading || !prompt.trim()}
            >
              <img
                src="/ai.svg"
                alt="Enhance Prompt"
                className="w-6 h-6 opacity-80 hover:opacity-100"
              />
            </button>
          </div>

          {/* Footer UI Below Textarea */}
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <img src="/ai.svg" alt="AI Icon" className="w-5 h-5" />
              <span>AI will generate code for you</span>
            </div>
            <motion.button
              whileHover={{ scale: !isLoading && prompt.trim() ? 1.03 : 1 }}
              whileTap={{ scale: !isLoading && prompt.trim() ? 0.97 : 1 }}
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
                  <img
                    src="/loading.svg"
                    alt="Loading"
                    className="w-5 h-5 animate-spin"
                  />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {isSignedIn ? "Create Animation" : "Sign in to Create"}
                  </span>
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
      </form>
    </motion.div>
  );
}
