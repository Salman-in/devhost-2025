"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, LinkIcon } from "lucide-react";
import DriveLinkModal from "./DriveLinkModal";
import { useDriveLink } from "@/lib/hooks/useDriveLink";
import { useTeamActions } from "@/lib/hooks/useTeamActions";
import { ClippedCard } from "@/components/ClippedCard";
import { ClippedButton } from "@/components/ClippedButton";

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
    <ClippedCard className="border-primary/40 mx-auto w-full max-w-2xl border">
      <div className="flex w-full flex-col items-center justify-center rounded-lg bg-[#101810] px-6 py-10">
        {/* Team Name with Copy Email Button */}

        <div className="mb-6 w-full text-center">
          <h2 className="font-orbitron bg-primary mb-3 rounded-lg text-center text-3xl tracking-tight text-black p-2">
            {team.team_name || "Team Name"}
            {team.finalized && (
              <span className="text-primary ml-2 align-middle text-lg">
                ✓ Finalized
              </span>
            )}
          </h2>
          {!team.finalized && (
            <div className="text-primary flex items-center justify-center space-x-2">
              <div className="text-neutral-400">Email: {profile?.email}</div>
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
        <div className="mb-6 w-full">
          <h3 className="font-orbitron text-primary mb-4 text-lg">
            Team Members
          </h3>
          <div className="space-y-3">
            {/* Team Leader */}
            <div className="border-primary/40 flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="bg-primary rounded-full px-3 py-1 text-xs font-bold text-black">
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
                        className="bg-destructive h-fit rounded-md px-3 py-1 text-sm text-white transition-colors hover:bg-red-500 hover:text-black"
                        disabled={loadingStates.removing}
                      >
                        {loadingStates.removing ? "Removing..." : "Remove"}
                      </button>
                    )}
                  </div>
                ))
            ) : (
              <div className="rounded-lg bg-gray-50 py-4 text-center text-gray-400">
                No members yet - share your leader email to invite members
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex w-full flex-col gap-3">
          {team.finalized && team.drive_link ? (
            /* Show drive link if finalized and link exists */
            <a
              href={team.drive_link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary/40 hover:bg-primary/90 block w-full rounded-lg px-4 py-3 text-center font-medium text-black transition-colors"
            >
              Open Drive Link
            </a>
          ) : !team.finalized ? (
            /* Show add drive link button if not finalized */
            <ClippedButton
              onClick={() => openModal(team.drive_link)}
              className="bg-secondary px-4 py-3 font-medium text-black transition-all hover:brightness-90"
            >
              <LinkIcon className="h-4 w-4" />
              Add Drive Link
            </ClippedButton>
          ) : null}

          {!team.finalized && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <ClippedButton
                  innerBg="bg-destructive hover:bg-red-500"
                  onClick={() => handleDeleteTeam(team.team_id)}
                  className="bg-destructive flex-1 rounded-lg px-4 py-3 font-medium text-white transition-colors hover:bg-red-500 hover:text-black"
                  disabled={
                    loadingStates.deleting ||
                    (team.members &&
                      team.members.filter((m) => m.role === "member").length >
                        0)
                  }
                >
                  {loadingStates.deleting
                    ? "Deleting..."
                    : successStates.deleted
                      ? "Deleted!"
                      : "Delete Team"}
                </ClippedButton>
                <ClippedButton
                  innerBg="bg-primary hover:bg-brightness-90"
                  className="bg-primary hover:bg-brightness-90 flex-1 rounded-lg px-4 py-3 font-medium text-white transition-colors hover:text-black"
                  onClick={() => handleFinalizeTeam(team.team_id)}
                  disabled={loadingStates.finalizing}
                >
                  {loadingStates.finalizing
                    ? "Finalizing..."
                    : successStates.finalized
                      ? "Finalized!"
                      : "Finalize Team"}
                </ClippedButton>
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
    </ClippedCard>
  );
}
