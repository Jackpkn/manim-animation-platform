"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { motion, useAnimation, useInView } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      setIsLoading(true);
      const projectId = uuidv4();
      // Simulate a small delay before routing
      setTimeout(() => {
        router.push(`/project/${projectId}`);
      }, 600);
    }
  };

  return (
    <div className="min-h-screen relative bg-black text-white overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-600 rounded-full mix-blend-screen filter blur-[96px] opacity-20 animate-pulse delay-700"></div>
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-pink-600 rounded-full mix-blend-screen filter blur-[112px] opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Hero section */}
        <section ref={heroRef} className="pt-32 pb-16 md:pt-40 md:pb-24 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              animate={controls}
              variants={{
                visible: { opacity: 1, y: 0 },
                hidden: { opacity: 0, y: 30 },
              }}
              transition={{ duration: 0.7 }}
              className="text-center mb-6"
            >
              {/* --------------------------------- */}

              <div className="inline-block mb-4">
                <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-blue-400">
                  AI-Powered Mathematics
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  Manim Animation
                </span>
                <br />
                <span className="text-white">Platform</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Transform complex mathematical concepts into stunning visual
                animations with the power of AI. Create, share, and explore
                mathematical beauty.
              </p>
            </motion.div>

            {/* Input area */}
            <motion.div
              initial="hidden"
              animate={controls}
              variants={{
                visible: { opacity: 1, y: 0 },
                hidden: { opacity: 0, y: 30 },
              }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="max-w-3xl mx-auto mb-20"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  {/* <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-30"></div> */}
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
          </div>
        </section>
        {/* Demo animation */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, scale: 1 },
            hidden: { opacity: 0, scale: 0.8 },
          }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative max-w-7xl mx-auto   md:h-80 mb-12 rounded-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-white/10">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Mathematical animation placeholder */}
              <svg
                width="160"
                height="160"
                viewBox="0 0 160 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="opacity-60"
              >
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  className="animate-spin"
                  style={{ animationDuration: "15s" }}
                />
                <circle
                  cx="80"
                  cy="80"
                  r="40"
                  stroke="#8B5CF6"
                  strokeWidth="2"
                  className="animate-spin"
                  style={{
                    animationDuration: "10s",
                    animationDirection: "reverse",
                  }}
                />
                <circle
                  cx="80"
                  cy="80"
                  r="20"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  className="animate-spin"
                  style={{ animationDuration: "5s" }}
                />
                <line
                  x1="20"
                  y1="80"
                  x2="140"
                  y2="80"
                  stroke="white"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <line
                  x1="80"
                  y1="20"
                  x2="80"
                  y2="140"
                  stroke="white"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black to-transparent"></div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                  />
                </svg>
                Watch Demo
              </button>
            </div>
          </div>
        </motion.div>
        ;
      </div>
    </div>
  );
}
