"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/lib/hooks/useUserData";
import { gsap } from "gsap";
import DecryptText from "@/components/animated/TextAnimation";

export default function HackathonPage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, profileLoading } = useUserProfile();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  
  // Refs for GSAP animations
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const joinCardRef = useRef<HTMLDivElement>(null);
  const createCardRef = useRef<HTMLDivElement>(null);

  // Check authentication and profile only once
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/signin');
      } else {
        setIsChecking(false);
      }
    }
  }, [user, authLoading, router]);    

  // Check if user already has a team
  useEffect(() => {
    if (!profileLoading && profile?.team_id) {
      router.replace("/hackathon/dashboard");
    }
  }, [profile, profileLoading, router]);

  // GSAP animations - only run once when page loads
  useEffect(() => {
    if (isChecking || authLoading || profileLoading) return;
    
    const ctx = gsap.context(() => {
      // Initial state
      gsap.set([titleRef.current, subtitleRef.current], {
        opacity: 0,
        y: 30
      });
      
      gsap.set(gridRef.current, {
        opacity: 0,
        scale: 0.8
      });
      
      // Animation timeline
      const tl = gsap.timeline();
      
      tl.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      })
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.4")
      .to(gridRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "power2.out"
      }, "-=0.4");
      
      // Grid animation
      const gridItems = gridRef.current?.children;
      if (gridItems) {
        gsap.to(gridItems, {
          opacity: 1,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out"
        });
      }

     if(joinCardRef.current&&createCardRef.current){ 
        gsap.to([joinCardRef.current,createCardRef.current],{
            boxShadow:"0 0 50px 10px rgba(163, 255, 18, 100.6)",
            duration:1.5,
            repeat:-1,
            yoyo:true,
            ease:"sine.inOut"
        });
    }
}, sectionRef);
    
    return () => ctx.revert();
  }, [isChecking, authLoading, profileLoading]);

  if (isChecking || authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a3ff12] mx-auto"></div>
          <p className="mt-4 text-[#a3ff12] font-orbitron">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <section ref={sectionRef} className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#a3ff12_1px,transparent_1px),linear-gradient(to_bottom,#a3ff12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Back button */}
      <div className="absolute top-6 sm:top-10 left-4 sm:left-10 z-10">
        <button
          onClick={() => router.push('/hackathon')}
          className="flex cursor-pointer items-center justify-center gap-2 bg-[#b4ff39] px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold tracking-wider text-black uppercase transition-all hover:brightness-90 disabled:opacity-50"
          style={{
            clipPath:
              "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
            border: "2px solid #b4ff39",
          }}
        >
          Back
        </button>
      </div>
      
      <div className="relative z-10 container mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center mb-12">
          <h1 ref={titleRef} className="font-orbitron text-5xl md:text-7xl font-bold mb-4 text-[#a3ff12] uppercase tracking-wider">
            TEAM UP
          </h1>
          <p ref={subtitleRef} className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto flex items-center justify-center">
            <span className="text-[#a3ff12] mr-2">&gt;</span>
            <DecryptText
            text="Join forces with other hackers or start your own team. The future of innovation awaits."
            startDelayMs={800}
            trailSize={6}
            flickerIntervalMs={40}
            revealDelayMs={30}
            />
          </p>
        </div>
        
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-16 opacity-0">
          {/* Join Team Card */}
          <div 
            ref={joinCardRef} 
            className="relative bg-black/50 border border-[#a3ff12]/50 p-8 backdrop-blur-sm flex flex-col h-full group transition-all duration-300 hover:scale-98 hover:border-[#a3ff12]/80"
            style={{
              clipPath:
                "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
              backgroundColor: "#101810",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "inset 0 0 30px rgba(163, 255, 18, 0.5), 0 0 25px rgba(163, 255, 18, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(163, 255, 18, 0.3), 0 0 15px rgba(163, 255, 18, 0.1)";
            }}
          >
            <div className="text-[#a3ff12] text-3xl mb-4">01</div>
            <h3 className="font-orbitron text-2xl mb-4">Join a Team</h3>
            <p className="text-gray-400 mb-6 flex-grow">
              Find an existing team that matches your skills and interests. Collaborate with like-minded developers to bring your ideas to life.
            </p>
            <Button
              className="bg-primary relative flex cursor-pointer items-center justify-center gap-2 px-6 py-3 text-xs font-bold tracking-widest text-black uppercase transition-transform duration-200 hover:scale-105"
              style={{
                clipPath: "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)",
                // Button inner glow
                boxShadow: "inset 0 0 10px rgba(163, 255, 18, 0.4)",
              }}
              asChild
            >
              <Link href="/hackathon/join">Join a Team</Link>
            </Button>
          </div>
          
          {/* Create Team Card */}
          <div 
            ref={createCardRef} 
            className="relative bg-black/50 border border-[#a3ff12]/60 p-8 backdrop-blur-sm flex flex-col h-full group transition-all duration-300 hover:scale-98 hover:border-[#a3ff12]/80"
            style={{
               clipPath: "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
              backgroundColor: "#101810",
            }}
          >
            <div className="text-[#a3ff12] text-3xl mb-4">02</div>
            <h3 className="font-orbitron text-2xl mb-4">Create a Team</h3>
            <p className="text-gray-400 mb-6 flex-grow">
              Start your own team and invite others to join your vision. Be the leader and guide your team to victory in the hackathon.
            </p>
            <Button
              className="bg-primary relative flex cursor-pointer items-center gap-2 px-5 py-2 text-xs font-bold tracking-widest text-black uppercase transition-all duration-200 hover:scale-105"
              style={{
                clipPath: "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)",
                // Button inner glow
                boxShadow: "inset 0 0 10px rgba(163, 255, 18, 0.4)",
              }}
              asChild
            >
              <Link href="/hackathon/create">Create a Team</Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Footer text */}
      <div className="absolute bottom-6 left-6 font-orbitron text-sm text-[#a3ff12] opacity-80">
        {"// DEVHOST 2025"}
      </div>
      <div className="absolute bottom-6 right-6 font-orbitron text-sm text-[#a3ff12] opacity-80">
        {"TEAM SELECTION"}
      </div>
    </section>
  );
}