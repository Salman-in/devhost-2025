'use client';

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useUserAndTeam } from "@/lib/hooks/useUserData";
import TeamLeaderView from "@/components/hackathon/TeamLeaderView";
import TeamMemberView from "@/components/hackathon/TeamMemberView";

export default function HackathonDashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { profile, team, isLoading, hasTeam, refreshAll } = useUserAndTeam();

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

    const isTeamLeader = team.team_id === user.uid;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center justify-start py-12 px-4">
            <div className="w-full max-w-3xl mb-10 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight drop-shadow-lg">
                    Hackathon Dashboard
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-6">
                    Manage your team, collaborate, and track your hackathon progress here.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Button variant="outline" className="bg-white hover:text-black text-black border shadow" asChild>
                        <Link href="/profile">
                            <ArrowLeft className="h-4 w-4" /> Go to Profile
                        </Link>
                    </Button>
                </div>
            </div>
            
            <div className="w-full max-w-4xl">
                <div className="animate-fade-in-up">
                    {isTeamLeader ? (
                        <TeamLeaderView 
                            team={team} 
                            profile={profile}
                            refreshAll={refreshAll}
                        />
                    ) : (
                        <TeamMemberView 
                            team={team} 
                            refreshAll={refreshAll}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
