import { AnimationControls, motion } from "framer-motion";
import { PlayCircle } from "lucide-react";

const DemoAnimationSection = ({
  controls,
}: {
  controls: AnimationControls;
}) => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          See it in <span className="text-blue-400">Action</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-lg text-gray-400 max-w-2xl mb-12"
        >
          Our AI interprets your prompts to generate fluid, accurate, and
          insightful animations of mathematical ideas.
        </motion.p>

        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, scale: 1, y: 0 },
            hidden: { opacity: 0, scale: 0.9, y: 50 },
          }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] p-2 rounded-2xl bg-white/5 border border-white/10 shadow-2xl shadow-blue-900/20"
        >
          {/* Background Aurora Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl opacity-50 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl opacity-50 animate-pulse animation-delay-2000"></div>

          <div className="relative w-full h-full rounded-xl overflow-hidden backdrop-blur-sm flex items-center justify-center">
            {/* Upgraded SVG Placeholder */}
            <svg
              width="80%"
              height="80%"
              viewBox="0 0 400 200"
              className="opacity-80"
            >
              <defs>
                <linearGradient id="sineGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <path
                d="M0 100 H400 M200 0 V200"
                stroke="white"
                strokeWidth="0.5"
                strokeOpacity="0.2"
              />
              {/* Sine Wave */}
              <path
                d="M 0 100 C 50 20, 150 20, 200 100 S 350 180, 400 100"
                stroke="url(#sineGradient)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="600"
                className="animate-draw"
              />
              <style>{`
                .animate-draw {
                  animation: draw 4s ease-in-out infinite alternate;
                }
                @keyframes draw {
                  from { stroke-dashoffset: 600; }
                  to { stroke-dashoffset: 0; }
                }
              `}</style>
            </svg>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors duration-300 text-gray-200"
          >
            <PlayCircle className="w-5 h-5 text-blue-400" />
            Play Full Demo
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoAnimationSection;
