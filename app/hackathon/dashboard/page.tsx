'use client';

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, CheckIcon, CopyIcon } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useUserAndTeam } from "@/lib/hooks/useUserData";
import DecryptText from "@/components/animated/TextAnimation";


export default function HackathonDashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { profile, team, isLoading, hasTeam, refreshAll } = useUserAndTeam();
    
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
    const [finalizeError, setFinalizeError] = useState<string | null>(null);
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
                body: JSON.stringify({ drive_link, team_id: team?.team_id }),
            });

            if (res.ok) {
                setDriveLinkState(prev => ({
                    ...prev,
                    updated: true,
                    showModal: false,
                    isDirty: false
                }));
                // Refresh team data to get updated drive link
                refreshAll();
                // Reset success state after showing success
                setTimeout(() => {
                    setDriveLinkState(prev => ({ ...prev, updated: false }));
                }, 1500);
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
                body: JSON.stringify({ peer_id: peer_id, peer_name: peer_name }),
            });

            if (res.ok) {
                setSuccessStates(prev => ({ ...prev, removed: true }));
                // Refresh data after removal
                setTimeout(() => {
                    refreshAll();
                }, 800);
            } else {
                const errorData = await res.json();
                console.log(errorData.error || 'Failed to remove team');
            }
        } catch (error) {
            console.error('Error removing from team:', error);
            console.log('An error occurred while removing from the team');
        } finally {
            setLoadingStates(prev => ({ ...prev, removing: false }));
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
                body: JSON.stringify({ team_id: team?.team_id }),
            });

            if (res.ok) {
                setSuccessStates(prev => ({ ...prev, deleted: true }));
                // Reload the page after short delay
                setTimeout(() => {
                    window.location.reload();
                }, 800);
            } else {
                const errorData = await res.json();
                console.log(errorData.error || 'Failed to remove team');
            }
        } catch (error) {
            console.error('Error removing from team:', error);
            console.log('An error occurred while removing from the team');
        } finally {
            setLoadingStates(prev => ({ ...prev, deleting: false }));
        }
    }

    const handleFinalizeTeam = async () => {
        if (!user) return;

        setLoadingStates(prev => ({ ...prev, finalizing: true }));
        setFinalizeError(null);

        try {
            const idToken = await user.getIdToken(true);
            const res = await fetch('/api/v1/team/finalize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({ team_id: team?.team_id }),
            });

            if (res.ok) {
                setSuccessStates(prev => ({ ...prev, finalized: true }));
                setFinalizeError(null);
                // Refresh team data to reflect finalized status
                refreshAll();
                // Reset success state
                setTimeout(() => {
                    setSuccessStates(prev => ({ ...prev, finalized: false }));
                }, 1500);
            } else {
                const errorData = await res.json();
                setFinalizeError(errorData.error || 'Failed to finalize team');
                console.log(errorData.error || 'Failed to finalize team');
            }
        } catch (error) {
            setFinalizeError('An error occurred while finalizing the team');
            console.error('Error finalizing team:', error);
            console.log('An error occurred while finalizing the team');
        } finally {
            setLoadingStates(prev => ({ ...prev, finalizing: false }));
        }
    }

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
                body: JSON.stringify({ team_id: team?.team_id }),
            });

            if (res.ok) {
                setSuccessStates(prev => ({ ...prev, left: true }));
                // Navigate after short delay
                setTimeout(() => {
                    window.location.reload();
                    router.push('/hackathon/dashboard');
                }, 800);
            } else {
                const errorData = await res.json();
                console.log(errorData.error || 'Failed to leave team');
            }
        } catch (error) {
            console.error('Error leaving team:', error);
            console.log('An error occurred while leaving the team');
        } finally {
            setLoadingStates(prev => ({ ...prev, leaving: false }));
        }
    }

    const copyTeamLeaderEmail = () => {
        const leaderEmail = profile?.email || '';
        navigator.clipboard.writeText(leaderEmail);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

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
            
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div
                className="p-6 w-full max-w-md mx-4"
                style={{
                    clipPath: "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)",
                    backgroundColor: "#101810"
                }}
            >
            <h2 className="text-xl font-orbitron font-bold text-primary mb-4">Add Drive Link</h2>

            <form onSubmit={handleValidateAndSubmit}>
                <div className="mb-4">
                    <Label htmlFor="drive_link" className="mb-2 text-white">Google Drive Link</Label>
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
                        className="text-black placeholder:text-white border border-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-none bg-white"
                        required
                    />
                </div>

                        {/* Validation Result */}
                        {driveLinkState.validationResult && (
                            <div className={`mb-4 p-3 rounded-md ${driveLinkState.validationResult.accessible
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                                }`}>
                                <p className={`text-sm ${driveLinkState.validationResult.accessible
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
                            <p className="text-sm text-destructive">
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
                                className="flex-1 flex cursor-pointer items-center justify-center gap-2 bg-gray-200 px-6 py-3 text-xs sm:text-sm font-orbitron font-bold tracking-wider text-black uppercase transition-all hover:brightness-90 disabled:opacity-50"
                                style={{
                                    clipPath: "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)"
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                className="flex-1 flex cursor-pointer items-center justify-center gap-2 bg-primary px-6 py-3 text-xs sm:text-sm font-orbitron font-bold tracking-wider text-black uppercase transition-all hover:brightness-90 disabled:opacity-50"
                                style={{
                                    clipPath: "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)"
                                }}
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
        if (!team) return null;
        
        return (
                <div
            className="w-full max-w-2xl mx-auto bg-[#101810] border border-primary/40 p-8"
            style={{
                clipPath: "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)"
            }}
            >

                {/* Team Name with Copy Email Button */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-orbitron text-primary mb-3 tracking-tight">
                        {team.team_name || 'Team Name'}
                        {team.finalized && <span className="ml-2 text-primary text-lg align-middle">✓ Finalized</span>}
                    </h2>
                    {!team.finalized && (
                        <div className="flex text-primary justify-center space-x-2 items-center">
    <div className="text-white">

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
                   <h3 className="text-lg font-orbitron text-primary mb-4 tracking-wide">Team Members</h3>

                    <div className="space-y-3">
                        {/* Team Leader */}
                         <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-primary/40">
                             <div className="flex items-center gap-3">
                                <span className="bg-primary text-black px-2 py-1 rounded-full text-xs font-bold">LEADER</span>
                                <span className="text-black font-medium">{team.team_leader}</span>
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
                            onClick={() => {
                                setDriveLinkState(prev => ({
                                   ...prev,
                                   link: team.drive_link || '',
                                   isDirty: false,
                                   error: '',
                                   showModal: true
                          }));
                       }}
    className="w-full flex cursor-pointer items-center justify-center gap-2 bg-secondary px-6 py-3 text-xs sm:text-sm font-orbitron font-bold tracking-wider text-black uppercase transition-all hover:brightness-90 disabled:opacity-50"
                            style={{
                                  clipPath: "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)"
                                    }}
                                    >
                              Add Drive Link
                        </button>

                    ) : null}

                    {!team.finalized && (
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDeleteTeam}
                                     style={{
                                  clipPath: "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)"
                                    }}
                                    className="flex-1 flex cursor-pointer items-center justify-center gap-2 bg-destructive px-6 py-3 text-xs sm:text-sm font-orbitron font-bold tracking-wider text-black uppercase transition-all hover:brightness-80 disabled:opacity-50"
                                    disabled={loadingStates.deleting || (team.peers && team.peers.length > 0)}
                                >
                                    {loadingStates.deleting ? 'Deleting...' : successStates.deleted ? 'Deleted!' : 'Delete Team'}
                                </button>
                                <button
                                    style={{
                                  clipPath: "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)"
                                    }}
                                    className="flex-1 flex cursor-pointer items-center justify-center gap-2 bg-primary px-6 py-3 text-xs sm:text-sm font-orbitron font-bold tracking-wider text-black uppercase transition-all hover:brightness-80 disabled:opacity-50"
                                    onClick={handleFinalizeTeam}
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
                {!team.finalized && renderDriveLinkModal()}
            </div>
        );
    }

    const displayTeamMember = () => {
        if (!team) return null;
        
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
                            onClick={handleLeaveTeam}
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

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/signin');
        }
    }, [user, authLoading, router]);

    // Redirect if no team - but only if we have loaded the data and confirmed no team
    useEffect(() => {
        if (!isLoading && profile && !hasTeam) {
            // Check if we just came from team creation/joining to prevent redirect loop
            const urlParams = new URLSearchParams(window.location.search);
            const fromTeamAction = urlParams.get('created') === 'true' || urlParams.get('joined') === 'true';
            
            if (!fromTeamAction) {
                router.replace('/hackathon');
            }
        }
    }, [profile, hasTeam, isLoading, router]);

    // Clean up URL params if they exist
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('created') || urlParams.get('joined')) {
            window.history.replaceState({}, '', '/hackathon/dashboard');
        }
    }, []);

    if (authLoading || isLoading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return null;
    }

    if (!profile || !team) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading team data...</h1>
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative bg-black flex flex-col items-center justify-start py-12 px-4 z-10">

        {/* GRID BACKGROUND */}
        <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
            backgroundImage: `
            linear-gradient(to right, #a3ff12 1px, transparent 1px),
            linear-gradient(to bottom, #a3ff12 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            opacity: 0.13, 
        }}
        />

            <div className="relative z-10 w-full max-w-3xl mb-10 text-center">
                <h1 className="text-primary font-orbitron text-lg sm:text-2xl md:text-4xl font-bold uppercase mb-3 tracking-wider text-center">
                    Hackathon Dashboard
                </h1>
                <DecryptText
                    text="> Manage your team, collaborate, and track your hackathon progress here."
                    startDelayMs={300}
                    trailSize={5}
                    flickerIntervalMs={50}
                    revealDelayMs={100}
                    className="mb-2 font-orbitron text-xs sm:text-sm text-white/70"
                />

                <div className="flex flex-wrap justify-center gap-4">
                <Button
                    className="flex cursor-pointer items-center justify-center gap-2 bg-primary rounded-none px-6 py-3 text-xs sm:text-sm font-orbitron font-bold tracking-wider text-black uppercase transition-all hover:brightness-90 disabled:opacity-50"
                    style={{
                    clipPath: "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)"
                    }}
                >
                    <Link href="/profile" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4 inline-flex items-center" /> Go to Profile
                    </Link>
                </Button>
                </div>

    </div>
    <div className="relative z-10 w-full max-w-4xl">
        {team && (
            team.team_id === user?.uid ? (
                <div className="animate-fade-in-up">{displayTeamLeader()}</div>
            ) : (
                <div className="animate-fade-in-up">{displayTeamMember()}</div>
            )
        )}
    </div>
</div>
);

}
