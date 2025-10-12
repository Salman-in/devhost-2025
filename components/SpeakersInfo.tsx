"use client";

import Link from "next/link";
import { ClippedButton } from "./ClippedButton";

export default function SpeakersInfo() {
  return (
    <section className="relative flex flex-col items-center justify-center bg-black pb-24">
      {/* <div className="absolute top-5 left-5 z-10 h-10 w-10 border-t-2 border-l-2 border-[#c3ff49]/50" />
      <div className="absolute top-5 right-5 z-10 h-10 w-10 border-t-2 border-r-2 border-[#c3ff49]/50" />
      <div className="absolute bottom-5 left-5 z-10 h-10 w-10 border-b-2 border-l-2 border-[#c3ff49]/50" />
      <div className="absolute right-5 bottom-5 z-10 h-10 w-10 border-r-2 border-b-2 border-[#c3ff49]/50" /> */}
      <h2 className="font-orbitron text-primary mb-8 text-center text-4xl font-bold tracking-widest uppercase md:text-5xl">
        Meet Our Speakers
      </h2>
      <p className="mb-8 max-w-xl px-4 text-center font-mono text-base text-gray-300 md:text-lg">
        Discover the minds shaping our event! Get to know the speakers who will
        share their expertise, insights, and vision for the future of
        technology.
      </p>
      <div className="flex justify-center">
        <Link href="/speakers">
          <span className="block">
            <ClippedButton
              innerBg="bg-primary"
              textColor="text-black"
              className="font-orbitron px-8 pt-4 text-lg font-bold tracking-wide"
            >
              View Speakers
            </ClippedButton>
          </span>
        </Link>
      </div>
    </section>
  );
}
