const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between">
        <div className="mb-8 md:mb-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <img src="/logo.svg" alt="logo" />
            </div>
            <span className="font-semibold text-xl">Manim</span>
          </div>
          <p className="text-gray-400 max-w-xs">
            Transform mathematical concepts into beautiful animations with AI
            assistance.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8"></div>
      </div>
      <div className="mt-12 pt-8 border-t border-white/10 text-center">
        <p className="text-gray-500 text-sm">
          © 2025 Manim Animation Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
export default Footer;
