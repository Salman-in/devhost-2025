import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTeam } from "@/context/TeamContext";
import { toast } from "sonner";

interface LoadingStates {
  removing: boolean;
  deleting: boolean;
  leaving: boolean;
  finalizing: boolean;
}

interface SuccessStates {
  removed: boolean;
  deleted: boolean;
  left: boolean;
  finalized: boolean;
}

export function useTeamActions(refreshAll: () => void) {
  const { user } = useAuth();
  const { setTeam } = useTeam();

  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    removing: false,
    deleting: false,
    leaving: false,
    finalizing: false,
  });

  const [successStates, setSuccessStates] = useState<SuccessStates>({
    removed: false,
    deleted: false,
    left: false,
    finalized: false,
  });

  const [finalizeError, setFinalizeError] = useState<string | null>(null);

  const handleRemovePeer = async (
    teamId: string,
    memberEmail: string,
    memberName: string,
  ) => {
    if (!user) return;

    setLoadingStates((prev) => ({ ...prev, removing: true }));

    try {
      const idToken = await user.getIdToken(true);
      const res = await fetch("/api/v1/team/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          team_id: teamId,
          member_email: memberEmail,
          member_name: memberName,
        }),
      });

      if (res.ok) {
        setSuccessStates((prev) => ({ ...prev, removed: true }));
        setTimeout(() => {
          refreshAll();
        }, 800);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to remove team member");
      }
    } catch {
      toast.error("An error occurred while removing from the team");
    } finally {
      setLoadingStates((prev) => ({ ...prev, removing: false }));
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!user) return;

    setLoadingStates((prev) => ({ ...prev, deleting: true }));

    try {
      const idToken = await user.getIdToken(true);
      const res = await fetch("/api/v1/team/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ team_id: teamId }),
      });

      if (res.ok) {
        setSuccessStates((prev) => ({ ...prev, deleted: true }));
        setTeam(null); // Update team status in context
        // Redirect immediately to prevent showing loading state
        window.location.href = "/hackathon";
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to delete team");
      }
    } catch {
      toast.error("An error occurred while deleting the team");
    } finally {
      setLoadingStates((prev) => ({ ...prev, deleting: false }));
    }
  };

  const handleFinalizeTeam = async (teamId: string) => {
    if (!user) return;

    setLoadingStates((prev) => ({ ...prev, finalizing: true }));
    setFinalizeError(null);

    try {
      const idToken = await user.getIdToken(true);
      const res = await fetch("/api/v1/team/finalize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ team_id: teamId }),
      });

      if (res.ok) {
        setSuccessStates((prev) => ({ ...prev, finalized: true }));
        setFinalizeError(null);
        refreshAll();
        setTimeout(() => {
          setSuccessStates((prev) => ({ ...prev, finalized: false }));
        }, 1500);
      } else {
        const errorData = await res.json();
        setFinalizeError(errorData.error || "Failed to finalize team");
        toast.error(errorData.error || "Failed to finalize team");
      }
    } catch {
      setFinalizeError("An error occurred while finalizing the team");
      toast.error("An error occurred while finalizing the team");
    } finally {
      setLoadingStates((prev) => ({ ...prev, finalizing: false }));
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!user) return;

    setLoadingStates((prev) => ({ ...prev, leaving: true }));

    try {
      const idToken = await user.getIdToken(true);
      const res = await fetch("/api/v1/team/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ team_id: teamId }),
      });

      if (res.ok) {
        setSuccessStates((prev) => ({ ...prev, left: true }));
        // Update team status in context
        setTeam(null);
        // Redirect immediately to prevent showing loading state
        window.location.href = "/hackathon";
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to leave team");
      }
    } catch {
      toast.error("An error occurred while leaving the team");
    } finally {
      setLoadingStates((prev) => ({ ...prev, leaving: false }));
    }
  };

  return {
    loadingStates,
    successStates,
    finalizeError,
    handleRemovePeer,
    handleDeleteTeam,
    handleFinalizeTeam,
    handleLeaveTeam,
  };
}
