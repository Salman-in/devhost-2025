"use client";

import React, { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { gsap } from "gsap";

const Map = () => {
  const topCut1 = useRef<HTMLDivElement>(null);
  const topCut2 = useRef<HTMLDivElement>(null);
  const bottomCut1 = useRef<HTMLDivElement>(null);
  const bottomCut2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animateCut = (
      el: HTMLDivElement | null,
      y: number,
      duration: number,
      skew: number,
    ) => {
      if (!el) return;
      gsap.to(el, {
        y: y,
        skewY: skew,
        opacity: 0.15,
        duration: duration,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    };

    animateCut(topCut1.current, 6, 5, 3);
    animateCut(topCut2.current, -6, 6, -3);
    animateCut(bottomCut1.current, -6, 5, -3);
    animateCut(bottomCut2.current, 6, 6, 3);
  }, []);

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 text-white sm:px-6">
      {/* Top & bottom fade gradient */}
      <div className="absolute top-0 h-24 w-full bg-gradient-to-b from-black/95 via-black/80 to-transparent" />
      <div className="absolute bottom-0 h-24 w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent" />

      {/* Main Content */}
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 py-12 md:grid-cols-2 xl:grid-cols-5">
        {/* Left: Text content */}
        <div className="space-y-6 text-center md:text-left lg:col-span-2">
          <h2 className="flex items-center justify-center gap-3 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:justify-start">
            <MapPin className="h-8 w-8 animate-bounce text-[#a3ff12] md:h-12 md:w-12" />
            <span className="font-orbitron text-[#a3ff12] uppercase drop-shadow-[0_0_10px_#a3ff12aa]">
              Location
            </span>
          </h2>

          <h3 className="text-lg font-semibold text-gray-200 sm:text-xl md:text-2xl">
            Sahyadri College of Engineering And Management
          </h3>

          <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-400 sm:text-base md:mx-0">
            Looking to join the fun? You&apos;ll find us right here, where
            passion fuels lasting memories.
          </p>
        </div>

        {/* Right: Map */}
        <div className="relative w-full lg:col-span-3">
          <div
            className="group relative skew-y-0 transform bg-[#a3ff12] transition-all duration-500 ease-in-out hover:skew-y-0 md:-skew-y-2"
            style={{
              clipPath:
                "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
            }}
          >
            {/* Map container */}
            <div
              className="m-[4px] overflow-hidden bg-black shadow-[0_0_40px_#a3ff12aa]"
              style={{
                clipPath:
                  "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
              }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.493800916483!2d74.92293479999999!3d12.866339399999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba358ff28ef6cf3%3A0xe93953598f53c53c!2sSahyadri%20College%20of%20Engineering%20%26%20Management%20(Autonomous)!5e0!3m2!1sen!2sin!4v1635806988908!5m2!1sen!2sin"
                allowFullScreen
                loading="lazy"
                className="h-64 w-full border-0 sm:h-80 md:h-[450px] lg:h-[500px]"
              ></iframe>

              {/* Overlay gradient */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#a3ff12]/15 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Map;
