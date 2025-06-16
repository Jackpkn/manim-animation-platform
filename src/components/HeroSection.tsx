import React, { RefObject, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

import AnimationPromptInput from "./AnimationPromptInput";

interface HeroSectionProps {
  heroRef: RefObject<HTMLElement | null>;
  onSubmitAnimation: (prompt: string) => Promise<void>;
  isSubmitLoading: boolean;
}

// Placeholder for HeroBackground to resolve import error
const HeroBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Example of a simple background element */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

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
      className="relative overflow-hidden bg-gray-950 min-h-screen flex items-center justify-center"
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
          <div className="inline-block mb-4">
            <span className="px-4 py-1.5 text-sm font-semibold bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/40 rounded-full text-blue-300 shadow-md">
              AI-Powered Mathematics
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 font-inter leading-tight tracking-tighter">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#D07149] via-[#E09060] to-[#F0A070] drop-shadow-lg">
              PromptViz Animation
            </span>
            <br />
            <span className="text-white">Platform</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-inter leading-relaxed">
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
