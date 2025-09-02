"use client";

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
    <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
      {/* Team Name */}
      <h2 className="mb-6 text-center text-3xl font-bold tracking-tight text-blue-900">
        {team.team_name || "Team Name"}
        {team.finalized && (
          <span className="ml-2 align-middle text-lg text-green-600">
            ✓ Finalized
          </span>
        )}
      </h2>

      {/* Members List */}
      <div className="mb-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-700">
          Team Members
        </h3>
        <div className="space-y-3">
          {/* Team Leader */}
          <div className="flex items-center justify-between rounded-lg border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-yellow-500 px-2 py-1 text-xs font-bold text-white">
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
                    className={`flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 ${isCurrentUser ? "bg-blue-50 ring-2 ring-blue-400" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      {isCurrentUser && (
                        <span className="rounded-full bg-blue-500 px-2 py-1 text-xs font-bold text-white">
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
          <button
            onClick={() => handleLeaveTeam(team.team_id)}
            className="w-full rounded-lg bg-red-500 px-4 py-3 font-medium text-white transition-colors hover:bg-red-600"
            disabled={loadingStates.leaving}
          >
            {loadingStates.leaving
              ? "Leaving..."
              : successStates.left
                ? "Left!"
                : "Leave Team"}
          </button>
        </div>
      )}

      {/* Team Info */}
      <div className="mt-6 text-center text-xs text-gray-500">
        Team ID: {team.team_id}
      </div>
    </div>
  );
}
