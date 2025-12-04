// import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Mock Clerk
const useUser = () => ({ isSignedIn: true });
const UserButton = ({ afterSignOutUrl }: any) => <div className="w-8 h-8 bg-blue-500 rounded-full"></div>;
const SignInButton = ({ children }: any) => <>{children}</>;
const SignUpButton = ({ children }: any) => <>{children}</>;

export default function Header() {
  const { isSignedIn } = useUser();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "py-3 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 shadow-lg"
        : "py-5 bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            {/* Fallback if logo.svg is missing or just use text/icon */}
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            PromptViz
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <div className="flex items-center gap-4">
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm font-medium bg-white text-black px-5 py-2 rounded-full hover:bg-slate-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                >
                  Get Started
                </motion.button>
              </SignUpButton>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
