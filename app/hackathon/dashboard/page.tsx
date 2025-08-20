'use client';

import {useAuth} from "@/context/AuthContext";
import {useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function HackathonDashboardPage() {
    const router = useRouter();
    const { user, loading, profile, setProfile, team, teamLoading, setTeam } = useAuth();
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [loadingStates, setLoadingStates] = useState({
        removing: false,
        deleting: false,
        leaving: false,
        finalizing: false
    });
    const [successStates, setSuccessStates] = useState({
        removed: false,
        deleted: false,
        left: false,
        finalized: false
    });
    const [leaveTimer, setLeaveTimer] = useState<NodeJS.Timeout | null>(null);
    const [copied, setCopied] = useState(false);
    const [driveLinkState, setDriveLinkState] = useState({
        showModal: false,
        link: '',
        isDirty: false,
        error: '',
        isUpdating: false,
        updated: false,
        isValidating: false,
        validationResult: null as { accessible: boolean; message: string; status: number } | null
    });
    const [form, setForm] = useState<{
        team_id: string;
        team_name: string;
        team_leader: string;
        peers: Array<{ id: string; name: string }>;
        drive_link: string;
        finalized: boolean;
    }>({
        team_id: '',
        team_name: '',
        team_leader: '',
        peers: [],
        drive_link: '',
        finalized: false,
    });

    const validateDriveLink = async (driveLink: string) => {
        setDriveLinkState(prev => ({ ...prev, isValidating: true, validationResult: null, error: '' }));

        try {
            const response = await fetch('/api/v1/team/checkdrivelink', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ driveLink }),
            });

            const result = await response.json();

            if (response.ok) {
                setDriveLinkState(prev => ({ 
                    ...prev, 
                    validationResult: result,
                    error: result.accessible ? '' : result.message
                }));
                return result;
            } else {
                setDriveLinkState(prev => ({ 
                    ...prev, 
                    error: result.error || 'Failed to validate drive link'
                }));
                return null;
            }
        } catch (error) {
            console.error('Drive link validation error:', error);
            const errorMessage = 'Failed to validate drive link. Please check your connection.';
            setDriveLinkState(prev => ({ ...prev, error: errorMessage }));
            return null;
        } finally {
            setDriveLinkState(prev => ({ ...prev, isValidating: false }));
        }
    };

    const handleDriveLinkChange = async (drive_link: string) => {
        if (!user) return;

        setDriveLinkState(prev => ({ ...prev, isUpdating: true, error: '' }));

        try {
            const idToken = await user.getIdToken(true);
            const res = await fetch('/api/v1/team/drive', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({ drive_link, team_id: form.team_id }),
            });

            if (res.ok) {
                setDriveLinkState(prev => ({ 
                    ...prev, 
                    updated: true, 
                    showModal: false,
                    isDirty: false
                }));
                setForm(prev => ({ ...prev, drive_link }));
                // Reset success state after showing success
                setTimeout(() => {
                    setDriveLinkState(prev => ({ ...prev, updated: false }));
                }, 2000);
            } else {
                const errorData = await res.json();
                setDriveLinkState(prev => ({ 
                    ...prev, 
                    error: errorData.error || 'Failed to update drive link' 
                }));
            }
        } catch (error) {
            console.error('Error updating drive link:', error);
            setDriveLinkState(prev => ({ 
                ...prev, 
                error: 'An error occurred while updating the drive link' 
            }));
        } finally {
            setDriveLinkState(prev => ({ ...prev, isUpdating: false }));
        }
    };

    const handleRemovePeer = async (peer_id: string, peer_name: string) => {
        if (!user) return;

        setLoadingStates(prev => ({ ...prev, removing: true }));

        try {
            const idToken = await user.getIdToken(true);
            const res = await fetch('/api/v1/team/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({peer_id: peer_id, peer_name: peer_name}),
            });

            if (res.ok) {
                setTeam(null);
                setProfile({...profile, team_id: ''});
                setSuccessStates(prev => ({ ...prev, removed: true }));

            } else {
                const errorData = await res.json();
                console.log(errorData.error || 'Failed to remove team');
            }
        } catch (error) {
            console.error('Error removing from team:', error);
            console.log('An error occurred while removing from the team');
        } finally {
            setLoadingStates(prev => ({ ...prev, removing: false }));

            // Clear any existing timer
            if (leaveTimer) {
                clearTimeout(leaveTimer);
            }

            // Set delay for removing state with proper cleanup
            const timer = setTimeout(() => {
                setSuccessStates(prev => ({ ...prev, removed: false }));
                setLeaveTimer(null);
                window.location.reload();
            }, 2000);

            setLeaveTimer(timer);
        }
    }

    const handleDeleteTeam = async () => {
        if (!user) return;

        setLoadingStates(prev => ({ ...prev, deleting: true }));

        try {
            const idToken = await user.getIdToken(true);
            const res = await fetch('/api/v1/team/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({team_id: form.team_id}),
            });

            if (res.ok) {
                setTeam(null);
                setProfile({...profile, team_id: ''});
                setSuccessStates(prev => ({ ...prev, deleted: true }));

            } else {
                const errorData = await res.json();
                console.log(errorData.error || 'Failed to remove team');
            }
        } catch (error) {
            console.error('Error removing from team:', error);
            console.log('An error occurred while removing from the team');
        } finally {
            setLoadingStates(prev => ({ ...prev, deleting: false }));

            // Clear any existing timer
            if (leaveTimer) {
                clearTimeout(leaveTimer);
            }

            // Set delay for deleting state with proper cleanup
            const timer = setTimeout(() => {
                setSuccessStates(prev => ({ ...prev, deleted: false }));
                setLeaveTimer(null);
                router.push('/hackathon/dashboard');
            }, 2000);

            setLeaveTimer(timer);
        }
    }

    const handleFinalizeTeam = async () => {
        if (!user) return;

        setLoadingStates(prev => ({ ...prev, finalizing: true }));

        try {
            const idToken = await user.getIdToken(true);
            const res = await fetch('/api/v1/team/finalize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({team_id: form.team_id}),
            });

            if (res.ok) {
                // Update team state to reflect finalized status
                if (team) {
                    setTeam({...team, finalized: true});
                }
                // Update form state to reflect finalized status
                setForm(prev => ({...prev, finalized: true}));
                setSuccessStates(prev => ({ ...prev, finalized: true }));

            } else {
                const errorData = await res.json();
                console.log(errorData.error || 'Failed to finalize team');
            }
        } catch (error) {
            console.error('Error finalizing team:', error);
            console.log('An error occurred while finalizing the team');
        } finally {
            setLoadingStates(prev => ({ ...prev, finalizing: false }));

            // Clear any existing timer
            if (leaveTimer) {
                clearTimeout(leaveTimer);
            }

            // Set delay for finalized state with proper cleanup
            const timer = setTimeout(() => {
                setSuccessStates(prev => ({ ...prev, finalized: false }));
                setLeaveTimer(null);
                // Optionally redirect or refresh
                // router.push('/hackathon/dashboard');
            }, 2000);

            setLeaveTimer(timer);
        }
    }

    useEffect(() => {
        if (team) {
            setIsFormLoading(true);
            const timer = setTimeout(() => {
                setForm({
                    team_id: team.team_id || '',
                    team_name: team.team_name || '',
                    team_leader: team.team_leader || '',
                    peers: (team.peers as Array<{ id: string; name: string }>) || [],
                    drive_link: team.drive_link || '',
                    finalized: team.finalized || false,
                });
                setIsFormLoading(false);
            }, 1);
            return () => clearTimeout(timer);
        }
    }, [team]);

    const handleLeaveTeam = async () => {
        if (!user) return;

        setLoadingStates(prev => ({ ...prev, leaving: true }));

        try {
            const idToken = await user.getIdToken(true);
            const res = await fetch('/api/v1/team/leave', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({team_id: form.team_id}),
            });

            if (res.ok) {
                setTeam(null);
                setProfile({...profile, team_id: ''});

                // Set leave state to show success message
                setSuccessStates(prev => ({ ...prev, left: true }));

            } else {
                const errorData = await res.json();
                console.log(errorData.error || 'Failed to leave team');
            }
        } catch (error) {
            console.error('Error leaving team:', error);
            console.log('An error occurred while leaving the team');
        } finally {
            setLoadingStates(prev => ({ ...prev, leaving: false }));

            // Clear any existing timer
            if (leaveTimer) {
                clearTimeout(leaveTimer);
            }

            // Set delay for leaving state with proper cleanup
            const timer = setTimeout(() => {
                setSuccessStates(prev => ({ ...prev, left: false }));
                setLeaveTimer(null);
                window.location.reload();
                router.push('/hackathon/dashboard');
            }, 2000);

            setLeaveTimer(timer);
        }
    }

    // Cleanup timer on component unmount
    useEffect(() => {
        return () => {
            if (leaveTimer) {
                clearTimeout(leaveTimer);
            }
        };
    }, [leaveTimer]);

    const renderDriveLinkModal = () => {
        if (!driveLinkState.showModal) return null;

        const handleValidateAndSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!driveLinkState.link.trim()) return;

            // First validate the drive link
            const validationResult = await validateDriveLink(driveLinkState.link);
            
            if (validationResult && validationResult.accessible) {
                // If accessible, proceed to save
                handleDriveLinkChange(driveLinkState.link);
            }
            // If not accessible, error message is already set by validateDriveLink
        };
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Add Drive Link</h2>
                    
                    <form onSubmit={handleValidateAndSubmit}>
                        <div className="mb-4">
                            <Label htmlFor="drive_link" className="mb-2">Google Drive Link</Label>
                            <Input
                                id="drive_link"
                                type="url"
                                value={driveLinkState.link}
                                onChange={(e) => {
                                    setDriveLinkState(prev => ({ 
                                        ...prev, 
                                        link: e.target.value, 
                                        isDirty: true,
                                        validationResult: null,
                                        error: ''
                                    }));
                                }}
                                placeholder="https://drive.google.com/drive/folders/..."
                                className="text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Validation Result */}
                        {driveLinkState.validationResult && (
                            <div className={`mb-4 p-3 rounded-md ${
                                driveLinkState.validationResult.accessible 
                                    ? 'bg-green-50 border border-green-200' 
                                    : 'bg-red-50 border border-red-200'
                            }`}>
                                <p className={`text-sm ${
                                    driveLinkState.validationResult.accessible 
                                        ? 'text-green-700' 
                                        : 'text-red-700'
                                }`}>
                                    {driveLinkState.validationResult.accessible ? '✓ ' : '✗ '}
                                    {driveLinkState.validationResult.message}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    HTTP Status: {driveLinkState.validationResult.status}
                                </p>
                            </div>
                        )}
                        
                        <div className="mb-6">
                            <p className="text-sm text-gray-600">
                                Please make sure your drive folder is set to &quot;Anyone with the link can view&quot; permissions.
                            </p>
                        </div>
                        
                        {driveLinkState.error && !driveLinkState.validationResult && (
                            <p className="text-red-500 text-sm mb-4">{driveLinkState.error}</p>
                        )}
                        
                        <div className="flex gap-3">
                            <Button 
                                type="button"
                                onClick={() => {
                                    setDriveLinkState(prev => ({
                                        ...prev,
                                        showModal: false,
                                        link: '',
                                        isDirty: false,
                                        error: '',
                                        validationResult: null
                                    }));
                                }}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit"
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 transition-colors disabled:opacity-50"
                                disabled={
                                    driveLinkState.isUpdating || 
                                    driveLinkState.updated || 
                                    !driveLinkState.isDirty ||
                                    driveLinkState.isValidating
                                }
                            >
                                {driveLinkState.isValidating ? 'Validating...' : 
                                 driveLinkState.isUpdating ? 'Saving...' : 
                                 driveLinkState.updated ? 'Saved!' : 'Save Link'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const displayTeamLeader = () => {
        const joinLink = `${profile?.email || ''}`;
        
        const copyTeamLeaderEmail = () => {
            navigator.clipboard.writeText(joinLink);
            setCopied(true);
            // Reset the copied state after 2 seconds
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        };

        return (
            <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
                {/* Team Name Section */}
                <div className="mb-4">
                    <div className={`rounded-lg p-3 border-2 ${
                        form.finalized ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300'
                    }`}>
                        <div className="text-center text-gray-700 font-medium">
                            {form.team_name || 'Team Name'}
                            {form.finalized && <span className="ml-2 text-green-600 text-sm">✓ Finalized</span>}
                        </div>
                    </div>
                </div>

                {/* Copy Team Leader Email - Only show if not finalized */}
                {!form.finalized && (
                    <div className="mb-4">
                        <button 
                            onClick={copyTeamLeaderEmail}
                            className={`w-full px-4 py-2 rounded-lg transition-colors ${
                                copied 
                                    ? 'bg-green-500 hover:bg-green-600' 
                                    : 'bg-blue-500 hover:bg-blue-600'
                            } text-white`}
                        >
                            {copied ? 'Copied!' : 'Copy Team Leader Email'}
                        </button>
                    </div>
                )}

                {/* Team Leader Section */}
                <div className="mb-3">
                    <div className="bg-yellow-200 rounded-lg p-3 border-2 border-yellow-300">
                        <div className="text-center text-gray-800 font-medium">
                            {form.team_leader} - Leader
                        </div>
                    </div>
                </div>

                {/* Team Members Section */}
                {form.peers && form.peers.map((peer) => {
                    return (
                        <div key={peer.id} className="mb-3">
                            <div className="bg-red-200 rounded-lg p-3 border-2 border-red-300 flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="text-center text-gray-800 font-medium">
                                        {peer.name} - Member
                                    </div>
                                </div>
                                {/* Remove button - Only show if not finalized */}
                                {!form.finalized && (
                                    <button 
                                        onClick={() => handleRemovePeer(peer.id, peer.name)}
                                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors ml-2"
                                        disabled={loadingStates.removing}
                                    >
                                        {loadingStates.removing ? 'Removing...' : 'Remove'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mt-6">
                    {/* Drive Link Section */}
                    {form.finalized && form.drive_link ? (
                        /* Show drive link if finalized and link exists */
                        <a 
                            href={form.drive_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-center block"
                        >
                            Open Drive Link
                        </a>
                    ) : !form.finalized ? (
                        /* Show add drive link button if not finalized */
                        <button 
                            onClick={() => {
                                setDriveLinkState(prev => ({
                                    ...prev,
                                    link: form.drive_link || '',
                                    isDirty: false,
                                    error: '',
                                    showModal: true
                                }));
                            }}
                            className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                        >
                            Add Drive Link
                        </button>
                    ) : null}
                    
                    {/* Delete and Finalize Buttons - Only show if not finalized */}
                    {!form.finalized && (
                        <div className="flex gap-3">
                            <button 
                                onClick={handleDeleteTeam}
                                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                disabled={loadingStates.deleting || (form.peers && form.peers.length > 0)}
                            >
                                {loadingStates.deleting ? 'Deleting...' : successStates.deleted ? 'Deleted!' : 'Delete Team'}
                            </button>
                            
                            <button 
                                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                onClick={handleFinalizeTeam}
                                disabled={loadingStates.finalizing}
                            >
                                {loadingStates.finalizing ? 'Finalizing...' : successStates.finalized ? 'Finalized!' : 'Finalize Team'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Team Info */}
                <div className="mt-4 text-xs text-gray-500 text-center">
                    Team Leader Email: {profile?.email || 'Not available'}
                </div>
                
                {/* Drive Link Modal - Only show if not finalized */}
                {!form.finalized && renderDriveLinkModal()}
            </div>
        )
    }

    const displayTeamMember = () => {
        return (
            <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
                {/* Team Name Section */}
                <div className="mb-4">
                    <div className="bg-gray-100 rounded-lg p-3 border-2 border-gray-300">
                        <div className="text-center text-gray-700 font-medium">
                            {form.team_name || 'Team Name'}
                        </div>
                    </div>
                </div>

                {/* Team Leader Section */}
                <div className="mb-3">
                    <div className="bg-yellow-200 rounded-lg p-3 border-2 border-yellow-300">
                        <div className="text-center text-gray-800 font-medium">
                            {form.team_leader} - Leader
                        </div>
                    </div>
                </div>

                {/* Team Members Section */}
                {form.peers && form.peers.map((peer) => {
                    const isCurrentUser = peer?.id === user?.uid;
                    
                    return (
                        <div key={peer.id} className="mb-3">
                            <div className={`rounded-lg p-3 border-2 flex items-center justify-between ${
                                isCurrentUser 
                                    ? 'bg-blue-200 border-blue-300' 
                                    : 'bg-red-200 border-red-300'
                            }`}>
                                <div className="flex-1">
                                    <div className="text-center text-gray-800 font-medium">
                                        {peer.name} - Member {isCurrentUser ? '(You)' : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Leave Team Button - Only show if not finalized */}
                {!form.finalized && (
                    <div className="mt-6">
                        <button 
                            onClick={handleLeaveTeam}
                            className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                            disabled={loadingStates.leaving}
                        >
                            {loadingStates.leaving ? 'Leaving...' : successStates.left ? 'Left!' : 'Leave Team'}
                        </button>
                    </div>
                )}

                {/* Team Info */}
                <div className="mt-4 text-xs text-gray-500 text-center">
                    Team ID: {form.team_id}
                </div>
                
                {form.drive_link && (
                    <div className="mt-2 text-xs text-gray-500 text-center">
                        <a href={form.drive_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            Drive Link
                        </a>
                    </div>
                )}
            </div>
        )
    }

    if (loading || teamLoading || isFormLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                        {loading || teamLoading ? 'Loading...' : 'Preparing team...'}
                    </p>
                </div>
            </div>
        );
    }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        {form.team_id !== "" ? (form.team_id === user?.uid ? displayTeamLeader() : displayTeamMember()) : <div className="text-gray-500">No Team Created</div>}
    </div>
  );
}