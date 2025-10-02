"use client";

import Link from "next/link";
import { ClippedButton } from "./ClippedButton";

export default function SpeakersInfo() {
  return (
    <section className="relative py-20 bg-black flex flex-col items-center justify-center">
      <h2 className="font-orbitron text-primary text-center text-4xl font-bold tracking-widest md:text-5xl mb-8 uppercase">
        Meet Our Speakers
      </h2>
      <p className="max-w-xl text-center text-gray-300 font-mono text-base md:text-lg mb-8">
        Discover the minds shaping our event! Get to know the speakers who will share their expertise, insights, and vision for the future of technology.
      </p>
      <div className="flex justify-center">
        <Link href="/speakers">
          <span className="block">
            <ClippedButton innerBg="bg-primary" textColor="text-black" className="px-8 py-4 font-orbitron text-lg font-bold tracking-wide">
              View Speakers
            </ClippedButton>
          </span>
        </Link>
      </div>
    </section>
  );
}
