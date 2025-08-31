'use client';

import { useAuth } from "@/context/AuthContext";
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

interface TeamMemberViewProps {
    team: Team;
    refreshAll: () => void;
}

export default function TeamMemberView({ team, refreshAll }: TeamMemberViewProps) {
    const { user } = useAuth();
    
    const {
        loadingStates,
        successStates,
        handleLeaveTeam
    } = useTeamActions(refreshAll);

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            {/* Team Name */}
            <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center tracking-tight">
                {team.team_name || 'Team Name'}
                {team.finalized && <span className="ml-2 text-green-600 text-lg align-middle">✓ Finalized</span>}
            </h2>

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
                        team.peers.map((peer) => {
                            const isCurrentUser = peer?.id === user?.uid;
                            return (
                                <div key={peer.id} className={`flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 ${isCurrentUser ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        {isCurrentUser && <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">YOU</span>}
                                        <span className="text-gray-800 font-medium">{peer.name}</span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-gray-400 italic text-center py-4 bg-gray-50 rounded-lg">
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
                        className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors text-center block font-medium"
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
                        className="w-full bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
                        disabled={loadingStates.leaving}
                    >
                        {loadingStates.leaving ? 'Leaving...' : successStates.left ? 'Left!' : 'Leave Team'}
                    </button>
                </div>
            )}

            {/* Team Info */}
            <div className="mt-6 text-xs text-gray-500 text-center">
                Team ID: {team.team_id}
            </div>
        </div>
    );
}
