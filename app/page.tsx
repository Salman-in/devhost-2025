"use client";
import { Suspense } from "react";
import Hero from "@/components/Hero";
import AboutDevhost from "@/components/AboutDevhost";
import Counter from "@/components/Counter";
import TimelineSection from "@/components/Timeline";
import AboutHackathon from "@/components/AboutHackathon";
import Footer from "@/components/Footer";
import FAQ from "@/components/Faq";
import Map from "@/components/Map";
import Events from "@/components/Events";
import CallToAction from "@/components/CallToAction";

export default function Home() {
  return (
    <div className="relative">
      <Suspense fallback={<Skeleton />}>
        <Hero />
        <Counter />
        <AboutDevhost />
        <div className="relative h-[30vh]">
          <div className="absolute top-0 h-24 w-full bg-gradient-to-b from-black/95 via-black/80 to-transparent" />
        </div>
        <AboutHackathon />
        <TimelineSection />
        <Events />
        <FAQ />
        <Map />
        <Footer />
      </Suspense>

      {/* Background grid */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-10">
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
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="bg-primary/30 h-8 w-1/3 rounded"></div>
      <div className="bg-primary/20 h-4 w-2/3 rounded"></div>
      <div className="bg-primary/20 h-4 w-1/2 rounded"></div>
      <div className="bg-primary/10 h-64 rounded"></div>
    </div>
  );
}
