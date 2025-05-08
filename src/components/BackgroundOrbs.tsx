import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Orb {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

export default function BackgroundOrbs() {
  const [orbs, setOrbs] = useState<Orb[]>([]);

  useEffect(() => {
    // Generate random orbs on component mount
    const generateOrbs = () => {
      const orbCount = window.innerWidth < 768 ? 6 : 12;
      const newOrbs: Orb[] = [];

      const gradientColors = [
        "from-blue-500/30 to-purple-600/20",
        "from-purple-500/20 to-indigo-500/30",
        "from-indigo-500/30 to-blue-400/20",
        "from-blue-400/20 to-cyan-500/30",
        "from-cyan-500/20 to-teal-400/30",
      ];

      for (let i = 0; i < orbCount; i++) {
        newOrbs.push({
          id: i,
          x: Math.random() * 100, // percentage of screen width
          y: Math.random() * 100, // percentage of screen height
          size: Math.random() * 300 + 100, // size between 100px and 400px
          color:
            gradientColors[Math.floor(Math.random() * gradientColors.length)],
          duration: Math.random() * 20 + 15, // duration between 15-35s
          delay: Math.random() * -20, // random start time
        });
      }
      setOrbs(newOrbs);
    };

    generateOrbs();
    window.addEventListener("resize", generateOrbs);

    return () => {
      window.removeEventListener("resize", generateOrbs);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className={`absolute rounded-full bg-gradient-to-r ${orb.color} blur-3xl opacity-50`}
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
          }}
          animate={{
            x: [0, Math.random() * 200 - 100, Math.random() * 200 - 100, 0],
            y: [0, Math.random() * 200 - 100, Math.random() * 200 - 100, 0],
            scale: [1, 1.2, 0.9, 1],
            opacity: [0.3, 0.5, 0.2, 0.3],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: orb.delay,
          }}
        />
      ))}

      {/* Dark overlay to ensure text remains readable */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Add subtle noise texture */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
