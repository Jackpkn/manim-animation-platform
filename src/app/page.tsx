"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { motion, useAnimation, useInView } from "framer-motion";
import BackgroundOrbs from "@/components/BackgroundOrbs";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import DemoAnimationSection from "@/components/DemoAnimationSection";
import FeatureSection from "@/components/FeatureSection";
import ExamplesSection from "@/components/ExamplesSection";
import Footer from "@/components/Footer";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const isInView = useInView(heroRef, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);
  const handleAnimationSubmit = async (prompt: string) => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      console.warn("Attempted to submit empty prompt.");
      return;
    }

    setIsLoading(true);

    try {
      const projectId = uuidv4();

      const targetUrl = `/project/${projectId}?initialPrompt=${encodeURIComponent(
        trimmedPrompt
      )}`;
      console.log("Navigating to:", targetUrl);
      router.push(targetUrl);
    } catch (error) {
      console.error("Error during animation submission or navigation:", error);
      setIsLoading(false);
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
        <HeroSection
          heroRef={heroRef}
          onSubmitAnimation={handleAnimationSubmit}
          isSubmitLoading={isLoading}
        />
        {/* Other sections */}
        <DemoAnimationSection controls={controls} /> <FeatureSection />
        <ExamplesSection />
        <Footer />
      </div>
    </div>
  );
}
