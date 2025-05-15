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
  const animationControls = useAnimation();

  useEffect(() => {
    animationControls.start("visible");
  }, [animationControls]);

  const textVariants = {
    visible: { opacity: 1, y: 0 },
    hidden: { opacity: 0, y: 30 },
  };

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-20 text-center md:pt-24" // Added padding, flex for centering
    >
      <HeroBackground />
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate={animationControls}
          variants={textVariants}
          transition={{ duration: 0.7 }}
          className="text-center mb-6"
        >
          <div className="inline-block mb-4">
            <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-blue-400">
              AI-Powered Mathematics
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-inter">
            <span className="bg-clip-text text-transparent bg-[#D07149]">
              PromptViz Animation
            </span>
            <br />
            <span className="text-white">Platform</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto font-inter">
            Transform complex mathematical concepts into stunning visual
            animations with the power of AI. Create, share, and explore
            mathematical beauty.
          </p>
        </motion.div>

        {/* Input area */}
        <motion.div
          initial="hidden"
          animate={animationControls}
          variants={textVariants}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="max-w-3xl mx-auto mb-20"
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
