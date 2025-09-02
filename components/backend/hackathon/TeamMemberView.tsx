"use client";

import { ClippedButton } from "@/components/ClippedButton";
import { ClippedCard } from "@/components/ClippedCard";
import { useAuth } from "@/context/AuthContext";
import { useTeamActions } from "@/lib/hooks/useTeamActions";

interface Team {
  team_id: string;
  team_name: string;
  team_leader: string;
  team_leader_email: string;
  members: Array<{ name: string; email: string; role: string }>;
  drive_link?: string;
  finalized: boolean;
  createdAt: string | Date;
}

interface TeamMemberViewProps {
  team: Team;
  refreshAll: () => void;
}

export default function TeamMemberView({
  team,
  refreshAll,
}: TeamMemberViewProps) {
  const { user } = useAuth();

  const { loadingStates, successStates, handleLeaveTeam } =
    useTeamActions(refreshAll);

  return (
    <ClippedCard className="border-primary/40 mx-auto w-full max-w-2xl border">
      <div className="w-full rounded-lg bg-[#101810] px-8 py-10">
        {/* Team Name */}
        <h2 className="font-orbitron bg-primary mb-6 rounded-lg text-center text-3xl tracking-tight text-black shadow-lg">
          {team.team_name || "Team Name"}
          {team.finalized && (
            <span className="ml-2 align-middle text-lg text-green-600">
              ✓ Finalized
            </span>
          )}
        </h2>

        {/* Members List */}
        <div className="mb-6">
          <h3 className="font-orbitron text-primary mb-4 text-lg">
            Team Members
          </h3>
          <div className="space-y-3">
            {/* Team Leader */}
            <div className="flex-col items-center justify-between rounded-lg border border-lime-400 bg-gradient-to-r from-lime-50 to-green-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-lime-700 px-2 py-1 text-xs font-bold text-white">
                  LEADER
                </span>
                <span className="font-medium text-gray-800">
                  {team.team_leader}
                </span>
              </div>
            </div>

            {/* Team Members */}
            {team.members &&
            team.members.filter((m) => m.role === "member").length > 0 ? (
              team.members
                .filter((m) => m.role === "member")
                .map((member) => {
                  const isCurrentUser = member?.email === user?.email;
                  return (
                    <div
                      key={member.email}
                      className={`flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 ${isCurrentUser ? "ring-primary bg-blue-50 ring-2" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        {isCurrentUser && (
                          <span className="bg-primary rounded-full px-2 py-1 text-xs font-bold text-white">
                            YOU
                          </span>
                        )}
                        <span className="font-medium text-gray-800">
                          {member.name}
                        </span>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="rounded-lg bg-gray-50 py-4 text-center text-gray-400 italic">
                No other members yet
              </div>
            )}
          </div>
        </div>

        {/* Drive Link */}
        {team.drive_link && (
          <div className="mb-6">
            <a
              href={team.drive_link}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-lg bg-blue-500 px-4 py-3 text-center font-medium text-white transition-colors hover:bg-blue-600"
            >
              Open Team Drive Link
            </a>
          </div>
        )}

        {/* Leave Team Button - Only show if not finalized */}
        {!team.finalized && (
          <div className="mt-6">
            <ClippedButton
              innerBg="bg-destructive hover:bg-red-500"
              onClick={() => handleLeaveTeam(team.team_id)}
              className="bg-destructive w-full rounded-lg px-4 py-3 font-medium text-white transition-colors hover:bg-red-500 hover:text-black"
              disabled={loadingStates.leaving}
            >
              {loadingStates.leaving
                ? "Leaving..."
                : successStates.left
                  ? "Left!"
                  : "Leave Team"}
            </ClippedButton>
          </div>
        )}

        {/* Team Info */}
        {/* <div className="mt-6 text-center text-xs text-gray-500">
        Team ID: {team.team_id}
      </div> */}
      </div>
    </ClippedCard>
  );
}
