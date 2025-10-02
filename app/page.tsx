"use client";
import { Suspense, useEffect, useState } from "react";
import Hero from "@/components/Hero";
import AboutDevhost from "@/components/AboutDevhost";
import Counter from "@/components/Counter";
import TimelineSection from "@/components/Timeline";
import AboutHackathon from "@/components/AboutHackathon";
import Footer from "@/components/Footer";
import FAQ from "@/components/Faq";
import Map from "@/components/Map";
import Events from "@/components/Events";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import SponsorsLogo from "@/components/Sponsors";

export default function Home() {
  const [ready, setReady] = useState(false);

  const { loginLoading } = useAuth();

  useEffect(() => {
    const handleLoaded = () => setReady(true);

    if (document.readyState === "complete") {
      setReady(true);
    } else {
      window.addEventListener("load", handleLoaded);
      return () => window.removeEventListener("load", handleLoaded);
    }
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {loginLoading && (
        <div className="fixed z-50 flex h-screen w-screen items-center justify-center bg-black">
          <div className="text-center">
            <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
            <p className="font-orbitron text-primary mt-4 uppercase">
              Logging in...
            </p>
          </div>
        </div>
      )}
      <Suspense fallback={<LoadingSpinner />}>
        <Hero />
        <Counter />
        <SponsorsLogo />
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
