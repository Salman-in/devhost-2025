"use client";

import {useEffect, useState} from "react";
import {useAuth} from "@/context/AuthContext";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {useRouter} from "next/navigation";

export default function HackathonJoinTeam() {
    const router = useRouter();
    const { user, loading, signOut, profile, profileLoading, setProfile, team, teamLoading, setTeam } = useAuth();
    const [form, setForm] = useState({
        team_id: '',
    });

    const [isJoining, setIsJoining] = useState(false);
    const [join, setJoined] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;

        if (!form.team_id) {
            setError('All fields are required.');
            return;
        }
        setError('');

        setIsJoining(true);
        setJoined(false);

        try {
            // Force refresh token to get latest user claims (updated name)
            const idToken = await user.getIdToken(true);
            const res = await fetch('/api/v1/team/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                setJoined(true);
                setIsDirty(false);
            }
        } catch (error) {
            console.error('Error joining team:', error);
        } finally {
            setIsJoining(false);
            setTimeout(() => setJoined(false), 2000);
        }
    };

    useEffect(() => {
        if (join) {
            const timer = setTimeout(() => {
                router.push('/profile/hackathon');
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [join, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <div className="bg-white rounded-lg shadow p-8">
                <form className="flex flex-col justify-center items-center space-y-6 text-gray-900" onSubmit={handleSubmit}>
                    <div className="gap-6">
                        <div>
                            <Label htmlFor="team_id" className="mb-2">Team ID</Label>
                            <Input
                                id="team_id"
                                type="text"
                                value={form.team_id}
                                onChange={(e) => {
                                    setForm({ ...form, team_id: e.target.value });
                                    setIsDirty(true);
                                }}

                                placeholder="Enter team ID"
                                className="text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <Button
                        type="submit"
                        className="bg-black hover:bg-black/70 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                        disabled={isJoining || join || !isDirty}
                    >
                        {isJoining ? 'Joining...' : join ? 'Joined!': 'Join'}
                    </Button>
                </form>
            </div>
        </div>
    );
}