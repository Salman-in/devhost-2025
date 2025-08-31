import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface LoadingStates {
    removing: boolean;
    deleting: boolean;
    leaving: boolean;
    finalizing: boolean;
}

interface SuccessStates {
    removed: boolean;
    deleted: boolean;
    left: boolean;
    finalized: boolean;
}

export function useTeamActions(refreshAll: () => void) {
    const { user } = useAuth();
    const router = useRouter();
    
    const [loadingStates, setLoadingStates] = useState<LoadingStates>({
        removing: false,
        deleting: false,
        leaving: false,
        finalizing: false
    });
    
    const [successStates, setSuccessStates] = useState<SuccessStates>({
        removed: false,
        deleted: false,
        left: false,
        finalized: false
    });
    
    const [finalizeError, setFinalizeError] = useState<string | null>(null);

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

    const handleDeleteTeam = async (teamId: string) => {
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
                body: JSON.stringify({ team_id: teamId }),
            });

            if (res.ok) {
                setSuccessStates(prev => ({ ...prev, deleted: true }));
                document.cookie = 'hasTeam=false; path=/; max-age=0';
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

    const handleFinalizeTeam = async (teamId: string) => {
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
                body: JSON.stringify({ team_id: teamId }),
            });

            if (res.ok) {
                setSuccessStates(prev => ({ ...prev, finalized: true }));
                setFinalizeError(null);
                refreshAll();
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

    const handleLeaveTeam = async (teamId: string) => {
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
                body: JSON.stringify({ team_id: teamId }),
            });

            if (res.ok) {
                setSuccessStates(prev => ({ ...prev, left: true }));
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

    return {
        loadingStates,
        successStates,
        finalizeError,
        handleRemovePeer,
        handleDeleteTeam,
        handleFinalizeTeam,
        handleLeaveTeam
    };
}
