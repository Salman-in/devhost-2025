"use client";
import DecryptText from "@/components/animated/TextAnimation";
import React from "react";
import { motion } from "motion/react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-primary flex h-screen w-screen flex-col items-center justify-center gap-8">
      <DecryptText
        text="404 Not Found"
        startDelayMs={200}
        trailSize={3}
        flickerIntervalMs={50}
        revealDelayMs={100}
        className="font-orbitron md:text5xl h-14 text-center text-2xl uppercase sm:text-4xl lg:text-6xl"
      />
      <motion.div
        className="font-orbitron flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }} // blink effect
        transition={{
          duration: 0.01, // total duration of blinking
          ease: "easeInOut",
          delay: 1, // wait before starting
        }}
        viewport={{ once: true }}
      >
        <button
          className="bg-primary relative flex cursor-pointer items-center gap-2 px-5 py-2 text-xs font-bold tracking-widest text-black uppercase transition"
          style={{
            clipPath:
              "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)",
          }}
        >
          <Link href={"/"} replace>
            Go Back
          </Link>
        </button>
      </motion.div>
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
        linear-gradient(#a3ff12 2px, transparent 1px),
        linear-gradient(90deg, #a3ff12 2px, transparent 1px)
      `,
            backgroundSize: "80px 80px",
            backgroundPosition: "center",
          }}
        ></div>
      </div>
    </div>
  );
}
