// src/components/ExamplesSection.tsx

import { motion } from "framer-motion";
import {
  Sigma,
  Infinity,
  GitCommitHorizontal,
  Box,
  ArrowRight,
} from "lucide-react";
import clsx from "clsx";

const exampleItems = [
  {
    icon: Infinity,
    title: "Calculus",
    description: "Derivatives, integrals, and limits brought to life.",
  },
  {
    icon: GitCommitHorizontal,
    title: "Linear Algebra",
    description: "Visualize vector spaces and matrix transformations.",
  },
  {
    icon: Sigma,
    title: "Statistics",
    description: "Animate probability distributions and data sets.",
  },
  {
    icon: Box,
    title: "Geometry",
    description: "Explore shapes and theorems in 2D and 3D space.",
  },
];

const ExamplesSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-to-br from-blue-600/40 to-purple-600/30 rounded-full blur-3xl opacity-40 -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              From Core Concepts to Complex Frontiers
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              Our platform handles the full spectrum of mathematical
              visualizations, making abstract ideas intuitive and engaging for
              everyone.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/20 transition-all duration-300 text-lg font-semibold"
            >
              Explore Gallery
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>

          {/* Right Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-2 gap-4 md:gap-6"
          >
            {exampleItems.map((item, index) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={clsx(
                  "p-6 rounded-2xl border border-white/10 aspect-square flex flex-col justify-center",
                  index % 3 === 0 && "bg-blue-900/20",
                  index % 3 === 1 && "bg-purple-900/20",
                  index % 3 === 2 && "bg-blue-900/30"
                )}
              >
                <item.icon className="w-10 h-10 mb-4 text-blue-300" />
                <h3 className="text-xl font-bold text-gray-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ExamplesSection;
