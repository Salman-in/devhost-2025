'use client';

import { useState } from 'react';
import { CheckIcon, CopyIcon } from "lucide-react";
import DriveLinkModal from './DriveLinkModal';
import { useDriveLink } from '@/lib/hooks/useDriveLink';
import { useTeamActions } from '@/lib/hooks/useTeamActions';

interface Team {
    team_id: string;
    team_name: string;
    team_leader: string;
    peers: Array<{ id: string; name: string; email: string }>;
    drive_link?: string;
    finalized: boolean;
    created_at: string | Date;
}

interface Profile {
    uid: string;
    name: string;
    email: string;
    team_id?: string;
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

export default function TeamLeaderView({ team, profile, refreshAll }: TeamLeaderViewProps) {
    const [copied, setCopied] = useState(false);
    
    const {
        driveLinkState,
        validateDriveLink,
        handleDriveLinkChange,
        openModal,
        closeModal,
        updateLink
    } = useDriveLink(refreshAll);

    const {
        loadingStates,
        successStates,
        finalizeError,
        handleRemovePeer,
        handleDeleteTeam,
        handleFinalizeTeam
    } = useTeamActions(refreshAll);

    const copyTeamLeaderEmail = () => {
        const leaderEmail = profile?.email || '';
        navigator.clipboard.writeText(leaderEmail);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleDriveLinkSubmit = async (link: string) => {
        await handleDriveLinkChange(link, team.team_id);
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            {/* Team Name with Copy Email Button */}
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-blue-900 mb-3 tracking-tight">
                    {team.team_name || 'Team Name'}
                    {team.finalized && <span className="ml-2 text-green-600 text-lg align-middle">✓ Finalized</span>}
                </h2>
                {!team.finalized && (
                    <div className="flex text-black justify-center space-x-2 items-center">
                        <div className="text-neutral-600">
                            Email: {profile?.email}
                        </div>
                        <button
                            onClick={copyTeamLeaderEmail}
                            className={`px-2 py-2 rounded-sm text-sm font-medium`}
                        >
                            {copied ? <div><CheckIcon className="h-4 w-4" /></div> : <div><CopyIcon className="h-4 w-4" /></div>}
                        </button>
                    </div>
                )}
            </div>

            {/* Members List */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Team Members</h3>
                <div className="space-y-3">
                    {/* Team Leader */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg px-4 py-3 border border-yellow-200">
                        <div className="flex items-center gap-3">
                            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">LEADER</span>
                            <span className="text-gray-800 font-medium">{team.team_leader}</span>
                        </div>
                    </div>

                    {/* Team Members */}
                    {team.peers && team.peers.length > 0 ? (
                        team.peers.map((peer) => (
                            <div key={peer.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                                <span className="text-gray-800 font-medium">{peer.name}</span>
                                {!team.finalized && (
                                    <button
                                        onClick={() => handleRemovePeer(peer.id, peer.name)}
                                        className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition-colors"
                                        disabled={loadingStates.removing}
                                    >
                                        {loadingStates.removing ? 'Removing...' : 'Remove'}
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-400 italic text-center py-4 bg-gray-50 rounded-lg">
                            No members yet - share your leader email to invite members
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 mt-6">
                {team.finalized && team.drive_link ? (
                    /* Show drive link if finalized and link exists */
                    <a
                        href={team.drive_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors text-center block font-medium"
                    >
                        Open Drive Link
                    </a>
                ) : !team.finalized ? (
                    /* Show add drive link button if not finalized */
                    <button
                        onClick={() => openModal(team.drive_link)}
                        className="w-full bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors font-medium"
                    >
                        Add Drive Link
                    </button>
                ) : null}

                {!team.finalized && (
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleDeleteTeam(team.team_id)}
                                className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
                                disabled={loadingStates.deleting || (team.peers && team.peers.length > 0)}
                            >
                                {loadingStates.deleting ? 'Deleting...' : successStates.deleted ? 'Deleted!' : 'Delete Team'}
                            </button>
                            <button
                                className="flex-1 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
                                onClick={() => handleFinalizeTeam(team.team_id)}
                                disabled={loadingStates.finalizing}
                            >
                                {loadingStates.finalizing ? 'Finalizing...' : successStates.finalized ? 'Finalized!' : 'Finalize Team'}
                            </button>
                        </div>
                        {finalizeError && (
                            <div className="text-red-500 text-sm text-center mt-1">{finalizeError}</div>
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
