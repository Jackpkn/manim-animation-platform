import { AnimationControls, motion } from "framer-motion";

const DemoAnimationSection = ({
  controls,
}: {
  controls: AnimationControls;
}) => {
  return (
    <motion.div
      initial="hidden"
      animate={controls}
      variants={{
        visible: { opacity: 1, scale: 1 },
        hidden: { opacity: 0, scale: 0.8 },
      }}
      transition={{ duration: 0.7, delay: 0.3 }}
      className="relative max-w-7xl mx-auto md:h-[600px] mb-12 rounded-xl overflow-hidden"
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
  );
};
export default DemoAnimationSection;
