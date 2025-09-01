import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

interface UserProfile {
    uid: string;
    name: string;
    email: string;
    phone?: string;
    college?: string;
    reg_no?: string;
    year?: string;
    course?: string;
}

interface Team {
    team_id: string;
    team_name: string;
    team_leader: string;
    team_leader_email: string;
    members: Array<{ name: string; email: string; role: string }>;
    drive_link?: string;
    finalized: boolean;
    createdAt: string | Date;
}

const fetcher = async (url: string, token: string) => {
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch');
    }
    
    return response.json();
};

export function useUserProfile() {
    const { user } = useAuth();
    
    const { data: profile, error, isLoading, mutate } = useSWR(
        user ? ['/api/v1/user/profile', user] : null,
        async ([url, user]) => {
            const token = await user.getIdToken();
            return fetcher(url, token);
        },
        {
            revalidateOnFocus: false,
            dedupingInterval: 5000, // Prevent duplicate requests for 5 seconds
        }
    );

    return {
        profile: profile as UserProfile | undefined,
        profileLoading: isLoading,
        profileError: error,
        refreshProfile: mutate
    };
}

export function useTeamData() {
    const { user } = useAuth();
    
    const { data: team, error, isLoading, mutate } = useSWR(
        user ? [`/api/v1/team/get`, user] : null,
        async ([url, user]) => {
            const token = await user.getIdToken();
            return fetcher(url, token);
        },
        {
            revalidateOnFocus: false,
            dedupingInterval: 5000,
        }
    );

    return {
        team: team as Team | undefined,
        teamLoading: isLoading,
        teamError: error,
        refreshTeam: mutate
    };
}

export function useUserAndTeam() {
    const { profile, profileLoading, profileError, refreshProfile } = useUserProfile();
    const { team, teamLoading, teamError, refreshTeam } = useTeamData();
    
    const refreshAll = () => {
        refreshProfile();
        refreshTeam();
    };
    
    const hasTeam = Boolean(team);
    
    // Sync team status with cookie for middleware
    useEffect(() => {
        if (!profileLoading) {
            if (hasTeam) {
                // Set cookie when user has a team
                document.cookie = 'hasTeam=true; path=/; max-age=86400'; // 24 hours
            } else {
                // Clear cookie when user has no team
                document.cookie = 'hasTeam=false; path=/; max-age=0'; // Expire immediately
            }
        }
    }, [hasTeam, profileLoading]);
    
    return {
        profile,
        profileLoading,
        profileError,
        team,
        teamLoading,
        teamError,
        refreshAll,
        hasTeam,
        isLoading: profileLoading || teamLoading
    };
}
