"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

interface JoinFormData {
    leader_email: string;
}

export default function HackathonJoinTeam() {
    const router = useRouter();
    const { user, loading } = useAuth();
    
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        clearErrors
    } = useForm<JoinFormData>();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/signin');
        }
    }, [user, loading, router]);

    const onSubmit = async (data: JoinFormData) => {
        if (!user) return;

        clearErrors();

        try {
            const idToken = await user.getIdToken(true);
            const res = await fetch('/api/v1/team/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                // Set a flag in sessionStorage to indicate team was just joined
                sessionStorage.setItem('teamJustJoined', 'true');
                // Redirect with a flag to prevent loops
                window.location.href = '/hackathon/dashboard?joined=true';
            } else {
                const errorData = await res.json();
                setError('root', { 
                    message: errorData.error || 'Team leader not found or team is already finalized. Please check the email and try again.' 
                });
            }
        } catch (error) {
            console.error('Error joining team:', error);
            setError('root', { message: 'An error occurred while joining the team.' });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <div className="bg-white rounded-lg shadow p-8">
                <form className="flex flex-col justify-center items-center space-y-6 text-gray-900" onSubmit={handleSubmit(onSubmit)}>
                    <div className="gap-6">
                        <div>
                            <Label htmlFor="leader_email" className="mb-2">Team Leader Email</Label>
                            <Input
                                id="leader_email"
                                type="email"
                                {...register("leader_email", { 
                                    required: "Team leader email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                                placeholder="Enter team leader's email"
                                className="text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.leader_email && (
                                <p className="text-red-500 text-sm mt-1">{errors.leader_email.message}</p>
                            )}
                        </div>
                    </div>
                    
                    {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}

                    <Button
                        type="submit"
                        className="bg-black hover:bg-black/70 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Joining...' : 'Join Team'}
                    </Button>
                </form>
            </div>
        </div>
    );
}