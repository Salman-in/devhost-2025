"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import DecryptText from "@/components/animated/TextAnimation";
import { ClippedCard } from "@/components/ClippedCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useTeam } from "@/context/TeamContext";

export default function HackathonPage() {
  const { user, loading: authLoading } = useAuth();
  const { hasTeam, loading: teamLoading } = useTeam();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  
  // Authentication check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [user, authLoading, router]);

  // Team status check
  useEffect(() => {
    if (!authLoading && user) {
      if (hasTeam) {
        // If user has a team, redirect to dashboard
        console.log('Hackathon page: User has team, redirecting to dashboard');
        router.replace("/hackathon/dashboard");
      } else if (!teamLoading) {
        // Only finish checking when team status is confirmed
        setIsChecking(false);
      }
    }
  }, [user, authLoading, router, hasTeam, teamLoading]);

  if (isChecking || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="font-orbitron text-primary mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#a3ff12_1px,transparent_1px),linear-gradient(to_bottom,#a3ff12_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:4rem_4rem]"></div>
      </div>

      <div className="relative z-10 container mx-auto flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <div className="mb-8 text-center">
          <h1 className="font-orbitron text-primary mb-4 text-5xl font-bold tracking-wider uppercase md:text-7xl">
            TEAM UP
          </h1>
          <div className="font-orbitron mx-auto flex h-18 max-w-2xl items-center justify-center text-gray-300 md:text-lg">
            <DecryptText
              text="&gt; Join forces with other hackers or start your own team. The future of innovation awaits."
              startDelayMs={800}
              trailSize={6}
              flickerIntervalMs={40}
              revealDelayMs={30}
            />
          </div>
        </div>

        {/* Options grid with integrated buttons */}
        <div className="mb-16 grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          {/* Join Team Card */}
          <ClippedCard innerBg="bg-[#101810]">
            <div className="flex h-full flex-col border p-8">
              <div className="text-primary font-amiga mb-4 text-3xl">01</div>
              <h3 className="font-orbitron mb-4 text-2xl text-white">
                Join a Team
              </h3>
              <p className="mb-6 flex-grow text-sm text-gray-400">
                Find an existing team that matches your skills and interests.
                Collaborate with like-minded developers to bring your ideas to
                life.
              </p>
              <Button
                className="bg-primary relative flex cursor-pointer items-center gap-2 rounded-none px-5 py-2 text-xs font-bold tracking-widest text-black uppercase"
                style={{
                  clipPath:
                    "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)",
                }}
                asChild
              >
                <Link href="/hackathon/join">Join a Team</Link>
              </Button>
            </div>
          </ClippedCard>

          {/* Create Team Card */}
          <ClippedCard innerBg="bg-[#101810]">
            <div className="flex h-full flex-col border p-8">
              <div className="text-primary font-amiga mb-4 text-3xl">02</div>
              <h3 className="font-orbitron mb-4 text-2xl text-white">
                Create a Team
              </h3>
              <p className="mb-6 flex-grow text-sm text-gray-400">
                Start your own team and invite others to join your vision. Be
                the leader and guide your team to victory in the hackathon.
              </p>
              <Button
                className="bg-primary relative flex cursor-pointer items-center gap-2 rounded-none px-5 py-2 text-xs font-bold tracking-widest text-black uppercase"
                style={{
                  clipPath:
                    "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)",
                }}
                asChild
              >
                <Link href="/hackathon/create">Create a Team</Link>
              </Button>
            </div>
          </ClippedCard>
        </div>
      </div>

      {/* Footer text */}
      <div className="font-orbitron text-primary absolute bottom-6 left-6 text-sm opacity-80">
        {"// DEVHOST 2025"}
      </div>
      <div className="font-orbitron text-primary absolute right-6 bottom-6 text-sm opacity-80">
        {"TEAM SELECTION"}
      </div>
    </section>
  );
}
