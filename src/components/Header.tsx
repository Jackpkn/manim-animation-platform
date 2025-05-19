"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import React from "react";
import UserDatabaseSync from "./UserDatabaseSync";

export default function Header() {
  const { isSignedIn } = useUser();

  return (
    <>
      <UserDatabaseSync />

      <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6 backdrop-blur-md bg-black/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <img
                src="/logo.svg"
                alt="Manim Logo"
                className="w-full h-full p-1"
              />
            </div>
            <span className="font-semibold text-xl">PromptViz</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors cursor-pointer">
                    Sign Up
                  </button>
                </SignUpButton>
              </>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
