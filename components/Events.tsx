"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DecryptText from "./animated/TextAnimation";

import { events } from "@/app/data/eventsData";

gsap.registerPlugin(ScrollTrigger);

type EventsProps = {
  onCardClick?: (id: number) => void;
};

export default function Events({ onCardClick }: EventsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const eventsContentRef = useRef<HTMLDivElement>(null);
  const eventsTitleRef = useRef<HTMLHeadingElement>(null);
  const eventsCaptionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      requestAnimationFrame(() => {
        gsap.set([eventsTitleRef.current, eventsCaptionRef.current, eventsContentRef.current], { opacity: 0, y: 30 });
        gsap.set(bgRef.current, { scaleY: 0, transformOrigin: "top center" });
        gsap.set(cardsRef.current, { y: 30 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "top 20%",
            scrub: 1,
          },
        });

        tl.to(eventsContentRef.current, { opacity: 1, duration: 0.8, ease: "power2.out" }, 0)
          .to(eventsTitleRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.1)
          .to(eventsCaptionRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.2)
          .to(bgRef.current, { scaleY: 1, duration: 1, ease: "power2.out" }, 0.2);

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
      });

      const updateClipPath = () => {
        if (!bgRef.current) return;
        const width = window.innerWidth;
        bgRef.current.style.clipPath =
          width >= 1024
            ? "polygon(0% 0%, 100% 0%, 100% 92%, 85% 100%, -5% 100%)"
            : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
      };

      updateClipPath();
      window.addEventListener("resize", updateClipPath);
      return () => window.removeEventListener("resize", updateClipPath);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="relative flex flex-col items-center overflow-hidden bg-black py-20 md:pb-[20vh]">
      <div
        ref={bgRef}
        className="bg-opacity-5 bg-primary absolute inset-0 z-0"
        style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 92%, 85% 100%, -5% 100%)" }}
      />

      <div className="font-orbitron absolute top-6 left-6 text-sm font-bold text-black opacity-80">// DEVHOST</div>
      <div className="font-orbitron absolute top-6 right-6 text-sm font-bold text-black opacity-80">2025</div>

      <div ref={eventsContentRef} className="relative z-10 mb-16 px-4 text-center">
        <h1 ref={eventsTitleRef} className="font-orbitron mb-6 text-center text-4xl font-bold text-black sm:text-7xl">
          DEVHOST EVENTS
        </h1>
        <div ref={eventsCaptionRef} className="mt-4 px-4 text-lg sm:text-xl">
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
      <div className="relative z-10 grid w-full max-w-[1200px] grid-cols-1 gap-8 px-4 md:grid-cols-2">
        {events.map((event, idx) => {
          const noRegister = [6, 7, 8].includes(event.id);

          return (
            <div
              key={event.id}
              ref={(el) => {
                if (el) cardsRef.current[idx] = el;
              }}
              className="relative mx-auto w-full overflow-hidden cursor-pointer"
              style={{
                clipPath:
                  "polygon(20px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
              }}
              onClick={() => onCardClick && onCardClick(event.id)}
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
                  className="relative aspect-square sm:aspect-[4/5] w-full overflow-hidden sm:w-1/2"
                  style={{
                    clipPath:
                      "polygon(20px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
                  }}
                >
                  <Image src={event.image} alt={event.title} width={500} height={500} className="h-full w-full object-cover" />
                </div>

                <div className="mt-3 flex flex-1 flex-col justify-between px-2 py-4 pl-0 sm:mt-0 sm:pl-4">
                  <div>
                    <h2 className="font-orbitron mb-4 text-lg font-bold text-[#b4ff39] lg:text-xl">&gt; {event.title}</h2>
                    <p className="mb-1 text-sm text-white/90 italic">{event.tagline}</p>
                    <p className="mb-2 text-xs text-white/70 lg:text-sm">{event.description}</p>
                    <div className="space-y-0.5 text-xs text-white/80 lg:text-sm">
                      <p>
                        <span className="mr-1 font-semibold text-[#b4ff39]">Date:</span>
                        {event.date}
                      </p>
                      <p>
                        <span className="mr-1 font-semibold text-[#b4ff39]">Time:</span>
                        {event.time}
                      </p>
                      <p>
                        <span className="mr-1 font-semibold text-[#b4ff39]">Organizer:</span>
                        {event.organizer}
                      </p>
                      <p>
                        <span className="mr-1 font-semibold text-[#b4ff39]">Contact:</span>
                        {event.contact}
                      </p>
                    </div>
                  </div>

                  {!noRegister && (
                    <div className="mt-6 flex justify-start">
                      <button
                        className="font-orbitron flex w-full items-center justify-center gap-2 bg-[#b4ff39] px-6 py-2 text-center text-xs font-bold tracking-wider text-black uppercase"
                        style={{
                          clipPath:
                            "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
                        }}
                        // Optional: handle button click separately without bubbling
                        onClick={(e) => { e.stopPropagation(); onCardClick && onCardClick(event.id); }}
                      >
                        Register
                      </button>
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
