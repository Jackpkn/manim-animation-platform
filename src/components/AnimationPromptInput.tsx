import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Sparkle } from "lucide-react"; // Using Sparkle for enhance icon
import { enhancePromptAction } from "@/app/actions/prompt";

interface AnimationPromptInputProps {
  onSubmitAnimation: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

const useUser = () => ({ isSignedIn: true });
const useSignIn = () => ({
  signIn: {
    create: async (p0: { strategy: string; redirectUrl: string }) => {
      console.log("Mock sign in");
    },
  },
  isLoaded: true,
});

const AnimationPromptInput: React.FC<AnimationPromptInputProps> = ({
  onSubmitAnimation,
  isLoading,
}) => {
  const [prompt, setPrompt] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { isSignedIn } = useUser();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [clerkReady, setClerkReady] = useState(false);
  const [signInCooldown, setSignInCooldown] = useState(false);

  useEffect(() => {
    if (isSignedIn !== undefined && signInLoaded) {
      setClerkReady(true);
    }
  }, [isSignedIn, signInLoaded]);

  useEffect(() => {
    // Auto-resize textarea based on content
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "inherit";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [prompt]); // Resize when prompt changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading || isEnhancing || signInCooldown) return;

    if (!isSignedIn) {
      if (!clerkReady) {
        console.warn("Clerk not ready, preventing sign-in attempt.");
        return;
      }
      setSignInCooldown(true);
      setTimeout(() => {
        setSignInCooldown(false);
      }, 5000);

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
      const result: any = await enhancePromptAction(prompt); // Cast to any to bypass type errors for mock
      if (result.success && result.enhancedPrompt) {
        setPrompt(result.enhancedPrompt);
      } else {
        console.error("Failed to enhance prompt:", result.error);
      }
    } catch (error) {
      console.error("Failed to enhance prompt:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto mb-20 p-6"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative bg-gray-900/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-700/50 p-2 sm:p-4">
          <textarea
            ref={textAreaRef}
            placeholder="Describe your animation: 'Create a 3D graph showing the relationship between x^2 + y^2 = z with rotation...'"
            className="w-full py-4 px-5 bg-transparent text-white rounded-2xl focus:outline-none resize-none h-32 md:h-40 text-base"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading || isEnhancing}
            style={{ lineHeight: "1.6rem" }}
          />
          <motion.button
            type="button"
            onClick={handleEnhancePrompt}
            className="absolute bottom-3 right-3 flex items-center justify-center p-2 rounded-md bg-blue-700/80 text-white shadow-md hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Enhance Prompt"
            disabled={isLoading || isEnhancing || !prompt.trim()}
            whileHover={{
              scale: !(isLoading || isEnhancing || !prompt.trim()) ? 1.1 : 1,
            }}
            whileTap={{
              scale: !(isLoading || isEnhancing || !prompt.trim()) ? 0.95 : 1,
            }}
          >
            {isEnhancing ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <Sparkle className="w-5 h-5" />
            )}
            <span className="ml-2 text-sm hidden sm:inline">Enhance</span>
          </motion.button>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <BrainCircuit className="w-5 h-5 text-blue-400" />
            <span>AI will generate tailored code for you.</span>
          </div>
          <motion.button
            whileHover={{ scale: !isLoading && prompt.trim() ? 1.05 : 1 }}
            whileTap={{ scale: !isLoading && prompt.trim() ? 0.95 : 1 }}
            type="submit"
            disabled={
              isLoading || isEnhancing || !prompt.trim() || signInCooldown
            }
            className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-base ${
              isLoading || isEnhancing || !prompt.trim() || signInCooldown
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:from-blue-700 hover:to-purple-700"
            } transition-all duration-300`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 3.75a.75.75 0 01.75.75v13.19l3.97-3.97a.75.75 0 111.06 1.06l-5.25 5.25a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 111.06-1.06l3.97 3.97V4.5a.75.75 0 01.75-.75z"
                    clipRule="evenodd"
                  />
                </svg>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default AnimationPromptInput;
