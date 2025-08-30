
"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/lib/hooks/useUserData";

export default function HackathonPage() {
    const { user, loading: authLoading } = useAuth();
    const { profile, profileLoading } = useUserProfile();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/signin');
        }
    }, [user, authLoading, router]);    

    useEffect(() => {
        // Only redirect if we have profile data and user has a team
        if (!profileLoading && profile?.team_id) {
            router.replace("/hackathon/dashboard");
        }
    }, [profile, profileLoading, router]);

    if (authLoading || profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center bg-white h-screen text-black gap-5">
            <div>
                <h1>About Page</h1>
                <p>This is the about page for the hackathon.</p>
            </div>
            <div className="mb-6 bg-white rounded-lg shadow p-8">
                <Button className="bg-black hover:bg-black/70 text-white m-5" asChild><Link href="/hackathon/join">Join a Team</Link></Button>
                <Button className="bg-black hover:bg-black/70 text-white m-5" asChild><Link href="/hackathon/create">Create a Team</Link></Button>
            </div>
        </div>
    );
}