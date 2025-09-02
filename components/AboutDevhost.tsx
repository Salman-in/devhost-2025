"use client";

import { useEffect, useRef } from "react";
import { Download } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function AboutDevhost() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const captionRef = useRef<HTMLHeadingElement>(null);
  const aboutRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  interface DevhostData {
    title: string;
    caption: string;
    about: string;
    logoSrc: string;
  }

  const devhostData: DevhostData = {
    title: "About Devhost",
    caption: "Expertise Redefined, Experience Reimagined.",
    about:
      "Devhost, the flagship event is a remarkable tech convergence by Sahyadri Open Source Community (SOSC), is set to be an exhilarating experience with an exciting mix of technical and non-technical events. It seeks to equip participants with knowledge and skills, while encouraging curiosity and fostering innovation. With a variety of tech and non-tech battles and events featuring dev talks and workshops led by industry experts, it creates opportunities for both personal development and self-exploration. Join the 36-hour live hack event to bring your ideas to fruition, with challenges designed for every level of experience.",
    logoSrc: "temp.jpg",
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // initial state
      gsap.set(
        [
          titleRef.current,
          captionRef.current,
          aboutRef.current,
          buttonsRef.current,
        ],
        {
          opacity: 0,
          y: 30,
        },
      );

      gsap.set(contentRef.current, { opacity: 0 });

      gsap.set(backgroundRef.current, {
        scaleY: 0,
        transformOrigin: "top center",
      });

      // responsive clipPath setup
      mm.add("(max-width: 640px)", () => {
        gsap.set(backgroundRef.current, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", // rectangle for sm
        });
      });

      mm.add("(min-width: 641px)", () => {
        gsap.set(backgroundRef.current, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%)", // angled for md+
        });
      });

      // timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 100%",
          end: "top 20%",
          scrub: 1,
          toggleActions: "play none none reverse",
        },
      });

      tl.to(
        contentRef.current,
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        },
        0,
      )
        .to(
          titleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          },
          0.1,
        )
        .to(
          captionRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          },
          0.2,
        )
        .to(
          aboutRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          },
          0.3,
        )
        .to(
          buttonsRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: "back.out(1.2)",
          },
          0.4,
        )
        .to(
          backgroundRef.current,
          {
            scaleY: 1,
            duration: 0.6,
            ease: "power2.out",
          },
          0.2,
        );

      // cleanup only once
      return () => mm.revert();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black"
    >
      {/* <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,#a3ff12_1px,transparent_1px)] [background-size:40px_40px] opacity-30" /> */}
      {/* <div className="absolute top-0 h-24 w-full bg-gradient-to-b from-black/95 via-black/80 to-transparent" /> */}

      <div
        ref={backgroundRef}
        className="bg-opacity-5 bg-primary absolute inset-0"
      />
      {/* <div className="absolute bottom-5 left-5 z-20 h-10 w-10 border-b-2 border-l-2 border-black" /> */}

      <div className="font-orbitron absolute top-6 left-6 text-sm font-bold text-black opacity-80">
        {"// DEVHOST"}
      </div>
      <div className="font-orbitron absolute top-6 right-6 text-sm font-bold text-black opacity-80">
        2025
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-12">
        <div
          ref={contentRef}
          className="relative flex min-h-[600px] flex-col justify-center p-8 md:p-16"
        >
          <div className="mb-12 text-center">
            <h1
              ref={titleRef}
              className="font-orbitron mb-2 text-4xl font-bold tracking-wider text-black uppercase md:text-7xl"
            >
              {devhostData.title}
            </h1>

            <h2
              ref={captionRef}
              className="font-orbitron text-lg tracking-wider text-black/80 md:text-2xl"
            >
              &gt; {devhostData.caption}
            </h2>
          </div>

          <p
            ref={aboutRef}
            className="mx-auto mb-12 max-w-5xl text-justify leading-relaxed font-medium text-black/90 md:text-lg"
          >
            {devhostData.about}
          </p>

          <div
            ref={buttonsRef}
            className="font-orbitron flex flex-wrap justify-center gap-4"
          >
            <a href="/brochure/Event Rulebook - Devhost.pdf" download>
              <button
                className="flex cursor-pointer items-center gap-3 border-2 border-black bg-black px-6 py-3 font-bold tracking-wider uppercase"
                style={{
                  clipPath:
                    "polygon(15px 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0% 100%, 0% 15px)",
                }}
              >
                <Download size={20} />
                <span className="font-default text-xs">Event Rulebook</span>
              </button>
            </a>

            <a href="/brochure/devhost_2025.pdf" download>
              <button
                className="flex cursor-pointer items-center gap-3 border-2 border-black bg-black px-6 py-3 font-bold tracking-wider uppercase"
                style={{
                  clipPath:
                    "polygon(15px 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0% 100%, 0% 15px)",
                }}
              >
                <Download size={20} />
                <span className="font-default text-xs">DevHost Brochure</span>
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
