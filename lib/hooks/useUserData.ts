import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { useTeam } from "@/context/TeamContext";

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

const fetcher = async (url: string, token: string) => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch");
  }

  return response.json();
};

export function useUserProfile() {
  const { user } = useAuth();

  const {
    data: profile,
    error,
    isLoading,
    mutate,
  } = useSWR(
    user ? ["/api/v1/user/profile", user] : null,
    async ([url, user]) => {
      const token = await user.getIdToken();
      return fetcher(url, token);
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000, // Prevent duplicate requests for 5 seconds
    },
  );

  return {
    profile: profile as UserProfile | undefined,
    profileLoading: isLoading,
    profileError: error,
    refreshProfile: mutate,
  };
}

export function useUserAndTeam() {
  const { profile, profileLoading, profileError, refreshProfile } =
    useUserProfile();
  const {
    team,
    loading: teamLoading,
    error: teamError,
    refreshTeam,
    hasTeam,
  } = useTeam();

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
    hasTeam,
    isLoading: profileLoading || teamLoading,
  };
}
