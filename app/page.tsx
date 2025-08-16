"use client";

import Counter from "@/components/Counter";
import Events from "@/components/Events";
import AboutDevhost from "@/components/AboutDevhost";
import AboutHackathon from "@/components/AboutHackathon";
import Hero from "@/components/Hero";
import Map from "@/components/Map";
import Schedule from "@/components/Schedule";
import Image from "next/image";
import FAQ from "@/components/Faq";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div>
      <div className="max-w-7xl px-5 mx-auto">
        <Hero />
        <Counter />
        <Schedule />
        <AboutDevhost />
        <AboutHackathon />
        <Events />
      </div>
      <div className="relative">
        <FAQ />
      </div>
      <div className="max-w-7xl relative px-5 mx-auto">
        <Map />
      </div>
      <Footer />
    </div>
  );
}