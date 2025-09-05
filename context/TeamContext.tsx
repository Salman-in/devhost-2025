"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

// Define the Team interface
export interface Team {
  team_id: string;
  team_name: string;
  team_leader: string;
  team_leader_email: string;
  members: Array<{ name: string; email: string; role: string }>;
  drive_link?: string;
  finalized: boolean;
  createdAt: string | Date;
}

// Define the context shape
interface TeamContextType {
  team: Team | null;
  loading: boolean;
  error: Error | null;
  hasTeam: boolean;
  refreshTeam: () => void;
  setTeam: (team: Team | null) => void;
}

// Create the context
const TeamContext = createContext<TeamContextType | null>(null);

// Custom hook to use the team context
export const useTeam = () => {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeam must be used within TeamProvider");
  return ctx;
};

// Fetch team data from API
async function fetchTeamData(token: string) {
  const response = await fetch("/api/v1/team/get", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null; // No team found is a valid state
    }
    throw new Error("Failed to fetch team data");
  }

  return response.json();
}

// Provider component
export const TeamProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch team data when auth state changes
  const refreshTeam = useCallback(async () => {
    if (!user) {
      setTeam(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const teamData = await fetchTeamData(token);
      setTeam(teamData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      console.error("Error fetching team data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch and setup
  useEffect(() => {
    if (!authLoading) {
      refreshTeam();
    }
  }, [user, authLoading, refreshTeam]);

  // Compute hasTeam
  const hasTeam = Boolean(team);

  return (
    <TeamContext.Provider
      value={{
        team,
        loading,
        error,
        hasTeam,
        refreshTeam,
        setTeam,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};
