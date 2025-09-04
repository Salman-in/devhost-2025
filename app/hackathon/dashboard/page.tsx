"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useUserProfile } from "@/lib/hooks/useUserData";
import { useTeam } from "@/context/TeamContext";
import TeamLeaderView from "@/components/backend/hackathon/TeamLeaderView";
import TeamMemberView from "@/components/backend/hackathon/TeamMemberView";
import { ClippedButton } from "@/components/ClippedButton";

export default function HackathonDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, profileLoading, refreshProfile } = useUserProfile();
  const { team, loading: teamLoading, refreshTeam } = useTeam();

  // Combined loading state
  const isLoading = profileLoading || teamLoading;

  // Function to refresh both profile and team data
  const refreshAll = () => {
    refreshProfile();
    refreshTeam();
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [user, authLoading, router]);

  // Handle team status and redirects
  useEffect(() => {
    if (!isLoading) {
      // Check if we just came from team creation/joining to prevent redirect loop
      const urlParams = new URLSearchParams(window.location.search);
      const fromTeamAction =
        urlParams.get("created") === "true" ||
        urlParams.get("joined") === "true";

      // Clean up URL params if they exist
      if (fromTeamAction) {
        window.history.replaceState({}, "", "/hackathon/dashboard");
      }

      // Check if user has a team
      if (!team && !fromTeamAction) {
        console.log(
          "Dashboard: No team and not from team action, redirecting to /hackathon",
        );
        // Use a short timeout to avoid potential race conditions
        setTimeout(() => {
          router.replace("/hackathon");
        }, 100);
      }
    }
  }, [isLoading, router, team]);

  // Clean up URL params if they exist
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("created") || urlParams.get("joined")) {
      window.history.replaceState({}, "", "/hackathon/dashboard");
    }
  }, []);

  if (authLoading || isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  if (!profile || !team) {
    return <LoadingSpinner />;
  }

  const isTeamLeader = team.team_leader_email === user.email;

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-black px-4 py-24">
      <div className="font-orbitron absolute top-6 left-4 z-10 sm:top-10 sm:left-10">
        <ClippedButton>
          <Link href="/profile" className="flex items-center gap-2">
            Back
          </Link>
        </ClippedButton>
      </div>
      {/* Background grid */}
      <div className="pointer-events-none absolute fixed inset-0 opacity-10">
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

      <div className="relative z-10 mb-10 w-full max-w-3xl pt-10 text-center sm:pt-0">
        <h1 className="text-primary font-orbitron mb-3 text-center text-lg font-bold tracking-wider uppercase sm:text-2xl md:text-4xl">
          Hackathon Dashboard
        </h1>

        <p className="font-orbitron mb-2 text-xs text-white/70 sm:text-sm">
          {
            "> Manage your team, collaborate, and track your hackathon progress here."
          }
        </p>
      </div>

      <div className="w-full max-w-4xl">
        <div className="animate-fade-in-up">
          {isTeamLeader ? (
            <TeamLeaderView
              team={team}
              profile={profile}
              refreshAll={refreshAll}
            />
          ) : (
            <TeamMemberView team={team} refreshAll={refreshAll} />
          )}
        </div>
      </div>
    </div>
  );
}
