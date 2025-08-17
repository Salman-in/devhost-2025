'use client';

import {Button} from "@/components/ui/button";
import Link from "next/link";
import {useAuth} from "@/context/AuthContext";
import {useEffect, useState} from "react";
import {Label} from "@/components/ui/label";

export default function HackathonPage() {
    const { user, loading, profile, setProfile, team, teamLoading, setTeam } = useAuth();
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [leave, setLeave] = useState(false);
    const [leaveTimer, setLeaveTimer] = useState<NodeJS.Timeout | null>(null);
    const [form, setForm] = useState<{
        team_id: string;
        team_name: string;
        team_leader: string;
        peers: Array<{ id: string; name: string }>;
        drive_link: string;
    }>({
        team_id: '',
        team_name: '',
        team_leader: '',
        peers: [],
        drive_link: '',
    });

    const handleRemovePeer = async (peer_id: string, peer_name: string) => {
        if (!user) return;

        setIsLeaving(true);

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
                setLeave(true);

            } else {
                const errorData = await res.json();
                console.log(errorData.error || 'Failed to remove team');
            }
        } catch (error) {
            console.error('Error removing from team:', error);
            console.log('An error occurred while removing from the team');
        } finally {
            setIsLeaving(false);

            // Clear any existing timer
            if (leaveTimer) {
                clearTimeout(leaveTimer);
            }

            // Set delay for leaving state with proper cleanup
            const timer = setTimeout(() => {
                setLeave(false);
                setLeaveTimer(null);
                // Refresh the page to show updated state instead of router.push
                window.location.reload();
            }, 2000);

            setLeaveTimer(timer);
        }
    }

    const handleDeleteTeam = async () => {
        if (!user) return;

        setIsLeaving(true);

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
                setLeave(true);

            } else {
                const errorData = await res.json();
                console.log(errorData.error || 'Failed to remove team');
            }
        } catch (error) {
            console.error('Error removing from team:', error);
            console.log('An error occurred while removing from the team');
        } finally {
            setIsLeaving(false);

            // Clear any existing timer
            if (leaveTimer) {
                clearTimeout(leaveTimer);
            }

            // Set delay for leaving state with proper cleanup
            const timer = setTimeout(() => {
                setLeave(false);
                setLeaveTimer(null);
                // Refresh the page to show updated state instead of router.push
                window.location.reload();
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
                });
                setIsFormLoading(false);
            }, 1);
            return () => clearTimeout(timer);
        }
    }, [team]);

    const handleLeaveTeam = async () => {
        if (!user) return;

        setIsLeaving(true);

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
                setLeave(true);

            } else {
                const errorData = await res.json();
                console.log(errorData.error || 'Failed to leave team');
            }
        } catch (error) {
            console.error('Error leaving team:', error);
            console.log('An error occurred while leaving the team');
        } finally {
            setIsLeaving(false);

            // Clear any existing timer
            if (leaveTimer) {
                clearTimeout(leaveTimer);
            }

            // Set delay for leaving state with proper cleanup
            const timer = setTimeout(() => {
                setLeave(false);
                setLeaveTimer(null);
                // Refresh the page to show updated state instead of router.push
                window.location.reload();
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

    const displayButtons = () => {
        return (
            <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow p-8 gap-5">
                <Button className="bg-black hover:bg-black/70 text-white" asChild><Link href="/profile/hackathon/join">Join a Team</Link></Button>
                <Button className="bg-black hover:bg-black/70 text-white" asChild><Link href="/profile/hackathon/create">Create a Team</Link></Button>
            </div>
        );
    }

    const displayTeamLeader = () => {
        return (
            <div className="flex flex-col items-center justify-between mb-6 bg-white rounded-lg shadow p-8 gap-5 text-gray-900">
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <Label>Team ID: {form.team_id}</Label>
                <Label>Team Name: {form.team_name}</Label>
                <Label>Team Leader: {form.team_leader}</Label>
                <div className="w-full">
                    <Label>Peers:</Label>
                    <div className="mt-2 w-full space-y-2">
                        {form.peers && form.peers.length > 0 ? (
                            form.peers.map((peer) => (
                                <div key={peer.id} className="flex items-center justify-between w-full border rounded-md px-3 py-2">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-800">{peer.name}</span>
                                        <span className="text-xs text-gray-500">{peer.id}</span>
                                    </div>
                                    <Button className="bg-red-600 text-white" size="sm" onClick={() => handleRemovePeer(peer.id, peer.name)}>
                                        {isLeaving ? 'Removing...' : leave ? 'Removed!' : 'Remove'}
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <span className="text-sm text-gray-500">No peers added</span>
                        )}
                    </div>
                </div>
                <Label>Drive Link: {form.drive_link || 'Not provided'}</Label>
                {/* Show Delete Team button only when there are zero peers */}
                {form.peers && form.peers.length === 0 ? (
                    <Button className="bg-red-600 text-white mt-2" onClick={handleDeleteTeam}>
                        {isLeaving ? 'Deleting...' : leave ? 'Deleted!' : 'Delete Team'}
                    </Button>
                ) : null}
            </div>
        )
    }

    const displayTeamMember = () => {
        return (
            <div className="flex flex-col items-center justify-between mb-6 bg-white rounded-lg shadow p-8 gap-5 text-gray-900">
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <Label>Team ID: {form.team_id}</Label>
                <Label>Team Name: {form.team_name}</Label>
                <Label>Team Leader: {form.team_leader}</Label>
                <Label>
                    Peers: {form.peers.length > 0 ? form.peers.map(peer => peer.name).join(', ') : 'No peers added'}
                </Label>
                <Label>Drive Link: {form.drive_link || 'Not provided'}</Label>
                {form.team_id !== user?.uid ? <Button className="cursor-pointer" onClick={handleLeaveTeam}>
                    {isLeaving ? 'Leaving...' : leave ? 'Left!': 'Leave'}
                </Button> : null}
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
        {form.team_id !== "" ? (form.team_id === user?.uid ? displayTeamLeader() : displayTeamMember()) : displayButtons()}
    </div>
  );
}