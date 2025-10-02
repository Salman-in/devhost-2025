"use client";

import { Fragment, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import Image from "next/image";
import { ClippedButton } from "@/components/ClippedButton";
import DecryptText from "@/components/animated/TextAnimation";
import { useRouter } from "next/navigation";

const speakers = [
  {
    id: 1,
    name: "Swapnil Agarwal",
    title: "CEO of Cactro",
    bio: "Leading Cactro and driving innovative projects in tech.",
    img: "/speakers/swapnil.png",
    link: "#",
    presence: { place: "Devtalk", time: "3 PM - 4 PM" },
  },
  {
    id: 2,
    name: "Anantha Krishnan Potti",
    title: "Security Operations Lead, OLA",
    bio: "Oversees security operations and ensures platform integrity.",
    img: "/speakers/swapnil.png",
    link: "#",
    presence: { place: "Masterclass", time: "3 PM - 4 PM" },
  },
  {
    id: 3,
    name: "Akanksha Doshi",
    title: "EG Speaker",
    bio: "Contributes to open-source projects and maintains Excalidraw.",
    img: "/speakers/swapnil.png",
    link: "#",
    presence: { place: "Masterclass", time: "3 PM - 4 PM" },
  },
];

export default function SpeakerPage() {
  const [index, setIndex] = useState(0);
  const router = useRouter();

  const next = () => {
    setIndex((prev) => (prev + 1) % speakers.length);
  };

  const prev = () => {
    setIndex((prev) => (prev - 1 + speakers.length) % speakers.length);
  };

  return (
    <div className="font-orbitron relative h-screen w-full overflow-hidden bg-black">
      <div className="font-orbitron absolute top-4 left-4 z-20 flex gap-4 md:top-10 md:left-10">
        <ClippedButton onClick={() => router.push("/")}>Back</ClippedButton>
      </div>
      {/* Top Section */}
      <div className="relative flex h-3/4 w-full flex-col items-center justify-center p-6 md:p-12">
        <div
          key={speakers[index].id}
          className="relative mt-18 flex h-full w-full max-w-4xl flex-col items-center justify-center md:flex-row md:space-x-8"
        >
          {/* Speaker Image */}
          <div className="border-primary relative h-64 w-64 flex-shrink-0 overflow-hidden rounded-full border-2 bg-[#101810] md:h-80 md:w-80">
            <Image
              src={speakers[index].img}
              alt={speakers[index].name}
              className="h-full w-full object-cover"
              height={320}
              width={320}
              draggable={false}
            />
          </div>

          {/* Speaker Top Content */}
          <div className="mt-6 flex-1 space-y-4 text-center md:mt-0 md:text-left">
            {/* Name */}
            <h2 className="text-primary text-2xl font-bold md:text-4xl">
              {speakers[index].name}
            </h2>

            {/* Title */}
            <DecryptText
              text={`> ${speakers[index].title}`}
              className="mt-1 h-4 text-sm text-zinc-400 md:text-lg"
            />

            {/* Bio */}
            <p className="text-sm leading-relaxed text-zinc-500 md:text-base">
              {speakers[index].bio}
            </p>

            <div className="border-primary/70 mt-2 border-t"></div>

            {/* Presence */}
            <div className="mt-2 flex flex-row items-center justify-center space-y-0 space-x-4 md:justify-start">
              <span className="font-dystopian text-3xl uppercase">
                {speakers[index].presence.place}
              </span>
              <span className="text-primary">
                {speakers[index].presence.time}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prev}
          className="bg-primary absolute top-1/2 left-4 -translate-y-1/2 rounded-full p-2 shadow-md transition-transform hover:scale-110"
        >
          <ChevronLeft className="text-black" size={20} />
        </button>
        <button
          onClick={next}
          className="bg-primary absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-2 shadow-md transition-transform hover:scale-110"
        >
          <ChevronRight className="text-black" size={20} />
        </button>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-24 left-1/2 flex -translate-x-1/2 space-x-2">
        {speakers.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIndex(i);
            }}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === index ? "bg-primary" : "bg-zinc-600"
            }`}
          />
        ))}
      </div>

      {/* Bottom Info Bar */}
      <div className="border-primary/50 absolute bottom-0 z-10 flex w-full flex-row items-center justify-between border-t bg-black px-6 py-4">
        <div className="text-center md:text-left">
          <h2 className="text-xl font-bold text-white">
            {speakers[index].name}
          </h2>
          <p className="text-primary text-sm">{speakers[index].title}</p>
        </div>
        <div>
          <ClippedButton>
            <span className="hidden sm:block">Profile</span>
            <ExternalLink size={16} />
          </ClippedButton>
        </div>
      </div>
    </div>
  );
}
