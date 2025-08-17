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
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [team, setTeam] = useState(null);
    const [teamLoading, setTeamLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    //to cache the user profile data (fetches the data only once from the db when user is authenticated)
    useEffect(() => {
        if (user) {
            setProfileLoading(true);
            user.getIdToken().then((token) => {
                fetch('/api/v1/user/create', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json', 
                        Authorization: `Bearer ${token}` 
                    },
                })
                .then(() => {
                    // Then fetch the profile (user definitely exists now)
                    return fetch('/api/v1/user/profile', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                })
                .then((res) => {
                    if (!res.ok) {
                        throw new Error(`Failed to fetch profile: ${res.status}`);
                    }
                    return res.json();
                })
                .then((data) => {
                    setProfile(data);
                    setProfileLoading(false);
                    if (data.team_id !== "") {
                        setTeamLoading(true);
                        user.getIdToken().then((token) => {
                            fetch(`/api/v1/team/get?team_id=${encodeURIComponent(data.team_id)}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            })
                                .then((res) => {
                                    if (!res.ok) {
                                        throw new Error(`Failed to fetch team: ${res.status}`);
                                    }
                                    return res.json();
                                })
                                .then((teamData) => {
                                    setTeam(teamData);
                                    setTeamLoading(false);
                                })
                                .catch((error) => {
                                    console.error('Error fetching team:', error);
                                    setTeam(null);
                                    setTeamLoading(false);
                                });
                        });
                    } else {
                        setTeam(null);
                        setTeamLoading(false);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching profile:', error);
                    setProfile(null);
                    setProfileLoading(false);
                });
            });
        } else {
            setProfile(null);
            setProfileLoading(false);
        }
    }, [user]);


    const signInWithGoogle = async () => {
        const { signInWithGoogle: firebaseSignInWithGoogle } = await import('@/firebase/auth');
        await firebaseSignInWithGoogle();
        // Profile creation and fetching will be handled by the useEffect above
    };

    const signOut = async () => {
        const { signOut: firebaseSignOut } = await import('@/firebase/auth');
        await firebaseSignOut();
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
        setTeam
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};