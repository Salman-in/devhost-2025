"use client";
import React, { Fragment } from "react";
import Logo from "./animated/Logo";
import DecryptText from "./animated/TextAnimation";
import { User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Hero() {
  const router = useRouter();
  const { user, signInWithGoogle } = useAuth();

const handleGoogleLogin = async () => {
  if (user) {
    router.push('/profile');
  } else {
    try {
      await signInWithGoogle();
      // Wait for auth state to update, then redirect
        router.push('/profile');
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  }
};
    
  return (
    <Fragment>
      <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden text-zinc-300">
        <div className="flex flex-col items-center">
          <div className="-mt-24 flex w-full max-w-[250px] flex-col pb-1 sm:max-w-[300px] md:max-w-[400px]">
            <div className="flex items-center justify-center">
              <Image
                priority
                src="/logo_group.png"
                className="w-full object-contain px-3"
                alt="logo"
                width={500}
                height={500}
              />
            </div>
            <p className="text-neon-green font-orbitron py-1 text-center text-xs tracking-wide">
              Presents
            </p>
          </div>

          <Logo className="relative z-10 h-auto w-full max-w-[250px] sm:max-w-[300px] md:max-w-[400px]" />
        </div>

        {/* Cyberpunk side boot logs (left) */}
        <div className="font-orbitron absolute top-10 left-10 text-xs tracking-wider text-zinc-600 sm:text-sm">
          <DecryptText
            text="> INIT SEQUENCE v2.4"
            startDelayMs={200}
            trailSize={6}
            flickerIntervalMs={40}
            revealDelayMs={80}
          />
          <DecryptText
            text="> LOADING MODULES..."
            startDelayMs={800}
            trailSize={6}
            flickerIntervalMs={50}
            revealDelayMs={90}
          />
          <DecryptText
            text="> ACCESS GRANTED"
            startDelayMs={1600}
            trailSize={6}
            flickerIntervalMs={60}
            revealDelayMs={100}
          />
          <DecryptText
            text="> CONTINUE..."
            startDelayMs={2400}
            trailSize={6}
            flickerIntervalMs={60}
            revealDelayMs={100}
          />
        </div>

        {/* UI Corner Brackets */}
        <div className="absolute top-5 left-5 h-10 w-10 border-t-2 border-l-2 border-[#c3ff49]/50" />
        <div className="absolute top-5 right-5 h-10 w-10 border-t-2 border-r-2 border-[#c3ff49]/50" />
        <div className="absolute bottom-5 left-5 z-10 h-10 w-10 border-b-2 border-l-2 border-[#c3ff49]/50" />

        {/* Floating Dock (Top Right) */}
        <div className="font-orbitron absolute top-10 right-10 z-20 flex gap-4">
            <button
              className="bg-primary relative flex cursor-pointer items-center gap-2 px-5 py-2 text-xs font-bold tracking-widest text-black uppercase transition"
              style={{
                clipPath:
                  "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)",
              }}
              onClick={handleGoogleLogin}
            >
              <User size={14} /> Profile
            </button>
        </div>

        {/* Scroll Hint */}
        <div className="font-orbitron text-primary absolute right-5 bottom-5 z-10 flex items-center">
          <span className="mr-2 text-3xl">[</span>
          <DecryptText
            text="Scroll to Explore"
            className="text-sm sm:text-lg"
            startDelayMs={1800}
            trailSize={4}
            flickerIntervalMs={50}
            revealDelayMs={120}
          />
          <span className="ml-2 text-3xl">]</span>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 h-12 w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent" />
      </div>
    </Fragment>
  );
}
