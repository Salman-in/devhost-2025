"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LogoLoop from "../components/ui/LogoLoop";

gsap.registerPlugin(ScrollTrigger);

const titleSponsor = {
  src: "/sponsors/EG.png",
  alt: "Title Sponsor",
  href: "https://egsoftware.com/global/about-us",
};
const coSponsor = {
  src: "/sponsors/EG.png",
  alt: "Co-Sponsor",
  href: "https://eg.com",
};
const goodwillSponsor = {
  src: "/sponsors/EG.png",
  alt: "Goodwill Sponsor",
  href: "https://wizdom.com",
};

const otherSponsors = [
  { src: "/sponsors/EG.png", alt: "Company 1", href: "https://company1.com" },
  { src: "/sponsors/EG.png", alt: "Company 2", href: "https://company2.com" },
];

export default function SponsorsLogo() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sponsorsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([titleRef.current, sponsorsRef.current], { opacity: 0, y: 30 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            end: "top 40%",
            scrub: 1,
          },
        })
        .to(titleRef.current, { opacity: 1, y: 0, duration: 0.4 })
        .to(sponsorsRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0.2);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex items-center justify-center overflow-hidden bg-black py-20"
    >
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
        <h2
          ref={titleRef}
          className="font-orbitron text-primary shadow-primary mb-12 px-1 pb-2 text-center text-2xl font-semibold tracking-widest uppercase sm:text-3xl md:text-5xl"
        >
          SPONSORS
        </h2>

        {/* Main sponsors */}
        <div
          ref={sponsorsRef}
          className="mb-16 flex flex-col items-center gap-12 md:flex-row md:justify-center"
        >
          {/* Co-Sponsor */}
          <div className="flex flex-col items-center gap-3">
            <a
              href={coSponsor.href}
              target="_blank"
              rel="noopener noreferrer"
              className="relative h-[115px] w-[260px] transition-transform hover:scale-105"
            >
              <Image
                src={coSponsor.src}
                alt={coSponsor.alt}
                fill
                style={{ objectFit: "contain" }}
              />
            </a>
            <p className="font-orbitron text-primary/80 text-sm uppercase">
              Co-Sponsor
            </p>
          </div>

          {/* Title Sponsor */}
          <div className="flex flex-col items-center gap-3">
            <a
              href={titleSponsor.href}
              target="_blank"
              rel="noopener noreferrer"
              className="relative h-[170px] w-[360px] transition-transform hover:scale-110"
            >
              <Image
                src={titleSponsor.src}
                alt={titleSponsor.alt}
                fill
                style={{ objectFit: "contain" }}
              />
            </a>
            <p className="font-orbitron text-primary text-base uppercase">
              Main Sponsor
            </p>
          </div>

          {/* Goodwill Sponsor */}
          <div className="flex flex-col items-center gap-3">
            <a
              href={goodwillSponsor.href}
              target="_blank"
              rel="noopener noreferrer"
              className="relative h-[100px] w-[220px] transition-transform hover:scale-105"
            >
              <Image
                src={goodwillSponsor.src}
                alt={goodwillSponsor.alt}
                fill
                style={{ objectFit: "contain" }}
              />
            </a>
            <p className="font-orbitron text-primary/80 text-sm uppercase">
              Goodwill Sponsor
            </p>
          </div>
        </div>

        <div
          className="flex items-center justify-center text-3xl md:text-4xl"
          style={{ height: "120px", position: "relative", overflow: "hidden" }}
        >
          <LogoLoop
            logos={otherSponsors}
            speed={55}
            direction="left"
            logoHeight={90}
            gap={120}
            pauseOnHover
            scaleOnHover
            ariaLabel="Other sponsors"
          />
        </div>
      </div>
    </section>
  );
}
