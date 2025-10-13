"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DecryptText from "./animated/TextAnimation";
import { useRouter } from "next/navigation";
import { ClippedButton } from "./ClippedButton";
import { events } from "@/assets/data/events";
import { eventDetails } from "@/assets/data/eventPayment";

gsap.registerPlugin(ScrollTrigger);

export default function Events() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const router = useRouter();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate cards only
      cardsRef.current.forEach((card) => {
        gsap.to(card, {
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            end: "top 60%",
            toggleActions: "play none none none",
          },
        });
      });

      // Responsive clip-path for green background
      const updateClipPath = () => {
        if (!bgRef.current) return;
        const width = window.innerWidth;
        if (width >= 1024) {
          bgRef.current.style.clipPath =
            "polygon(0% 0%, 100% 0%, 100% 92%, 85% 100%, -5% 100%)";
        } else {
          bgRef.current.style.clipPath =
            "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
        }
      };

      updateClipPath();
      window.addEventListener("resize", updateClipPath);
      return () => window.removeEventListener("resize", updateClipPath);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  function onCardClick(eventId: number) {
    router.push(`/events/${eventId}`);
    // router.push(`/register`);
  }

  return (
    <div
      ref={sectionRef}
      className="relative flex flex-col items-center overflow-hidden bg-black py-20 md:pb-[20vh]"
    >
      {/* Static Green Background */}
      <div
        ref={bgRef}
        className="bg-opacity-5 bg-primary absolute inset-0 z-0"
        style={{
          clipPath: "polygon(0% 0%, 100% 0%, 100% 92%, 85% 100%, -5% 100%)",
        }}
      />

      <div className="font-orbitron absolute top-6 left-6 text-sm font-bold text-black opacity-80">
        {"// DEVHOST"}
      </div>
      <div className="font-orbitron absolute top-6 right-6 text-sm font-bold text-black opacity-80">
        2025
      </div>

      {/* Heading */}
      <div className="relative z-10 mb-16 px-4 text-center">
        <h1 className="font-orbitron mb-6 text-center text-4xl font-bold text-black sm:text-7xl">
          DEVHOST EVENTS
        </h1>
        <div className="mt-4 px-4 text-lg sm:text-xl">
          <DecryptText
            text="> Build, Compete, and Leave Your Mark"
            startDelayMs={200}
            trailSize={6}
            flickerIntervalMs={50}
            revealDelayMs={100}
            className="font-orbitron h-8 text-base tracking-wider text-black md:text-xl"
          />
        </div>
      </div>

      {/* Event cards */}
      <div className="relative z-10 grid w-full max-w-[1200px] grid-cols-1 gap-8 px-4 lg:grid-cols-2">
        {events.map((event, idx) => {
          const noRegister = [6, 7, 8].includes(event.id);
          return (
            <div
              key={event.id}
              ref={(el) => {
                if (el) cardsRef.current[idx] = el;
              }}
              className="relative mx-auto w-full overflow-hidden"
              style={{
                clipPath:
                  "polygon(20px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
              }}
            >
              <div
                className="relative z-10 m-[2px] flex h-full flex-col p-4 sm:flex-row"
                style={{
                  clipPath:
                    "polygon(20px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
                  backgroundColor: "#101810",
                }}
              >
                <div
                  className="relative aspect-square w-full overflow-hidden sm:aspect-[4/5] sm:w-1/2"
                  style={{
                    clipPath:
                      "polygon(20px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
                  }}
                >
                  <Image
                    src={event.image}
                    alt={event.title}
                    width={500}
                    height={500}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="mt-3 flex flex-1 flex-col justify-between px-2 py-4 pl-0 sm:mt-0 sm:pl-4">
                  <div>
                    <h2 className="font-orbitron mb-4 text-lg font-bold text-[#b4ff39] lg:text-xl">
                      &gt; {event.title}
                    </h2>
                    <p className="mb-1 text-sm text-white/90 italic">
                      {event.tagline}
                    </p>
                    <p className="mb-2 text-xs text-white/70 lg:text-sm">
                      {event.description}
                    </p>
                    <div className="space-y-0.5 text-xs text-white/80 lg:text-sm">
                      <p>
                        <span className="mr-1 font-semibold text-[#b4ff39]">
                          Date:
                        </span>
                        {event.date}
                      </p>
                      <p>
                        <span className="mr-1 font-semibold text-[#b4ff39]">
                          Time:
                        </span>
                        {event.time}
                      </p>
                      <p>
                        <span className="mr-1 font-semibold text-[#b4ff39]">
                          Organizer:
                        </span>
                        {event.organizer}
                      </p>
                      <p>
                        <span className="mr-1 font-semibold text-[#b4ff39]">
                          Contact:
                        </span>
                        {event.contact}
                      </p>
                      {!noRegister && (
                        <p className="flex items-baseline gap-2">
                          <span className="mr-1 font-semibold text-[#b4ff39]">
                            Amount:
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            ₹{eventDetails[event.id].amount + 50}
                          </span>
                          <span className="font-semibold text-[#b4ff39]">
                            ₹{eventDetails[event.id].amount}
                          </span>
                          / team
                        </p>
                      )}
                    </div>
                  </div>

                  {!noRegister && (
                    <div className="mt-6 flex justify-start">
                      <ClippedButton
                        innerBg="bg-primary"
                        textColor="text-black"
                        className="font-orbitron flex w-full items-center justify-center gap-2 px-6 py-2 text-center text-xs font-bold tracking-wider uppercase"
                        onClick={() => onCardClick(event.id)}
                      >
                        Register
                      </ClippedButton>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
