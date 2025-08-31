"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const hacRef = useRef<HTMLDivElement>(null);
  const athonRef = useRef<HTMLDivElement>(null);
  const kRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const brownCircleRef = useRef<HTMLDivElement>(null);
  const leftBracketRef = useRef<HTMLDivElement>(null);
  const rightBracketRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const topTextRef = useRef<HTMLDivElement>(null);
  const bottomTextRef = useRef<HTMLDivElement>(null);
  const topDecorRef = useRef<HTMLDivElement>(null);
  const glitchLinesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const ctx = gsap.context(() => {
      gsap.set(imageRef.current, { scale: 4, opacity: 1, zIndex: 30 });
      gsap.set(
        [
          hacRef.current,
          athonRef.current,
          kRef.current,
          brownCircleRef.current,
          leftBracketRef.current,
          rightBracketRef.current,
          topDecorRef.current,
          glitchLinesRef.current,
        ],
        { opacity: 0 },
      );
      gsap.set(contentRef.current, { opacity: 0, y: 50 });
      gsap.set(topTextRef.current, { opacity: 0, y: -100 });
      gsap.set(bottomTextRef.current, { opacity: 0, y: 100 });
      gsap.set(hacRef.current, { x: -300 });
      gsap.set(athonRef.current, { x: 300 });
      gsap.set(kRef.current, { y: 50 });
      gsap.set(leftBracketRef.current, { x: -50 });
      gsap.set(rightBracketRef.current, { x: 50 });
      gsap.set(topDecorRef.current, { scale: 0.8 });
      gsap.set(glitchLinesRef.current, { x: -50 });

      const images = gsap.utils.toArray<HTMLImageElement>(".hackathon-image");

      const predefinedPositions = [
        { x: -200, y: -120, scale: 0.9, rotation: 0 },
        { x: 0, y: 40, scale: 1, rotation: 0 },
        { x: 0, y: -130, scale: 1.0, rotation: 0 },
        { x: 100, y: -110, scale: 0.8, rotation: 0 },
        { x: 200, y: -120, scale: 0.9, rotation: 0 },
        { x: -240, y: -40, scale: 0.6, rotation: 0 },
        { x: -120, y: -60, scale: 1.1, rotation: 0 },
        { x: -60, y: -50, scale: 0.8, rotation: 0 },
        { x: 60, y: -45, scale: 0.9, rotation: 0 },
        { x: 120, y: -55, scale: 0.7, rotation: 0 },
        { x: -160, y: 40, scale: 1.0, rotation: 0 },
        { x: -80, y: 60, scale: 0.8, rotation: 0 },
        { x: 80, y: 50, scale: 0.9, rotation: 0 },
        { x: 160, y: 45, scale: 0.7, rotation: 0 },
      ];

      images.forEach((img, i) => {
        const position = predefinedPositions[i % predefinedPositions.length];

        gsap.set(img, {
          opacity: 1,
          x: position.x + "%",
          y: position.y + "%",
          scale: position.scale,
          rotation: position.rotation,
          zIndex: 10 + i,
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "170% bottom",
          scrub: 1,
          pin: true,
        },
      });

      tl.to(
        images,
        {
          x: 0,
          y: 0,
          scale: 0.8,
          rotation: 0,
          duration: 2,
          ease: "power2.out",
          stagger: 0.05,
        },
        0,
      )
        .to(
          images,
          {
            scale: 0.4,
            duration: 1.5,
            ease: "power2.out",
          },
          "-=1",
        )
        .to(
          images,
          {
            scale: 0.01,
            opacity: 0,
            duration: 1,
            ease: "power2.out",
          },
          "-=0.5",
        );

      tl.to(
        imageRef.current,
        { scale: 0.4, duration: 2, ease: "power2.out" },
        0,
      )
        .to(
          imageRef.current,
          { scale: 0.01, opacity: 0, duration: 1.5, ease: "power2.out" },
          "-=0.5",
        )
        .to(
          hacRef.current,
          { x: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
          "-=1.5",
        )
        .to(
          athonRef.current,
          { x: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
          "-=1.7",
        )
        .to(
          leftBracketRef.current,
          { x: -2, opacity: 1, duration: 1.5, ease: "power2.out" },
          "-=2.2",
        )
        .to(
          rightBracketRef.current,
          { x: 2, opacity: 1, duration: 1.5, ease: "power2.out" },
          "-=2.2",
        )
        .to(
          kRef.current,
          { y: 0, opacity: 1, duration: 2, ease: "power2.out" },
          "-=1",
        )
        .to(
          brownCircleRef.current,
          { opacity: 1, duration: 1, ease: "power2.out" },
          "-=1.5",
        )
        .to(
          contentRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: "power2.out",
            onComplete: () => setShowContent(true),
          },
          "-=1",
        )
        .to(
          topTextRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power2.out",
          },
          "-=0.5",
        )
        .to(
          bottomTextRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power2.out",
          },
          "-=1",
        )
        .to(
          topDecorRef.current,
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power2.out",
          },
          "-=1.5",
        )
        .to(
          glitchLinesRef.current,
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          "-=1.2",
        );
    }, containerRef);

    return () => ctx.revert();
  }, [isClient]);

  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white"></div>
    );
  }

  const images = [
    { src: "/images/IMG_1.jpg", alt: "Innovation workspace 1" },
    { src: "/images/IMG_3.webp", alt: "Innovation workspace 2" },
    { src: "/images/IMG_4.webp", alt: "Modern office workspace" },
    { src: "/images/IMG_5.webp", alt: "Creative studio space" },
    { src: "/images/IMG_6.webp", alt: "Tech startup office" },
    { src: "/images/IMG_2.webp", alt: "Cozy library corner" },
    { src: "/images/IMG_7.webp", alt: "Collaborative workspace 7" },
    { src: "/images/IMG_8.webp", alt: "Innovation lab 8" },
    { src: "/images/IMG_9.webp", alt: "Developer workspace 9" },
    { src: "/images/IMG_10.webp", alt: "Creative coding space 10" },
    { src: "/images/IMG_11.webp", alt: "Modern tech hub 11" },
    { src: "/images/IMG_12.webp", alt: "Innovation center 12" },
    { src: "/images/IMG_13.webp", alt: "Developer lounge 13" },
    { src: "/images/IMG_14.webp", alt: "Startup workspace 14" },
  ];

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-x-clip text-white"
    >
      <div className="relative flex min-h-screen flex-col items-center justify-center">
        {/* === Scaled Text Block === */}
        <div className="flex scale-45 flex-col items-center sm:scale-75 lg:scale-100">
          <div className="font-orbitron flex items-end justify-center gap-2">
            {/* DEV */}
            <div
              ref={hacRef}
              className="text-9xl leading-none font-black tracking-tight text-white opacity-0 select-none"
            >
              DEV
            </div>

            {/* H (placeholder where images overlay from outside) */}
            <div
              ref={kRef}
              className="relative text-9xl leading-none font-black tracking-tight text-[#a3ff12] opacity-0 select-none"
            >
              H
            </div>

            {/* ACK */}
            <div
              ref={athonRef}
              className="-ml-1 text-9xl leading-none font-black tracking-tight text-white opacity-0 select-none"
            >
              ACK
            </div>
          </div>
        </div>

        {/* === Images container OUTSIDE scale === */}
        <div
          ref={imageRef}
          className="absolute flex items-center justify-center"
          style={{
            // Position images over the "H" area
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <div className="relative h-[60px] w-[90px]">
            {images.map((img, i) => (
              <Image
                key={i}
                src={img.src || "/placeholder.svg"}
                alt={img.alt}
                width={190}
                height={160}
                className="hackathon-image absolute inset-0 h-full w-full object-cover opacity-0 shadow-lg"
              />
            ))}
          </div>
        </div>

        {/* Content under DEVHACK */}
        <div
          ref={contentRef}
          className="flex flex-col items-center space-y-2 px-4 opacity-0 sm:mt-10"
        >
          <div className="max-w-4xl text-center">
            <p className="mb-4 font-mono text-sm leading-relaxed text-gray-300 sm:text-base md:text-lg">
              Join us for an intense 36-hour hackathon where innovation meets
              execution. Build, code, and create the future in one epic weekend
              of non-stop development.
            </p>
          </div>

          <div className="font-orbitron flex gap-4">
            <button
              className="bg-primary relative flex cursor-pointer items-center gap-2 px-5 py-2 text-xs font-bold tracking-widest text-black uppercase transition"
              style={{
                clipPath:
                  "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)",
              }}
            >
              <Link href={"/register"}>Know More</Link>
            </button>
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 h-24 w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent" />
      </div>
    </div>
  );
}
