'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    profile: any; //change this to proper type later
    profileLoading: boolean;
    setProfile: (profile: any) => void;
    team: any; //change this to proper type later
    teamLoading: boolean;
    setTeam: (team: any) => void;
    refreshProfileAndTeam: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [team, setTeam] = useState<any>(null);
    const [teamLoading, setTeamLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Helper function to refresh profile and team data (caching logic consolidated instead of .then chaining)
    const refreshProfileAndTeam = async () => {
        if (!user) {
            setProfile(null);
            setProfileLoading(false);
            setTeam(null);
            setTeamLoading(false);
            return;
        }

        setProfileLoading(true);
        try {
            const token = await user.getIdToken();

            // Ensure user exists in DB
            await fetch('/api/v1/user/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            // Fetch profile
            const profileRes = await fetch('/api/v1/user/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!profileRes.ok) throw new Error(`Failed to fetch profile: ${profileRes.status}`);
            const profileData = await profileRes.json();
            setProfile(profileData);

            // Fetch team if exists
            if (profileData.team_id) {
                setTeamLoading(true);
                const teamRes = await fetch(`/api/v1/team/get?team_id=${encodeURIComponent(profileData.team_id)}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!teamRes.ok) throw new Error(`Failed to fetch team: ${teamRes.status}`);
                const teamData = await teamRes.json();
                setTeam(teamData);
            } else {
                setTeam(null);
            }
        } catch (err) {
            console.error('Error fetching profile/team:', err);
            setProfile(null);
            setTeam(null);
        } finally {
            setProfileLoading(false);
            setTeamLoading(false);
        }
    };

    // Run once when user changes
    useEffect(() => {
        refreshProfileAndTeam();
    }, [user]);
    
    const signInWithGoogle = async () => {
        const { signInWithGoogle: firebaseSignInWithGoogle } = await import('@/firebase/auth');
        await firebaseSignInWithGoogle();
        // refreshProfileAndTeam will run automatically via useEffect
    };

    const signOut = async () => {
        const { signOut: firebaseSignOut } = await import('@/firebase/auth');
        await firebaseSignOut();
        setProfile(null);
        setTeam(null);
    };

    const value: AuthContextType = {
        user,
        loading,
        signInWithGoogle,
        signOut,
        profile,
        profileLoading,
        setProfile,
        team,
        teamLoading,
        setTeam,
        refreshProfileAndTeam,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};