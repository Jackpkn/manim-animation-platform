import { motion } from "framer-motion";

const FeatureSection = () => {
  return (
    <section className="py-16 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Create complex animations with ease using our AI-powered platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "AI-Powered Generation",
              description:
                "Transform natural language descriptions into complex mathematical animations with our advanced AI engine.",
              icon: (
                <img src="/ai.svg" alt="AI Assistant" className="w-6 h-6" />
              ),
            },
            {
              title: "Real-time Preview",
              description:
                "See your animations render in real-time as you make changes, with no delays or waiting for compilation.",
              icon: (
                <img
                  src="/realtime-preview.svg"
                  alt="reltime preview"
                  className="w-6 h-6"
                />
              ),
            },
            {
              title: "Code Editor",
              description:
                "Fine-tune your animations with our powerful code editor that updates in real-time as you make changes.",
              icon: (
                <img
                  src="/code-editor.svg"
                  alt="code editor"
                  className="w-6 h-6"
                />
              ),
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl inline-block mb-4 border border-white/10">
                <div className="text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default FeatureSection;
