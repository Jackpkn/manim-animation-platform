const HeroBackground = () => {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 overflow-hidden bg-slate-900" // Base dark color, adjust as needed
    >
      {/* Blob 1 */}
      <div
        className="absolute top-[-20%] left-[-10%] h-[300px] w-[300px] animate-blob rounded-full bg-purple-600 opacity-40 blur-3xl filter 
                   md:h-[500px] md:w-[500px] animation-delay-2000"
      ></div>

      {/* Blob 2 */}
      <div
        className="absolute bottom-[-15%] right-[-15%] h-[350px] w-[350px] animate-blob rounded-full bg-sky-500 opacity-30 blur-3xl filter
                   md:h-[600px] md:w-[600px] animation-delay-4000"
      ></div>

      {/* Blob 3 (optional, for more depth) */}
      <div
        className="absolute top-[10%] right-[20%] h-[250px] w-[250px] animate-blob rounded-full bg-pink-500 opacity-20 blur-3xl filter
                   md:h-[400px] md:w-[400px]"
      ></div>

      {/* Optional: Static gradient overlay for more texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/30 to-black/50"></div>
    </div>
  );
};

export default HeroBackground;
