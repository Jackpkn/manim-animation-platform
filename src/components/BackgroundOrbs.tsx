import React from "react";

export default function BackgroundOrbs() {
  return (
    <div className="absolute inset-0 z-0">
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse"></div>
      <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-600 rounded-full mix-blend-screen filter blur-[96px] opacity-20 animate-pulse delay-700"></div>
      <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-pink-600 rounded-full mix-blend-screen filter blur-[112px] opacity-20 animate-pulse delay-1000"></div>
    </div>
  );
}
