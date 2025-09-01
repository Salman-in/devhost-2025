"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import DecryptText from "@/components/animated/TextAnimation";
import { ClippedCard } from "@/components/ClippedCard";

interface JoinFormData {
  leader_email: string;
}

export default function HackathonJoinTeam() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false); // SSR guard

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<JoinFormData>();

  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push("/signin");
  }, [user, loading, router]);

  const onSubmit = async (data: JoinFormData) => {
    if (!user) return;

    clearErrors();

    try {
      const idToken = await user.getIdToken(true);
      const res = await fetch("/api/v1/team/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        sessionStorage.setItem("teamJustJoined", "true");
        window.location.href = "/hackathon/dashboard?joined=true";
      } else {
        const errorData = await res.json();
        setError("root", {
          message:
            errorData.error ||
            "Team leader not found or team is already finalized. Please check the email and try again.",
        });
      }
    } catch (error) {
      console.error("Error joining team:", error);
      setError("root", {
        message: "An error occurred while joining the team.",
      });
    }
  };

  if (!mounted) return null; // prevent SSR hydration mismatch

  return (
    <div
      ref={sectionRef}
      className="font-orbitron relative min-h-screen w-full overflow-hidden bg-black text-white"
    >
      {/* grid background */}
      <div className="pointer-events-none fixed inset-0 z-0">
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
      <div className="absolute top-6 left-4 z-10 sm:top-10 sm:left-10">
        <button
          onClick={() => router.push("/hackathon")}
          className="flex cursor-pointer items-center justify-center gap-2 bg-primary px-3 py-2 text-xs font-bold tracking-wider text-black uppercase transition-all hover:brightness-90 disabled:opacity-50 sm:px-4 sm:text-sm"
          style={{
            clipPath:
              "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
            border: "2px solid #b4ff39",
          }}
        >
          Back
        </button>
      </div>

      {/* Top-right logs */}
      <div className="absolute top-6 right-4 z-10 flex max-w-xs flex-col gap-1 text-xs text-primary sm:top-10 sm:right-10 sm:max-w-sm sm:text-sm md:max-w-md md:text-base">
        <DecryptText
          text="> OPEN FORM FOR TEAM JOINING"
          startDelayMs={100}
          trailSize={4}
          flickerIntervalMs={30}
          revealDelayMs={50}
        />
        <DecryptText
          text="> ENTER TEAM LEADER EMAIL"
          startDelayMs={300}
          trailSize={4}
          flickerIntervalMs={30}
          revealDelayMs={50}
        />
        <DecryptText
          text="> VERIFY DETAILS AND SUBMIT"
          startDelayMs={500}
          trailSize={4}
          flickerIntervalMs={30}
          revealDelayMs={50}
        />
      </div>

      {/* Centered clipped card container */}
      <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6">
        <ClippedCard innerBg="bg-[#101810]">
          <div className="relative mx-auto w-full max-w-4xl p-6 sm:p-8">
            <h2 className="mb-6 text-center text-lg font-bold tracking-wider text-white uppercase sm:text-xl md:text-2xl">
              Join Your Hackathon Team
            </h2>
            <form
              className="flex w-full flex-col items-center justify-center space-y-6"
              onSubmit={handleSubmit(onSubmit)}
              ref={gridRef}
            >
              <div className="flex w-full flex-col gap-4">
                <div className="flex flex-col">
                  <Label
                    htmlFor="leader_email"
                    className="mb-2 text-sm font-bold tracking-wider text-primary uppercase sm:text-base"
                  >
                    Team Leader Email
                  </Label>
                  <DecryptText
                    text="> Enter valid email to join"
                    startDelayMs={300}
                    trailSize={5}
                    flickerIntervalMs={50}
                    revealDelayMs={100}
                    className="mb-2 text-xs text-white/70 sm:text-sm"
                  />
                  <Input
                    id="leader_email"
                    type="email"
                    {...register("leader_email", {
                      required: "Team leader email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    placeholder="Enter team leader's email"
                    className="w-full rounded-md border border-black bg-white/10 px-4 py-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-black focus:outline-none"
                    style={{ fontFamily: "sans-serif" }}
                  />
                  {errors.leader_email?.message && (
                    <p className="mt-2 text-xs tracking-wide text-red-500 sm:text-sm">
                      {errors.leader_email?.message}
                    </p>
                  )}
                </div>
              </div>

              {errors.root?.message && (
                <p className="text-sm tracking-wide text-pink-500 sm:text-base">
                  {errors.root?.message}
                </p>
              )}

              {/* Join Team Button */}
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center justify-center gap-2 bg-primary px-6 py-3 text-xs font-bold tracking-wider text-black uppercase transition-all hover:brightness-90 disabled:opacity-50 sm:text-sm h-fit"
                style={{
                  clipPath:
                    "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
                  border: "2px solid var(--color-primary)",
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Joining..." : "Join Team"}
              </button>
            </form>
          </div>
        </ClippedCard>
      </div>
    </div>
  );
}
