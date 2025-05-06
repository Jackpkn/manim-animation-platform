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
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6 backdrop-blur-md bg-black/20">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <img
                  src="/logo.svg"
                  alt="Manim Logo"
                  className="w-full h-full"
                />
              </div>
              <span className="font-semibold text-xl">Manim</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#"
                className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors"
              >
                Sign In
              </a>
            </nav>
          </div>
        </header>
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
        {/* Features Section */}
        <section className="py-16 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Powerful Features
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Create complex animations with ease using our AI-powered
                platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "AI-Powered Generation",
                  description:
                    "Transform natural language descriptions into complex mathematical animations with our advanced AI engine.",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Real-time Preview",
                  description:
                    "See your animations render in real-time as you make changes, with no delays or waiting for compilation.",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Code Editor",
                  description:
                    "Fine-tune your animations with our powerful code editor that updates in real-time as you make changes.",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                      />
                    </svg>
                  ),
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl inline-block mb-4 border border-white/10">
                    <div className="text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        {/* Testimonials or Examples */}
        <section className="py-16 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/0 via-blue-900/30 to-blue-900/0 -z-10"></div>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
              <div className="md:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Visualize Complex Mathematics
                </h2>
                <p className="text-gray-400 mb-6">
                  From simple geometric shapes to complex multi-dimensional
                  functions, our platform handles the full spectrum of
                  mathematical visualizations.
                </p>
                <ul className="space-y-4">
                  {[
                    "Calculus concepts and derivatives",
                    "Linear algebra transformations",
                    "Complex number visualizations",
                    "Statistical distributions and probability",
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-3 h-3 text-white"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-300">{item}</span>
                    </motion.li>
                  ))}
                </ul>
                <div className="mt-8">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
                  >
                    <span>View Examples</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </motion.button>
                </div>
              </div>
              <div className="md:w-1/2 relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Mathematical animation placeholder */}
                    <svg
                      width="200"
                      height="200"
                      viewBox="0 0 200 200"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="opacity-70"
                    >
                      <path
                        d="M100 30C61.3401 30 30 61.3401 30 100C30 138.66 61.3401 170 100 170C138.66 170 170 138.66 170 100C170 61.3401 138.66 30 100 30Z"
                        stroke="white"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        className="animate-[spin_20s_linear_infinite]"
                      />
                      <path
                        d="M100 50C72.3858 50 50 72.3858 50 100C50 127.614 72.3858 150 100 150C127.614 150 150 127.614 150 100C150 72.3858 127.614 50 100 50Z"
                        stroke="#8B5CF6"
                        strokeWidth="1"
                        className="animate-[spin_15s_linear_infinite_reverse]"
                      />
                      <path
                        d="M100 70C83.4315 70 70 83.4315 70 100C70 116.569 83.4315 130 100 130C116.569 130 130 116.569 130 100C130 83.4315 116.569 70 100 70Z"
                        stroke="#3B82F6"
                        strokeWidth="1"
                        className="animate-[spin_10s_linear_infinite]"
                      />
                      <path
                        d="M30 100H170"
                        stroke="white"
                        strokeWidth="0.5"
                        strokeDasharray="2 2"
                      />
                      <path
                        d="M100 30V170"
                        stroke="white"
                        strokeWidth="0.5"
                        strokeDasharray="2 2"
                      />
                      <path
                        d="M58.5786 58.5786L141.421 141.421"
                        stroke="white"
                        strokeWidth="0.5"
                        strokeDasharray="2 2"
                      />
                      <path
                        d="M141.421 58.5786L58.5786 141.421"
                        stroke="white"
                        strokeWidth="0.5"
                        strokeDasharray="2 2"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="5"
                        fill="#3B82F6"
                        className="animate-pulse"
                      />
                    </svg>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl opacity-20"></div>
              </div>
            </div>
          </div>
        </section>
        {/* Footer */}
        <footer className="py-12 px-4 border-t border-white/10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.5 8C14.5 8 14.5 8 14.5 8C14.5 8 17.5 11 17.5 12C17.5 13 14.5 16 14.5 16C14.5 16 14.5 16 14.5 16"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.5 8C9.5 8 9.5 8 9.5 8C9.5 8 6.5 11 6.5 12C6.5 13 9.5 16 9.5 16C9.5 16 9.5 16 9.5 16"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-xl">Manim</span>
              </div>
              <p className="text-gray-400 max-w-xs">
                Transform mathematical concepts into beautiful animations with
                AI assistance.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8"></div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 Manim Animation Platform. All rights reserved.
            </p>
          </div>
        </footer>

        {/* Floating action button for mobile */}
        <div className="fixed bottom-6 right-6 md:hidden z-50">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/30"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
