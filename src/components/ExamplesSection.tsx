import { motion } from "framer-motion";

const ExamplesSection = () => {
  return (
    <section className="py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/0 via-blue-900/30 to-blue-900/0 -z-10"></div>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Visualize Complex Mathematics
            </h2>
            <p className="text-gray-400 mb-6">
              From simple geometric shapes to complex multi-dimensional
              functions, our platform handles the full spectrum of mathematical
              visualizations.
            </p>
            <ul className="space-y-4">
              {[
                "Calculus concepts and derivatives",
                "Linear algebra transformations",
                "Complex number visualizations",
                "Statistical distributions and probability",
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <img src="/checkmark.svg" alt="checkmark" />
                  </div>
                  <span className="text-gray-300">{item}</span>
                </motion.li>
              ))}
            </ul>
            <div className="mt-8">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
              >
                <span>View Examples</span>
                <img
                  src="/right-arrow.svg"
                  alt="right arrow"
                  className="w-6 h-6 "
                />
              </motion.button>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Mathematical animation placeholder */}
                <svg
                  width="200"
                  height="200"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="opacity-70"
                >
                  <path
                    d="M100 30C61.3401 30 30 61.3401 30 100C30 138.66 61.3401 170 100 170C138.66 170 170 138.66 170 100C170 61.3401 138.66 30 100 30Z"
                    stroke="white"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="animate-[spin_20s_linear_infinite]"
                  />
                  <path
                    d="M100 50C72.3858 50 50 72.3858 50 100C50 127.614 72.3858 150 100 150C127.614 150 150 127.614 150 100C150 72.3858 127.614 50 100 50Z"
                    stroke="#8B5CF6"
                    strokeWidth="1"
                    className="animate-[spin_15s_linear_infinite_reverse]"
                  />
                  <path
                    d="M100 70C83.4315 70 70 83.4315 70 100C70 116.569 83.4315 130 100 130C116.569 130 130 116.569 130 100C130 83.4315 116.569 70 100 70Z"
                    stroke="#3B82F6"
                    strokeWidth="1"
                    className="animate-[spin_10s_linear_infinite]"
                  />
                  <path
                    d="M30 100H170"
                    stroke="white"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                  />
                  <path
                    d="M100 30V170"
                    stroke="white"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                  />
                  <path
                    d="M58.5786 58.5786L141.421 141.421"
                    stroke="white"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                  />
                  <path
                    d="M141.421 58.5786L58.5786 141.421"
                    stroke="white"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="5"
                    fill="#3B82F6"
                    className="animate-pulse"
                  />
                </svg>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default ExamplesSection;
