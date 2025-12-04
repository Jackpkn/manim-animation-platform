import React, { RefObject, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

import AnimationPromptInput from "./AnimationPromptInput";
import HeroBackground from "./HeroBackground";

interface HeroSectionProps {
  heroRef: RefObject<HTMLElement | null>;
  onSubmitAnimation: (prompt: string) => Promise<void>;
  isSubmitLoading: boolean;
}

export default function HeroSection({
  heroRef,
  onSubmitAnimation,
  isSubmitLoading,
}: HeroSectionProps) {
  const controls = useAnimation();
  const animationControls = useAnimation();

  useEffect(() => {
    controls.start("visible");
    animationControls.start("visible");
  }, [controls, animationControls]);

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.8,
        ease: "easeOut",
      },
    }),
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden bg-slate-950 min-h-screen flex items-center justify-center"
    >
      {/* Background component */}
      <HeroBackground />

      {/* Main content container */}
      <div className="relative max-w-7xl mx-auto py-12 md:py-20 z-10 px-4 sm:px-6 lg:px-8">
        {/* Title and description section */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={variants}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <div className="inline-block mb-6">
            <span className="px-4 py-1.5 text-sm font-semibold bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full text-blue-300 backdrop-blur-sm shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              AI-Powered Mathematics
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 font-sans leading-tight tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-2xl">
              PromptViz Animation
            </span>
            <br />
            <span className="text-white drop-shadow-lg">Platform</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-sans leading-relaxed font-light">
            Transform complex mathematical concepts into stunning visual
            animations with the power of AI. Create, share, and explore
            mathematical beauty effortlessly.
          </p>
        </motion.div>

        {/* Input area */}
        <motion.div
          initial="hidden"
          animate={animationControls}
          variants={textVariants}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="max-w-3xl mx-auto mt-12 mb-20"
        >
          <AnimationPromptInput
            isLoading={isSubmitLoading}
            onSubmitAnimation={onSubmitAnimation}
          />
        </motion.div>
      </div>
    </section>
  );
}
