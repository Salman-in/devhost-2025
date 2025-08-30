import DecryptText from "@/components/animated/TextAnimation";
import React from "react";

export default function WIP() {
  return (
    <div className="text-primary flex h-screen w-screen items-center justify-center">
      <DecryptText
        text="> Registrations Opening Soon!"
        startDelayMs={200}
        trailSize={3}
        flickerIntervalMs={50}
        revealDelayMs={100}
        className="font-orbitron text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase text-center h-14"
      />
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
