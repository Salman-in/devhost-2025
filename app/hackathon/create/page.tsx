"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

interface TeamFormData {
    team_name: string;
}

export default function HackathonCreateTeam() {
    const router = useRouter();
    const { user, loading } = useAuth();
    
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        clearErrors
    } = useForm<TeamFormData>();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/signin');
        }
    }, [user, loading, router]);

    const onSubmit = async (data: TeamFormData) => {
        if (!user) return;

        clearErrors();

        try {
            const idToken = await user.getIdToken(true);
            const res = await fetch('/api/v1/team/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                // Set a flag in sessionStorage to indicate team was just created
                sessionStorage.setItem('teamJustCreated', 'true');
                // Redirect with a flag to prevent loops
                window.location.href = '/hackathon/dashboard?created=true';
            } else {
                const errorData = await res.json();
                setError('root', { message: errorData.error || 'Failed to create team' });
            }
        } catch (error) {
            console.error('Error creating team:', error);
            setError('root', { message: 'An error occurred while creating the team' });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <div className="bg-white rounded-lg shadow p-8">
                <form className="flex flex-col justify-center items-center space-y-6 text-gray-900" onSubmit={handleSubmit(onSubmit)}>
                    <div className="gap-6">
                        <div>
                            <Label htmlFor="team_name" className="mb-2">Team Name</Label>
                            <Input
                                id="team_name"
                                type="text"
                                {...register("team_name", { 
                                    required: "Team name is required",
                                    minLength: { value: 2, message: "Team name must be at least 2 characters" }
                                })}
                                placeholder="Enter a team name"
                                className="text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.team_name && (
                                <p className="text-red-500 text-sm mt-1">{errors.team_name.message}</p>
                            )}
                        </div>
                    </div>
                    
                    {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}

                    <Button
                        type="submit"
                        className="bg-black hover:bg-black/70 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Team'}
                    </Button>
                </form>
            </div>
        </div>
    );
}