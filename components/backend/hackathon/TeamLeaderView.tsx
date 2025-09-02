"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import DriveLinkModal from "./DriveLinkModal";
import { useDriveLink } from "@/lib/hooks/useDriveLink";
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

interface Profile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  college?: string;
  reg_no?: string;
  year?: string;
  course?: string;
}

interface TeamLeaderViewProps {
  team: Team;
  profile: Profile;
  refreshAll: () => void;
}

export default function TeamLeaderView({
  team,
  profile,
  refreshAll,
}: TeamLeaderViewProps) {
  const [copied, setCopied] = useState(false);

  const {
    driveLinkState,
    validateDriveLink,
    handleDriveLinkChange,
    openModal,
    closeModal,
    updateLink,
  } = useDriveLink(refreshAll);

  const {
    loadingStates,
    successStates,
    finalizeError,
    handleRemovePeer,
    handleDeleteTeam,
    handleFinalizeTeam,
  } = useTeamActions(refreshAll);

  const copyTeamLeaderEmail = () => {
    const leaderEmail = profile?.email || "";
    navigator.clipboard.writeText(leaderEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDriveLinkSubmit = async (link: string) => {
    await handleDriveLinkChange(link, team.team_id);
  };

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
      {/* Team Name with Copy Email Button */}
      <div className="mb-6 text-center">
        <h2 className="mb-3 text-3xl font-bold tracking-tight text-blue-900">
          {team.team_name || "Team Name"}
          {team.finalized && (
            <span className="ml-2 align-middle text-lg text-green-600">
              ✓ Finalized
            </span>
          )}
        </h2>
        {!team.finalized && (
          <div className="flex items-center justify-center space-x-2 text-black">
            <div className="text-neutral-600">Email: {profile?.email}</div>
            <button
              onClick={copyTeamLeaderEmail}
              className={`rounded-sm px-2 py-2 text-sm font-medium`}
            >
              {copied ? (
                <div>
                  <CheckIcon className="h-4 w-4" />
                </div>
              ) : (
                <div>
                  <CopyIcon className="h-4 w-4" />
                </div>
              )}
            </button>
          </div>
        )}
      </div>

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
              .map((member) => (
                <div
                  key={member.email}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                >
                  <span className="font-medium text-gray-800">
                    {member.name}
                  </span>
                  {!team.finalized && (
                    <button
                      onClick={() =>
                        handleRemovePeer(
                          team.team_id,
                          member.email,
                          member.name,
                        )
                      }
                      className="rounded-md bg-red-500 px-3 py-1 text-sm text-white transition-colors hover:bg-red-600"
                      disabled={loadingStates.removing}
                    >
                      {loadingStates.removing ? "Removing..." : "Remove"}
                    </button>
                  )}
                </div>
              ))
          ) : (
            <div className="rounded-lg bg-gray-50 py-4 text-center text-gray-400 italic">
              No members yet - share your leader email to invite members
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3">
        {team.finalized && team.drive_link ? (
          /* Show drive link if finalized and link exists */
          <a
            href={team.drive_link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-lg bg-blue-500 px-4 py-3 text-center font-medium text-white transition-colors hover:bg-blue-600"
          >
            Open Drive Link
          </a>
        ) : !team.finalized ? (
          /* Show add drive link button if not finalized */
          <button
            onClick={() => openModal(team.drive_link)}
            className="w-full rounded-lg bg-purple-500 px-4 py-3 font-medium text-white transition-colors hover:bg-purple-600"
          >
            Add Drive Link
          </button>
        ) : null}

        {!team.finalized && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteTeam(team.team_id)}
                className="flex-1 rounded-lg bg-red-500 px-4 py-3 font-medium text-white transition-colors hover:bg-red-600"
                disabled={
                  loadingStates.deleting ||
                  (team.members &&
                    team.members.filter((m) => m.role === "member").length > 0)
                }
              >
                {loadingStates.deleting
                  ? "Deleting..."
                  : successStates.deleted
                    ? "Deleted!"
                    : "Delete Team"}
              </button>
              <button
                className="flex-1 rounded-lg bg-green-500 px-4 py-3 font-medium text-white transition-colors hover:bg-green-600"
                onClick={() => handleFinalizeTeam(team.team_id)}
                disabled={loadingStates.finalizing}
              >
                {loadingStates.finalizing
                  ? "Finalizing..."
                  : successStates.finalized
                    ? "Finalized!"
                    : "Finalize Team"}
              </button>
            </div>
            {finalizeError && (
              <div className="mt-1 text-center text-sm text-red-500">
                {finalizeError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drive Link Modal - Only show if not finalized */}
      {!team.finalized && (
        <DriveLinkModal
          isOpen={driveLinkState.showModal}
          onClose={closeModal}
          onSubmit={handleDriveLinkSubmit}
          onValidate={validateDriveLink}
          link={driveLinkState.link}
          onLinkChange={updateLink}
          isValidating={driveLinkState.isValidating}
          isUpdating={driveLinkState.isUpdating}
          updated={driveLinkState.updated}
          isDirty={driveLinkState.isDirty}
          error={driveLinkState.error}
          validationResult={driveLinkState.validationResult}
        />
      )}
    </div>
  );
}
