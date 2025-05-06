// src/components/HeroSection.tsx
import React from "react";
import { motion, AnimationControls } from "framer-motion";
import AnimationPromptInput from "./AnimationPromptInput";

interface HeroSectionProps {
  heroRef: React.RefObject<HTMLElement>;
  animationControls: AnimationControls;
  onSubmitAnimation: (prompt: string) => void;
  isSubmitLoading: boolean;
}

export default function HeroSection({
  heroRef,
  animationControls,
  onSubmitAnimation,
  isSubmitLoading,
}: HeroSectionProps) {
  const textVariants = {
    visible: { opacity: 1, y: 0 },
    hidden: { opacity: 0, y: 30 },
  };

  return (
    <section ref={heroRef} className="pt-32 pb-16 md:pt-40 md:pb-24 px-4">
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
          // This motion div wraps the input component and handles its animation
          initial="hidden"
          animate={animationControls}
          variants={textVariants} // Re-use the same variants
          transition={{ duration: 0.7, delay: 0.6 }}
          className="max-w-3xl mx-auto mb-20"
        >
          <AnimationPromptInput
            onSubmitAnimation={onSubmitAnimation}
            isLoading={isSubmitLoading}
          />
        </motion.div>
      </div>
    </section>
  );
}
