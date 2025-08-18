"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function HackathonCreateTeam() {
    const router = useRouter();
    const { user, loading, signOut, profile, profileLoading, setProfile, team, teamLoading, setTeam, refreshProfileAndTeam } = useAuth();
    const [form, setForm] = useState({
        team_name: '',
    });

    const [isCreating, setIsCreating] = useState(false);
    const [create, setCreated] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;

        if (!form.team_name) {
            setError('All fields are required.');
            return;
        }
        setError('');

        setIsCreating(true);
        setCreated(false);

        try {
            // Force refresh token to get latest user claims (updated name)
            const idToken = await user.getIdToken(true);
            const res = await fetch('/api/v1/team/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                await refreshProfileAndTeam();
                setCreated(true);
                setIsDirty(false);
            }
        } catch (error) {
            console.error('Error creating team:', error);
        } finally {
            setIsCreating(false);
            setTimeout(() => setCreated(false), 2000);
        }
    };

    useEffect(() => {
        if (create) {
            const timer = setTimeout(() => {
                router.push('/hackathon/dashboard');
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [create, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <div className="bg-white rounded-lg shadow p-8">
                <form className="flex flex-col justify-center items-center space-y-6 text-gray-900" onSubmit={handleSubmit}>
                    <div className="gap-6">
                        <div>
                            <Label htmlFor="team_name" className="mb-2">Team Name</Label>
                            <Input
                                id="team_name"
                                type="text"
                                value={form.team_name}
                                onChange={(e) => {
                                    setForm({ ...form, team_name: e.target.value });
                                    setIsDirty(true);
                                }}

                                placeholder="Enter a team name"
                                className="text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <Button
                        type="submit"
                        className="bg-black hover:bg-black/70 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                        disabled={isCreating || create || !isDirty}
                    >
                        {isCreating ? 'Creating...' : create ? 'Created!' : 'Create'}
                    </Button>
                </form>
            </div>
        </div>
    );
}