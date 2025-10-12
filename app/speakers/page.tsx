"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import Image from "next/image";
import { ClippedButton } from "@/components/ClippedButton";
import DecryptText from "@/components/animated/TextAnimation";
import { useRouter } from "next/navigation";

const speakers = [
  {
    id: 1,
    name: "Swapnil Agarwal",
    title: "Founder & CEO @ Cactro",
    bio: "Founder of Cactro (formerly Roc8 Careers), transforming tech hiring by emphasizing skills and problem-solving over background. Previously at Amazon and Meesho, Swapnil empowers diverse developers and advocates for fairness in placements.",
    img: "/speakers/swapnil_a.jpg",
    link: "#",
    presence: {
      place: "DevTalk",
      time: "6th November 2025, 10:30am - 11:15am",
    },
  },
  {
    id: 2,
    name: "P. Ananthakrishnan Potti",
    title: "Leading Security Operations @ OLA",
    bio: "Security Operations Engineer II at OLA with expertise in threat detection, incident response, and cloud security. A certified ethical hacker and mentor under Kerala Startup Mission, passionate about cybersecurity education.",
    img: "/speakers/potti.jpg",
    link: "#",
    presence: { place: "DevTalk", time: "7th November 2025, 9:00am - 9:45am" },
  },
  {
    id: 3,
    name: "Aakansha Doshi",
    title: "Core Maintainer @ Project Excalidraw",
    bio: "Principal Software Engineer at Prophecy and core maintainer of Excalidraw, with deep expertise in Canvas APIs and JavaScript. Advocate for open-source sustainability and community mentorship.",
    img: "/speakers/aakansha.jpeg",
    link: "#",
    presence: {
      place: "DevTalk",
      time: "7th November 2025, 10:00am - 10:45am",
    },
  },
  {
    id: 4,
    name: "Vivek Keshore",
    title: "Software Architect @ EPAM Systems",
    bio: "Seasoned Python architect with 12+ years of experience in backend development and cloud architecture. A PyCon India speaker and open-source contributor, he specializes in FastAPI, Flask, and scalable systems.",
    img: "/speakers/vivek.jpg",
    link: "#",
    presence: {
      place: "Masterclass",
      time: "7th November 2025, 1:00pm - 4:00pm",
    },
  },
];

export default function SpeakerPage() {
  const [index, setIndex] = useState(0);
  const router = useRouter();

  const next = () => setIndex((prev) => (prev + 1) % speakers.length);
  const prev = () =>
    setIndex((prev) => (prev - 1 + speakers.length) % speakers.length);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white">
      {/* Subtle grid background */}
      <div className="pointer-events-none fixed inset-0 opacity-10">
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

      {/* Back Button */}
      <div className="absolute top-3 left-3 z-20 md:top-8 md:left-8">
        <ClippedButton onClick={() => router.push("/")}>Back</ClippedButton>
      </div>

      {/* Main Section */}
      <div className="relative flex h-[80%] w-full flex-col items-center justify-center px-4 sm:px-6 md:px-12">
        <div
          key={speakers[index].id}
          className="relative mt-10 flex w-full max-w-4xl flex-col items-center justify-center space-y-4 md:mt-0 md:flex-row md:space-y-0 md:space-x-8"
        >
          {/* Speaker Image */}
          <div className="border-primary relative h-48 w-48 flex-shrink-0 overflow-hidden rounded-full border-2 bg-[#101810] sm:h-60 sm:w-60 md:h-80 md:w-80">
            <Image
              src={speakers[index].img}
              alt={speakers[index].name}
              className="h-full w-full object-cover"
              height={320}
              width={320}
              draggable={false}
            />
          </div>

          {/* Speaker Details */}
          <div className="mt-4 flex-1 space-y-3 text-center md:mt-0 md:text-left">
            <h2 className="text-primary font-orbitron text-xl font-bold sm:text-2xl md:text-4xl">
              {speakers[index].name}
            </h2>
            <DecryptText
              text={`> ${speakers[index].title}`}
              className="font-orbitron mt-1 h-6 text-xs text-zinc-400 sm:text-sm md:text-lg"
            />
            <p className="text-[12px] leading-relaxed text-zinc-500 sm:text-sm md:text-base">
              {speakers[index].bio}
            </p>

            <div className="border-primary/70 mt-2 border-t"></div>

            {/* Presence Info */}
            <div className="mt-3 flex flex-col items-center justify-center md:items-start">
              <span className="font-dystopian text-2xl uppercase sm:text-3xl">
                {speakers[index].presence.place}
              </span>
              <span className="text-primary font-orbitron mt-1 text-base sm:text-lg">
                {speakers[index].presence.time.split(",")[0]}
              </span>
              <span className="font-orbitron text-[10px] text-gray-400 sm:text-sm">
                {speakers[index].presence.time.split(",")[1]?.trim()}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prev}
          className="bg-primary absolute top-1/2 left-2 -translate-y-1/2 rounded-full p-1 shadow-md transition-transform hover:scale-110 sm:p-2"
        >
          <ChevronLeft className="text-black" size={18} />
        </button>
        <button
          onClick={next}
          className="bg-primary absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 shadow-md transition-transform hover:scale-110 sm:p-2"
        >
          <ChevronRight className="text-black" size={18} />
        </button>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 space-x-1 sm:space-x-2">
        {speakers.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === index ? "bg-primary" : "bg-zinc-600"
            }`}
          />
        ))}
      </div>

      {/* Bottom Info Bar */}
      <div className="border-primary/50 font-orbitron absolute bottom-0 z-10 flex w-full flex-row items-center justify-between border-t bg-black px-6 py-4">
        <div className="text-left">
          <h2 className="text-base font-bold text-white">
            {speakers[index].name}
          </h2>
          <p className="text-primary text-xs">{speakers[index].title}</p>
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
