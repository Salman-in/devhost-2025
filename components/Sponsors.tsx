"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const titleSponsor = {
  src: "/sponsors/EG.png",
  alt: "Title Sponsor",
  href: "https://egsoftware.com/global/about-us",
};

// const coSponsor = {
//   src: "/sponsors/EG.png",
//   alt: "Co-Sponsor",
//   href: "https://eg.com",
// };

const goodwillSponsor = {
  src: "/sponsors/Wizdom.png",
  alt: "Goodwill Sponsor",
  href: "https://www.wizx.org/",
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
      className="relative flex items-center justify-center overflow-hidden py-28"
    >
      <div className="absolute top-5 left-5 z-10 h-10 w-10 border-t-2 border-l-2 border-[#c3ff49]/50" />
      <div className="absolute top-5 right-5 z-10 h-10 w-10 border-t-2 border-r-2 border-[#c3ff49]/50" />
      <div className="absolute bottom-5 left-5 z-10 h-10 w-10 border-b-2 border-l-2 border-[#c3ff49]/50" />
      <div className="absolute right-5 bottom-5 z-10 h-10 w-10 border-r-2 border-b-2 border-[#c3ff49]/50" />
      <div className="absolute top-0 h-12 w-full bg-gradient-to-b from-black/95 via-black/80 to-transparent" />

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
          className="flex flex-col items-center gap-12 md:flex-row md:justify-center"
        >
          {/* Title Sponsor */}
          <div className="flex flex-col items-center gap-3">
            <a
              href={titleSponsor.href}
              target="_blank"
              rel="noopener noreferrer"
              className="relative h-[170px] w-[360px]"
            >
              <Image
                src={titleSponsor.src}
                alt={titleSponsor.alt}
                fill
                style={{ objectFit: "contain" }}
              />
            </a>
            <p className="font-orbitron text-primary text-base uppercase">
              Title Sponsor
            </p>
          </div>

          {/* Goodwill Sponsor */}
          <div className="flex flex-col items-center gap-3">
            <a
              href={goodwillSponsor.href}
              target="_blank"
              rel="noopener noreferrer"
              className="relative h-[170px] w-[360px]"
            >
              <Image
                src={goodwillSponsor.src}
                alt={goodwillSponsor.alt}
                fill
                style={{ objectFit: "contain" }}
              />
            </a>
            <p className="font-orbitron text-primary text-base uppercase">
              Goodwill Sponsor
            </p>
          </div>
        </div>

        {/* <div
          className="flex items-center justify-center text-3xl md:text-4xl"
          style={{ height: "120px", position: "relative", overflow: "hidden" }}
        >
          <div className="absolute top-0 left-0 z-10 h-full w-12 bg-gradient-to-r from-black to-transparent" />
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
          <div className="absolute top-0 right-0 z-10 h-full w-12 bg-gradient-to-l from-black to-transparent" />
        </div> */}
      </div>
    </section>
  );
}
