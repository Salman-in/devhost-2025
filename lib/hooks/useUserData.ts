import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';

interface UserProfile {
    uid: string;
    name: string;
    email: string;
    team_id?: string;
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
    peers: Array<{ id: string; name: string; email: string }>;
    drive_link?: string;
    finalized: boolean;
    created_at: string | Date;
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

export function useTeamData(teamId?: string) {
    const { user } = useAuth();
    
    const { data: team, error, isLoading, mutate } = useSWR(
        user && teamId ? [`/api/v1/team/get?team_id=${teamId}`, user] : null,
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
    const { team, teamLoading, teamError, refreshTeam } = useTeamData(profile?.team_id);
    
    const refreshAll = () => {
        refreshProfile();
        refreshTeam();
    };
    
    return {
        profile,
        profileLoading,
        profileError,
        team,
        teamLoading,
        teamError,
        refreshAll,
        hasTeam: Boolean(profile?.team_id),
        isLoading: profileLoading || (profile?.team_id && teamLoading)
    };
}
