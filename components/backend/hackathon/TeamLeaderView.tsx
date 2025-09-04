"use client";

import { Fragment, useState } from "react";
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
    <Fragment>
      <ClippedCard className="mx-auto w-full max-w-2xl">
        <div className="flex w-full flex-col bg-[#101810] px-6 py-8">
          {/* ==== Team Info ==== */}
          <div className="border-primary/40 mb-6 border-b pb-4 text-center">
            <h2 className="font-orbitron text-primary mb-2 text-sm tracking-wide uppercase">
              Team Name:
            </h2>
            <p className="font-orbitron text-3xl tracking-tight text-white">
              {team.team_name || "Team Name"}
            </p>

            {team.finalized && (
              <span className="font-orbitron mt-2 block text-sm text-green-400">
                Finalized
              </span>
            )}
          </div>

          {/* ==== Members Section ==== */}
          <div className="border-primary/40 mb-6 border-b pb-4">
            <h3 className="font-orbitron text-primary mb-3 text-lg">
              Team Members
            </h3>

            {/* Leader */}
            <div className="border-primary/40 mb-4 border">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="border-primary text-primary border px-2 py-0.5 text-xs font-bold">
                  LEADER
                </span>
                <div className="ml-3 flex w-full items-center justify-between">
                  <span className="text-foreground font-medium">
                    {team.team_leader_email}
                  </span>
                  <button
                    onClick={copyTeamLeaderEmail}
                    className="text-muted-foreground hover:text-primary rounded-md p-2 transition-colors"
                  >
                    {copied ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Members List */}
            {team.members &&
            team.members.filter((m) => m.role === "member").length > 0 ? (
              <div className="space-y-3">
                {team.members
                  .filter((m) => m.role === "member")
                  .map((member) => (
                    <div
                      key={member.email}
                      className="border-primary/30 flex items-center justify-between border px-4 py-2"
                    >
                      <span className="text-foreground font-medium">
                        {member.email}
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
                          className="border-destructive text-destructive border px-3 py-1 text-xs hover:opacity-90 disabled:opacity-50"
                          disabled={loadingStates.removing}
                        >
                          REMOVE
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-primary py-4 text-center italic">
                No members yet - share your leader email to invite members
              </div>
            )}
          </div>

          {/* ==== Actions Section ==== */}
          <div>
            <h3 className="font-orbitron text-primary mb-3 text-lg">Actions</h3>
            <div className="space-y-3">
              {team.finalized && team.drive_link ? (
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
              ) : !team.finalized ? (
                <ClippedButton
                  onClick={() => openModal(team.drive_link)}
                  innerBg="bg-background"
                  outerBg="bg-primary"
                  textColor="text-primary"
                >
                  <LinkIcon className="h-4 w-4" />
                  Add Drive Link
                </ClippedButton>
              ) : null}

              {!team.finalized && (
                <div className="flex gap-3">
                  <ClippedButton
                    innerBg="bg-red-500"
                    onClick={() => handleDeleteTeam(team.team_id)}
                    className="flex-1"
                    textColor="text-white"
                    disabled={
                      loadingStates.deleting ||
                      (team.members &&
                        team.members.filter((m) => m.role === "member").length >
                          0)
                    }
                  >
                    Delete Team
                  </ClippedButton>

                  <ClippedButton
                    innerBg="bg-primary"
                    className="flex-1 font-medium text-white hover:text-black"
                    onClick={() => handleFinalizeTeam(team.team_id)}
                    disabled={loadingStates.finalizing}
                  >
                    Finalize Team
                  </ClippedButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </ClippedCard>
      {/* ==== Drive Link Modal ==== */}
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
    </Fragment>
  );
}
