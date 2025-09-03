"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import DecryptText from "@/components/animated/TextAnimation";
import { ClippedCard } from "@/components/ClippedCard";
import { useTeam } from "@/context/TeamContext";
import { ClippedButton } from "@/components/ClippedButton";

export default function HackathonPage() {
  const { user, loading: authLoading } = useAuth();
  const { hasTeam, loading: teamLoading } = useTeam();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authLoading && user) {
      if (hasTeam) {
        router.replace("/hackathon/dashboard");
      } else if (!teamLoading) {
        setIsChecking(false);
      }
    }
  }, [user, authLoading, router, hasTeam, teamLoading]);

  if (isChecking || authLoading) {
    return (
      <div className="font-orbitron flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-primary mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="font-orbitron relative min-h-screen overflow-hidden bg-black text-white">
      {/* Back button */}
      <div className="absolute top-6 left-4 z-50 sm:top-10 sm:left-10">
        <ClippedButton
          type="button"
          onClick={() => router.push("/profile")}
          innerBg="bg-primary"
          textColor="text-black"
        >
          Back
        </ClippedButton>
      </div>

      {/* Animated grid background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, #a3ff12 1px, transparent 1px),
              linear-gradient(to bottom, #a3ff12 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            opacity: 0.13,
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <div className="mb-8 text-center">
          <h1 className="text-primary mb-4 text-5xl font-bold tracking-wider uppercase md:text-7xl">
            TEAM UP
          </h1>
          <div className="mx-auto flex h-18 max-w-2xl items-center justify-center text-gray-300 md:text-lg">
            <DecryptText
              text="&gt; Join forces with other hackers or start your own team. The future of innovation awaits."
              startDelayMs={800}
              trailSize={6}
              flickerIntervalMs={40}
              revealDelayMs={30}
            />
          </div>
        </div>

        {/* Options grid */}
        <div className="mb-16 grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          {/* Join Team Card */}
          <ClippedCard innerBg="bg-[#101810]">
            <div className="flex h-full flex-col border p-8">
              <div className="text-primary font-amiga mb-4 text-3xl">01</div>
              <h3 className="mb-4 text-2xl text-white">Join a Team</h3>
              <p className="mb-6 flex-grow text-sm text-gray-400">
                Find an existing team that matches your skills and interests.
                Collaborate with like-minded developers to bring your ideas to
                life.
              </p>
              <ClippedButton
                innerBg="bg-primary"
                textColor="text-black"
                asChild
              >
                <Link
                  href="/hackathon/join"
                  className="font-orbitron inline-flex min-h-[48px] w-full items-center justify-center py-3"
                >
                  Join a Team
                </Link>
              </ClippedButton>
            </div>
          </ClippedCard>

          {/* Create Team Card */}
          <ClippedCard innerBg="bg-[#101810]">
            <div className="flex h-full flex-col border p-8">
              <div className="text-primary font-amiga mb-4 text-3xl">02</div>
              <h3 className="mb-4 text-2xl text-white">Create a Team</h3>
              <p className="mb-6 flex-grow text-sm text-gray-400">
                Start your own team and invite others to join your vision. Be
                the leader and guide your team to victory in the hackathon.
              </p>
              <ClippedButton
                innerBg="bg-primary"
                textColor="text-black"
                asChild
              >
                <Link
                  href="/hackathon/create"
                  className="font-orbitron inline-flex min-h-[48px] w-full items-center justify-center py-3"
                >
                  Create a Team
                </Link>
              </ClippedButton>
            </div>
          </ClippedCard>
        </div>
      </div>

      {/* Footer text */}
      <div className="text-primary absolute bottom-6 left-6 text-sm opacity-80">
        {"// DEVHOST 2025"}
      </div>
      <div className="text-primary absolute right-6 bottom-6 text-sm opacity-80">
        {"TEAM SELECTION"}
      </div>
    </section>
  );
}
