"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { motion, useAnimation, useInView } from "framer-motion";

// Import the new components
import BackgroundOrbs from "@/components/BackgroundOrbs";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import DemoAnimationSection from "@/components/DemoAnimationSection";
import FeatureSection from "@/components/FeatureSection";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const heroRef = useRef<HTMLElement>(null!) as React.RefObject<HTMLElement>;
  const isInView = useInView(heroRef, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  // This function is passed down to the input component
  const handleAnimationSubmit = (prompt: string) => {
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
      <BackgroundOrbs />

      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <Header />

        {/* Hero section */}
        <HeroSection
          heroRef={heroRef}
          animationControls={controls}
          onSubmitAnimation={handleAnimationSubmit}
          isSubmitLoading={isLoading}
        />

        {/* Demo animation */}
        <DemoAnimationSection controls={controls} />

        <FeatureSection />
      </div>
    </div>
  );
}
