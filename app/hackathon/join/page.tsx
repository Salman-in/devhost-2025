"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTeam } from "@/context/TeamContext";
import { ClippedCard } from "@/components/ClippedCard";
import { toast } from "sonner";
import { ClippedButton } from "@/components/ClippedButton";

interface JoinFormData {
  leader_email: string;
}

export default function HackathonJoinTeam() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { setTeam } = useTeam();
  const [mounted, setMounted] = useState(false); // SSR guard

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    clearErrors,
  } = useForm<JoinFormData>();

  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push("/");
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
        const teamData = await res.json();
        setTeam(teamData);
        console.log("Team joined successfully, updating team context");

        setTimeout(() => {
          window.location.href = "/hackathon/dashboard?joined=true";
        }, 300);
      } else {
        const errorData = await res.json();
        toast.error(
          errorData.error ||
            "Team leader not found or team is already finalized. Please check the email and try again.",
        );
      }
    } catch {
      toast.error("An error occurred while joining the team.");
    }
  };

  if (!mounted) return null; // prevent SSR hydration mismatch

  return (
    <div
      ref={sectionRef}
      className="font-orbitron relative min-h-screen w-full overflow-hidden bg-black text-white"
    >
      {/* Background grid */}
      <div className="pointer-events-none fixed inset-0 opacity-10">
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

      {/* Back button */}
      <div className="absolute top-6 left-4 z-10 sm:top-10 sm:left-10">
        <ClippedButton
          onClick={() => router.push("/hackathon")}
          innerBg="bg-primary"
          textColor="text-black"
        >
          Back
        </ClippedButton>
      </div>

      {/* Top-right logs */}
      {/* <div className="text-primary absolute top-6 right-4 z-10 flex max-w-xs flex-col gap-1 text-xs sm:top-10 sm:right-10 sm:max-w-sm sm:text-sm md:max-w-md md:text-base">
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
      </div> */}

      {/* Centered clipped card container */}
      <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6">
        <ClippedCard innerBg="bg-[#101810]" className="max-w-xl">
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
                    className="text-primary mb-2 text-sm font-bold tracking-wider uppercase sm:text-base"
                  >
                    Team Leader Email
                  </Label>
                  <p className="mb-2 text-xs text-white/70 sm:text-sm">
                    {"> Enter valid email to join"}
                  </p>
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
                    className="w-full rounded-md border border-black bg-white/10 px-4 py-3 text-sm text-white transition-all placeholder:text-white/50 focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Join Team Button */}
              <ClippedButton
                type="submit"
                onClick={undefined}
                disabled={isSubmitting}
                innerBg="bg-primary"
                textColor="text-black"
              >
                {isSubmitting ? "Joining..." : "Join Team"}
              </ClippedButton>
            </form>
          </div>
        </ClippedCard>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 h-12 w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent" />

      <div className="text-primary absolute bottom-6 left-6 text-sm opacity-80">
        {"// DEVHOST 2025"}
      </div>
      <div className="text-primary absolute right-6 bottom-6 text-sm opacity-80">
        {"TEAM SELECTION"}
      </div>
    </div>
  );
}
