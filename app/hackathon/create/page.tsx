"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import DecryptText from "@/components/animated/TextAnimation";
import { ClippedCard } from "@/components/ClippedCard";

interface TeamFormData {
  team_name: string;
}

export default function HackathonCreateTeam() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false); // SSR guard

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm<TeamFormData>();

  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const verifyRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLFormElement>(null);
  const joinCardRef = useRef<HTMLDivElement>(null);
  const joinButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  const onSubmit = async (data: TeamFormData) => {
    if (!user) return;

    clearErrors();

    try {
      const idToken = await user.getIdToken(true);
      const res = await fetch('/api/v1/team/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        sessionStorage.setItem('teamJustCreated', 'true');
        window.location.href = '/hackathon/dashboard?created=true';
      } else {
        const errorData = await res.json();
        setError('root', { message: errorData.error || 'Failed to create team' });
      }
    } catch (error) {
      console.error('Error creating team:', error);
      setError('root', { message: 'An error occurred while creating the team' });
    }
  };

  if (!mounted) return null;

  return (
    <div ref={sectionRef} className="relative min-h-screen w-full bg-black font-orbitron text-white overflow-hidden">
      {/* Grid background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, #a3ff12 1px, transparent 1px),
              linear-gradient(to bottom, #a3ff12 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            opacity: 0.1,
          }}
        />
      </div>

      {/* Back button */}
      <div className="absolute top-6 sm:top-10 left-4 sm:left-10 z-10">
        <button
          onClick={() => router.push('/hackathon')}
          className="flex cursor-pointer items-center justify-center gap-2 bg-[#b4ff39] px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold tracking-wider text-black uppercase transition-all hover:brightness-90 disabled:opacity-50"
          style={{
            clipPath:
              "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
            border: "2px solid var(--color-primary)",
          }}
        >
          Back
        </button>
      </div>

      {/* Top-right logs */}
      <div className="absolute top-6 sm:top-10 right-4 sm:right-10 flex flex-col gap-1 text-xs sm:text-sm md:text-base text-primary z-10 max-w-xs sm:max-w-sm md:max-w-md">
        <div ref={titleRef}>
          <DecryptText text="> OPEN FORM FOR TEAM CREATION" startDelayMs={100} trailSize={4} flickerIntervalMs={30} revealDelayMs={50} />
        </div>
        <div ref={subtitleRef}>
          <DecryptText text="> ENTER TEAM NAME" startDelayMs={300} trailSize={4} flickerIntervalMs={30} revealDelayMs={50} />
        </div>
        <div ref={verifyRef}>
          <DecryptText text="> VERIFY DETAILS AND SUBMIT" startDelayMs={500} trailSize={4} flickerIntervalMs={30} revealDelayMs={50} />
        </div>
      </div>

      {/* Centered card */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6">
        <ClippedCard innerBg="bg-[#101810]">
          <div
            ref={joinCardRef}
            className="relative mx-auto w-full max-w-4xl p-6 sm:p-8"
          >
            <form className="flex flex-col justify-center items-center space-y-6 w-full" onSubmit={handleSubmit(onSubmit)} ref={gridRef}>
              <div className="w-full flex flex-col gap-4">
                <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold uppercase mb-6 tracking-wider text-center">
                  Create Your Hackathon Team
                </h2>
                <div className="flex flex-col">
                  <Label htmlFor="team_name" className="mb-2 text-sm sm:text-base font-bold tracking-wider text-primary uppercase">
                    Team Name
                  </Label>
                  <DecryptText
                    text="> Enter valid team name"
                    startDelayMs={300}
                    trailSize={5}
                    flickerIntervalMs={50}
                    revealDelayMs={100}
                    className="mb-2 text-xs sm:text-sm text-white/70"
                  />
                  <Input
                    id="team_name"
                    type="text"
                    {...register("team_name", { 
                      required: "Team name is required",
                      minLength: { value: 2, message: "Team name must be at least 2 characters" }
                    })}
                    placeholder="Enter a team name"
                    className="w-full text-white placeholder:text-white/50 bg-white/10 border border-black rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    style={{ fontFamily: "sans-serif" }}
                  />
                  {errors.team_name && (
                    <p className="text-red-500 text-xs sm:text-sm mt-2 tracking-wide">{errors.team_name.message}</p>
                  )}
                </div>
              </div>

              {errors.root && <p className="text-pink-500 text-sm sm:text-base tracking-wide">{errors.root.message}</p>}

              <button
                ref={joinButtonRef}
                type="submit"
                className="w-full h-fit flex cursor-pointer items-center justify-center gap-2 bg-primary px-6 py-3 text-xs sm:text-sm font-bold tracking-wider text-black uppercase transition-all hover:brightness-90 disabled:opacity-50"
                style={{
                  clipPath:
                    "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
                  border: "2px solid var(--color-primary)",
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Team"}
              </button>
            </form>
          </div>
        </ClippedCard>
      </div>
    </div>
  );
}
