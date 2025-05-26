import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser, useSignIn } from "@clerk/nextjs";
import { enhancePromptAction } from "@/app/actions/prompt";

interface AnimationPromptInputProps {
  onSubmitAnimation: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

export default function AnimationPromptInput({
  onSubmitAnimation,
  isLoading,
}: AnimationPromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { isSignedIn } = useUser();
  const { signIn, isLoaded: signInLoaded } = useSignIn();

  const [clerkReady, setClerkReady] = useState(false);
  const [signInCooldown, setSignInCooldown] = useState(false); // New cooldown state

  useEffect(() => {
    if (isSignedIn !== undefined && signInLoaded) {
      setClerkReady(true);
    }
  }, [isSignedIn, signInLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading || isEnhancing || signInCooldown) return; // Check cooldown

    if (!isSignedIn) {
      if (!clerkReady) {
        console.warn("Clerk not ready, preventing sign-in attempt.");
        return;
      }
      // Apply cooldown
      setSignInCooldown(true);
      setTimeout(() => {
        setSignInCooldown(false);
      }, 5000); // 5 seconds cooldown (adjust as needed)

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
    if (!prompt.trim()) return;

    setIsEnhancing(true);
    try {
      const result = await enhancePromptAction(prompt);
      if (result.success && result.enhancedPrompt) {
        setPrompt(result.enhancedPrompt);
      } else {
        console.error("Failed to enhance prompt:", result.error);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error("Failed to enhance prompt:", error);
    } finally {
      setIsEnhancing(false);
    }
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
              disabled={isLoading || isEnhancing} // Disable during enhancement
            />

            {/* Enhance Prompt Button Positioned Absolutely */}
            <button
              type="button"
              onClick={handleEnhancePrompt}
              className="absolute bottom-4 right-4 flex items-center hover:opacity-80 transition p-2 rounded-lg"
              title="Enhance Prompt"
              disabled={isLoading || isEnhancing || !prompt.trim()}
            >
              {isEnhancing ? (
                <>
                  <img
                    src="/loading.svg"
                    alt="Enhancing..."
                    className="w-5 h-5 animate-spin"
                  />
                  <span className="ml-2 text-sm text-gray-300">
                    Enhancing...
                  </span>
                </>
              ) : (
                <>
                  <img src="/ai.svg" alt="Enhance Prompt" className="w-5 h-5" />
                  <span className="ml-2 text-sm text-gray-300">Enhance</span>
                </>
              )}
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
              disabled={
                isLoading || isEnhancing || !prompt.trim() || signInCooldown
              } // Check cooldown
              className={`px-8 py-3 rounded-xl font-medium flex items-center gap-2 ${
                isLoading || isEnhancing || !prompt.trim() || signInCooldown
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
                    {isSignedIn
                      ? "Create Animation"
                      : signInCooldown
                      ? "Please wait..."
                      : "Sign in to Create"}
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
