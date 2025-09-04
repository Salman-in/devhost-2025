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

  const { loadingStates, handleLeaveTeam } = useTeamActions(refreshAll);

  return (
    <ClippedCard className="mx-auto w-full max-w-2xl">
      <div className="flex w-full flex-col rounded-lg bg-[#101810] px-6 py-8">
        {/* ==== Team Info ==== */}
        <div className="border-primary/40 mb-6 border-b pb-4 text-center">
          <h2 className="font-orbitron text-primary mb-2 text-sm tracking-wide uppercase">
            Team Name:
          </h2>
          <p className="font-orbitron text-3xl tracking-tight text-white">
            {team.team_name || "Team Name"}
            {team.finalized && (
              <span className="font-orbitron ml-2 align-middle text-lg text-green-400">
                ✓ Finalized
              </span>
            )}
          </p>
        </div>

        {/* ==== Members Section ==== */}
        <div className="border-primary/40 mb-6 border-b pb-4">
          <h3 className="font-orbitron text-primary mb-3 text-lg">
            Team Members
          </h3>

          {/* Leader */}
          <div className="border-primary/40 mb-4 rounded-md border">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="border-primary text-primary rounded border px-2 py-0.5 text-xs font-bold">
                LEADER
              </span>
              <div className="ml-3 flex w-full items-center justify-between">
                <span className="font-medium text-white">
                  {team.team_leader}
                </span>
              </div>
            </div>
          </div>

          {/* Team Members */}
          {team.members &&
          team.members.filter((m) => m.role === "member").length > 0 ? (
            <div className="space-y-3">
              {team.members
                .filter((m) => m.role === "member")
                .map((member) => {
                  const isCurrentUser = member?.email === user?.email;
                  return (
                    <div
                      key={member.email}
                      className={`border-primary/30 flex items-center justify-between rounded-md border px-4 py-2 ${
                        isCurrentUser
                          ? "ring-primary bg-primary/20 ring-1"
                          : "bg-primary/10"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-3">
                        <span className="font-medium text-white">
                          {member.name}
                        </span>
                        {isCurrentUser && (
                          <span className="border-primary text-primary rounded border px-2 py-0.5 text-xs font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-primary bg-primary/10 rounded-lg py-4 text-center italic">
              No other members yet
            </div>
          )}
        </div>

        {/* ==== Drive Link Section ==== */}
        {team.drive_link && (
          <div>
            <ClippedButton
              outerBg="bg-primary"
              innerBg="bg-black"
              textColor="text-primary"
            >
              <a
                href={team.drive_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Team Drive Link
              </a>
            </ClippedButton>
          </div>
        )}

        {/* ==== Leave Button ==== */}
        {!team.finalized && (
          <div className="mt-2">
            <ClippedButton
              innerBg="bg-red-500"
              textColor="text-white"
              onClick={() => handleLeaveTeam(team.team_id)}
              disabled={loadingStates.leaving}
            >
              Leave Team
            </ClippedButton>
          </div>
        )}
      </div>
    </ClippedCard>
  );
}
