import React from "react";
import ScrollVelocity from "./ui/ScrollVelocity";
import { ClippedButton } from "./ClippedButton";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

export default function CallToAction() {
  const router = useRouter();
  return (
    <motion.div className="absolute bottom-2/7 w-screen space-y-4 pt-8 sm:bottom-1/5">
      <div className="relative mx-auto w-full max-w-4xl overflow-hidden">
        <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-12 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-12 bg-gradient-to-l from-black to-transparent" />

        <ScrollVelocity
          texts={["Hackathon Registrations Open"]}
          velocity={80}
          delay={1600}
          className="font-orbitron text-sm tracking-widest uppercase opacity-80 sm:text-lg"
        />
      </div>
      <div className="mx-auto w-fit">
        <ClippedButton
          innerBg="bg-black"
          outerBg="bg-primary"
          textColor="text-primary"
          onClick={() => router.push("/hackathon")}
        >
          Join Hackathon
        </ClippedButton>
      </div>
    </motion.div>
  );
}
