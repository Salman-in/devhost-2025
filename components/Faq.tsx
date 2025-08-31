"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import DecryptText from "./animated/TextAnimation";

gsap.registerPlugin(ScrollTrigger);

const faqData = [
  {
    question: "Who is eligible to participate in the hackathon?",
    answer:
      "All students from colleges and universities are eligible to participate. Both undergraduate and graduate students can join the hackathon.",
  },
  {
    question: "Do all team members need to register and pay individually?",
    answer:
      "Yes, each team member needs to register individually and pay the registration fee separately to secure their spot in the hackathon.",
  },
  {
    question: "Can I participate as an individual or do I need a team?",
    answer:
      "You can participate both as an individual or as part of a team. Teams can have 2-4 members maximum.",
  },
  {
    question: "Can students from different colleges be in the same team?",
    answer:
      "Students from different colleges and universities can form teams together. Cross-college collaboration is encouraged.",
  },
  {
    question: "Will there be mentors or workshops during the hackathon?",
    answer:
      "Yes, we will have experienced mentors available throughout the event and conduct workshops on various technologies and development practices.",
  },
  {
    question: "What resources will be provided during the hackathon?",
    answer:
      "We provide WiFi, power outlets, meals, snacks, development tools access, API keys, and technical support throughout the event.",
  },
  {
    question: "How can I stay informed about event updates and announcements?",
    answer:
      "Follow our social media channels, join our Discord server, and check your registered email regularly for all updates and announcements.",
  },
];

const CyberpunkBorder = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative">
      <svg
        className="absolute inset-0 z-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon
          points="0,0 95,0 100,5 100,100 5,100 0,95"
          className="stroke-[var(--border-color, #a3ff1240)] group-hover:stroke-[var(--hover-border-color, #a3ff12)] fill-none stroke-2 transition-all duration-300"
        />
      </svg>
      {children}
    </div>
  );
};

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (itemsRef.current) {
        const items = itemsRef.current.querySelectorAll("[data-faq-item]");
        gsap.fromTo(
          items,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: itemsRef.current,
              start: "top 20%",
              end: "bottom 30%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden bg-black py-12 text-white md:px-8"
    >
      {/* Enhanced cyberpunk grid background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(#a3ff1208_1px,transparent_1px),linear-gradient(90deg,#a3ff1208_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>

      {/* Diagonal scanning lines */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-0 h-full w-full animate-pulse bg-[linear-gradient(45deg,transparent_48%,#a3ff1205_49%,#a3ff1205_51%,transparent_52%)] bg-[size:20px_20px]"></div>
      </div>

      <div className="absolute bottom-0 h-48 w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent" />
      <div className="absolute top-0 h-48 w-full bg-gradient-to-b from-black/95 via-black/80 to-transparent" />

      <div className="relative mx-auto max-w-4xl">
        {/* Cyberpunk Title with enhanced styling */}
        <div className="relative mb-16 text-center">
          <h2 className="font-orbitron relative mb-6 inline-block text-5xl font-bold md:text-7xl">
            FAQ
          </h2>
          <DecryptText
            text="> Answers to Common Questions"
            startDelayMs={200}
            trailSize={6}
            flickerIntervalMs={50}
            revealDelayMs={100}
            className="font-orbitron text-primary h-8 text-base tracking-wider md:text-xl"
          />
        </div>

        {/* Enhanced FAQ Accordion with cyberpunk styling */}
        <div ref={itemsRef}>
          <Accordion type="single" collapsible className="space-y-4">
            {faqData.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                data-faq-item
                className="group relative border-0 bg-transparent"
              >
                <CyberpunkBorder>
                  <div className="relative bg-black/95 backdrop-blur-sm transition-all duration-300 group-hover:shadow-[0_0_20px_#a3ff1230]">
                    {/* Side accent bar */}
                    <div className="bg-primary absolute top-0 left-0 h-full w-1 origin-top scale-y-0 transform shadow-[0_0_10px_#a3ff12] transition-transform duration-300 group-hover:scale-y-100"></div>

                    {/* Content */}
                    <AccordionTrigger className="relative px-8 py-6 text-left text-base font-medium text-white transition-all duration-300 group-hover:pl-12 group-hover:text-[#a3ff12] md:text-lg">
                      <span className="relative z-10 font-mono">
                        {faq.question}
                      </span>
                    </AccordionTrigger>

                    <AccordionContent className="relative px-8 pb-6 text-sm leading-relaxed text-gray-300">
                      {/* More visible divider line */}
                      <div className="mb-6 h-0.5 w-full bg-gradient-to-r from-[#a3ff12] via-[#a3ff1260] to-[#a3ff12] shadow-[0_0_5px_#a3ff1240]"></div>

                      <div
                        className="border border-[#a3ff1220] bg-black/50 p-4 font-mono text-sm leading-relaxed text-gray-200"
                        style={{
                          clipPath:
                            "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                        }}
                      >
                        {faq.answer}
                      </div>
                    </AccordionContent>
                  </div>
                </CyberpunkBorder>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
