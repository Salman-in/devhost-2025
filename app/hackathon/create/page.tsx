"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ClippedCard } from "@/components/ClippedCard";
import { useTeam } from "@/context/TeamContext";
import { toast } from "sonner";
import { ClippedButton } from "@/components/ClippedButton";

interface TeamFormData {
  team_name: string;
}

export default function HackathonCreateTeam() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { setTeam } = useTeam();
  const [mounted, setMounted] = useState(false); // SSR guard

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<TeamFormData>();

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
      const res = await fetch("/api/v1/team/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        // Get the created team data
        const teamData = await res.json();

        // Update the team in context
        setTeam(teamData);
        console.log("Team created successfully, updating team context");

        // Force a small delay to ensure state updates before navigation
        setTimeout(() => {
          window.location.href = "/hackathon/dashboard?created=true";
        }, 300);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to create team");
      }
    } catch {
      toast.error("An error occurred while creating the team");
    }
  };

  if (!mounted) return null;

  return (
    <div className="font-orbitron relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Grid background */}
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
        <div ref={titleRef}>
          <DecryptText
            text="> OPEN FORM FOR TEAM CREATION"
            startDelayMs={100}
            trailSize={4}
            flickerIntervalMs={30}
            revealDelayMs={50}
          />
        </div>
        <div ref={subtitleRef}>
          <DecryptText
            text="> ENTER TEAM NAME"
            startDelayMs={300}
            trailSize={4}
            flickerIntervalMs={30}
            revealDelayMs={50}
          />
        </div>
        <div ref={verifyRef}>
          <DecryptText
            text="> VERIFY DETAILS AND SUBMIT"
            startDelayMs={500}
            trailSize={4}
            flickerIntervalMs={30}
            revealDelayMs={50}
          />
        </div>
      </div> */}

      {/* Centered card */}
      <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6">
        <ClippedCard innerBg="bg-[#101810]" className="max-w-xl">
          <div className="relative mx-auto w-full max-w-4xl p-6 sm:p-8">
            <form
              className="flex w-full flex-col items-center justify-center space-y-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="flex w-full flex-col gap-4">
                <h2 className="mb-6 text-center text-lg font-bold tracking-wider text-white uppercase sm:text-xl md:text-2xl">
                  Create Your Hackathon Team
                </h2>
                <div className="flex flex-col">
                  <Label
                    htmlFor="team_name"
                    className="text-primary mb-2 text-sm font-bold tracking-wider uppercase sm:text-base"
                  >
                    Team Name
                  </Label>
                  <p className="mb-2 text-xs text-white/70 sm:text-sm">
                    {"> Enter valid team name"}
                  </p>
                  <Input
                    id="team_name"
                    type="text"
                    {...register("team_name", {
                      required: "Team name is required",
                      minLength: {
                        value: 2,
                        message: "Team name must be at least 2 characters",
                      },
                    })}
                    placeholder="Enter a team name"
                    className="w-full rounded-md border border-black bg-white/10 px-4 py-3 text-white transition-all placeholder:text-white/50 focus:ring-2 focus:ring-black focus:outline-none"
                  />
                  {errors.team_name && (
                    <p className="mt-2 text-xs tracking-wide text-red-500 sm:text-sm">
                      {errors.team_name.message}
                    </p>
                  )}
                </div>
              </div>

              {errors.root && (
                <p className="text-sm tracking-wide text-pink-500 sm:text-base">
                  {errors.root.message}
                </p>
              )}

              <ClippedButton
                type="submit"
                onClick={undefined}
                disabled={isSubmitting}
                innerBg="bg-primary"
                textColor="text-black"
              >
                {isSubmitting ? "Creating..." : "Create Team"}
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
