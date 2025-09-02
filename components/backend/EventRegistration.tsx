"use client";

import {
  useState,
  useEffect,
  useCallback,
  CSSProperties,
  ReactNode,
} from "react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";
import { events } from "@/assets/data/events";
import LoadingSpinner from "../LoadingSpinner";
import { ClippedButton } from "../ClippedButton";

type Props = { eventId: string };

type TeamType = {
  id: string;
  leaderEmail: string;
  members: string[];
  paymentDone: boolean;
  registered?: boolean;
};

export default function EventRegistration({ eventId }: Props) {
  const { user, loading: userLoading } = useAuth();
  const userEmail = user?.email ?? "";

  const [step, setStep] = useState<1 | 2>(1);
  const [leaderEmail, setLeaderEmail] = useState("");
  const [team, setTeam] = useState<TeamType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Utility function to get ID token
  const getIdToken = useCallback(async () => {
    if (!user) return null;
    return await user.getIdToken(true);
  }, [user]);

  useEffect(() => {
    if (userLoading) return;
    const fetchTeam = async () => {
      if (!userEmail) {
        setInitialized(true);
        return;
      }
      try {
        const idToken = await getIdToken();
        if (!idToken) return;

        const res = await fetch(`/api/v1/events/${eventId}/teams/me`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.team) {
            setTeam(data.team);
            setStep(2);
          }
        } else {
          const err = await res.json();
          alert(err.error || "Failed to fetch team");
        }
      } catch {
        alert("Unexpected error while fetching team");
      } finally {
        setInitialized(true);
      }
    };
    fetchTeam();
  }, [eventId, userEmail, userLoading, getIdToken]);

  const handleApiAction = useCallback(
    async <T,>(
      url: string,
      options: RequestInit,
      onSuccess: (data: T) => void,
    ) => {
      setActionLoading(true);
      try {
        const idToken = await getIdToken();
        if (!idToken) return;

        options.headers = {
          ...options.headers,
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        };

        const res = await fetch(url, options);
        const data: T = await res.json();

        if (!res.ok) {
          const err = (data as { error?: string }).error;
          alert(err || "Action failed");
          if (res.status === 401) return;
        } else {
          onSuccess(data);
        }
      } catch {
        alert("Unexpected error");
      } finally {
        setActionLoading(false);
      }
    },
    [getIdToken],
  );

  // Team and member related actions
  const handleCreateTeam = () =>
    handleApiAction<{ teamId: string }>(
      `/api/v1/events/${eventId}/teams/create`,
      { method: "POST" },
      (data) => {
        setTeam({
          id: data.teamId,
          leaderEmail: userEmail,
          members: [userEmail],
          paymentDone: false,
        });
        setStep(2);
      },
    );

  const handleJoinTeam = () => {
    if (!leaderEmail.trim()) return;
    handleApiAction<{ teamId: string; members: string[] }>(
      `/api/v1/events/${eventId}/teams/join`,
      { method: "POST", body: JSON.stringify({ leaderEmail }) },
      (data) => {
        setTeam({
          id: data.teamId,
          leaderEmail,
          members: data.members,
          paymentDone: false,
        });
        setStep(2);
      },
    );
  };

  const handlePayment = () => {
    if (!team) return;
    handleApiAction<{ success: boolean }>(
      `/api/v1/events/${eventId}/teams/${team.id}/pay`,
      { method: "POST" },
      () => setTeam({ ...team, paymentDone: true, registered: true }),
    );
  };

  const handleDisband = () => {
    if (!team) return;
    if (!confirm("Are you sure you want to disband the team?")) return;
    handleApiAction<{ success: boolean }>(
      `/api/v1/events/${eventId}/teams/${team.id}`,
      { method: "DELETE" },
      () => {
        setTeam(null);
        setStep(1);
      },
    );
  };

  const handleRemoveMember = (memberEmail: string) => {
    if (!team || memberEmail === userEmail) return;
    if (!confirm(`Remove ${memberEmail} from the team?`)) return;
    handleApiAction<{ members: string[] }>(
      `/api/v1/events/${eventId}/teams/${team.id}/remove`,
      {
        method: "POST",
        body: JSON.stringify({ memberEmail }),
      },
      (data) => setTeam({ ...team, members: data.members }),
    );
  };

  if (userLoading || !initialized) {
    return <LoadingSpinner />;
  }

  const event = events.find((event) => event.id === parseInt(eventId));

  const polygonClip =
    "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)";

  return (
    <div className="max-w-full px-2 sm:px-4">
      {/* Header */}
      <div className="mb-8 space-y-2 text-center">
        <h1 className="font-orbitron text-primary text-2xl font-bold tracking-wider uppercase sm:text-4xl">
          Event Registration
        </h1>
        <div className="font-orbitron flex items-center justify-center text-base text-gray-300 sm:text-lg">
          &gt; {event?.title}
        </div>
      </div>

      {/* Outer Card */}
      <div
        className="bg-primary relative mx-auto w-full max-w-lg p-[1px]"
        style={{ clipPath: polygonClip }}
      >
        <div
          className="font-orbitron flex flex-col gap-6 bg-[#101810] p-4 sm:p-6"
          style={{ clipPath: polygonClip }}
        >
          {/* If not logged in */}
          {!userEmail && (
            <p className="text-center text-sm text-gray-300">
              Please log in to continue.
            </p>
          )}

          {/* Step 1 – Create or Join */}
          {userEmail && step === 1 && (
            <div className="space-y-6">
              {/* Create Team */}
              <div>
                <h3 className="mb-3 text-xs font-semibold tracking-wide text-white uppercase sm:text-sm">
                  Create a Team
                </h3>
                <ClippedCard
                  innerBg="bg-primary"
                  className="hover:brightness-95"
                >
                  <ClippedButton
                    onClick={handleCreateTeam}
                    disabled={actionLoading}
                    className="h-fit w-full px-4 py-2 text-xs font-bold tracking-widest text-black uppercase"
                  >
                    Create Team
                  </ClippedButton>

                </ClippedCard>
              </div>

              <div className="border-primary/50 border-t" />

              {/* Join Team */}
              <div>
                <h3 className="mb-3 text-xs font-semibold tracking-wide text-white uppercase sm:text-sm">
                  Join a Team
                </h3>
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  <Input
                    placeholder="Enter Leader's Email"
                    value={leaderEmail}
                    onChange={(e) => setLeaderEmail(e.target.value)}
                    disabled={actionLoading}
                    className="flex-1 rounded border border-white/20 bg-transparent px-4 py-2 text-xs text-white placeholder:text-white/50"
                  />
                  <ClippedCard
                    innerBg="bg-primary"
                    className="hover:brightness-95"
                  >
                    <ClippedButton
                      onClick={handleJoinTeam}
                      disabled={actionLoading}
                      className="h-fit w-full px-4 py-2 text-xs font-bold tracking-widest text-black uppercase"
                    >
                      Join
                    </ClippedButton>

                  </ClippedCard>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 – Team Dashboard */}
          {userEmail && step === 2 && team && (
            <div>
              <h3 className="mb-3 text-xs font-semibold tracking-wide text-white uppercase sm:text-sm">
                Team Dashboard
              </h3>

              <div className="border-primary/50 space-y-6 rounded-md border bg-white/5 p-4">
                {/* Leader */}
                <div className="text-xs sm:text-sm">
                  <p>
                    <b>&gt; Leader:</b>
                  </p>
                  <p className="text-primary break-all">{team.leaderEmail}</p>
                </div>

                {/* Members */}
                <div>
                  <p className="mb-2 text-xs font-medium text-white sm:text-sm">
                    <b>&gt; Members:</b>
                  </p>
                  <ul className="space-y-2">
                    {team.members.map((m) => (
                      <li
                        key={m}
                        className="text-primary flex items-center justify-between text-xs sm:text-sm"
                      >
                        <span className="break-all">{m}</span>
                        {team.leaderEmail === userEmail &&
                          m !== userEmail &&
                          !team.registered && (
                            <ClippedCard
                              innerBg="bg-red-600"
                              outerBg="bg-transparent"
                            >
                              <ClippedButton
                                  onClick={() => handleRemoveMember(m)}
                                  disabled={actionLoading}
                                  innerBg="bg-red-600"
                                  textColor="text-white"
                                >
                                  Remove
                              </ClippedButton>

                            </ClippedCard>
                          )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-primary/50 border-t" />

                {/* Status + Payment */}
                <div className="flex flex-col justify-between space-y-1 text-xs font-medium text-white sm:flex-row sm:space-y-0 sm:text-sm">
                  <p>
                    <b>&gt; Status:</b>{" "}
                    <span className="text-primary">
                      {team.registered ? "Registered" : "Pending"}
                    </span>
                  </p>
                  <p>
                    <b>&gt; Payment:</b>{" "}
                    <span className="text-primary">
                      {team.paymentDone ? "Done" : "Not Done"}
                    </span>
                  </p>
                </div>

                {/* Leader Actions */}
                {team.leaderEmail === userEmail && !team.paymentDone && (
                  <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                    <ClippedCard
                      innerBg="bg-primary"
                      className="flex-1 hover:brightness-95"
                    >
                      <ClippedButton
                        onClick={handlePayment}
                        disabled={actionLoading}
                        innerBg="bg-primary"
                        textColor="text-black"
                      >
                        Pay Now
                      </ClippedButton>

                    </ClippedCard>
                    <ClippedCard
                      innerBg="bg-black"
                      className="flex-1 hover:brightness-95"
                    >
                     <ClippedButton
                      onClick={handleDisband}
                      disabled={actionLoading}
                      innerBg="bg-black"
                      textColor="text-white"
                    >
                      Disband Team
                    </ClippedButton>

                    </ClippedCard>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer text */}
      <div className="font-orbitron text-primary absolute bottom-6 left-6 hidden text-sm opacity-80 sm:hidden">
        {"// DEVHOST 2025"}
      </div>
      <div className="font-orbitron text-primary absolute right-6 bottom-6 hidden text-sm opacity-80 sm:hidden">
        {"EVENT REGISTRATION"}
      </div>
    </div>
  );
}

type ClippedCardProps = {
  className?: string;
  outerBg?: string;
  innerBg?: string;
  textColor?: string;
  width?: string;
  height?: string;
  style?: CSSProperties;
  children: ReactNode;
};

function ClippedCard({
  className = "",
  outerBg = "bg-primary",
  innerBg = "bg-black",
  textColor = "text-black",
  width = "max-w-3xl",
  height = "",
  style = {},
  children,
}: ClippedCardProps) {
  return (
    <div
      className={clsx("relative p-[1px]", outerBg, width, height, className)}
      style={{
        clipPath:
          "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
        ...style,
      }}
    >
      <div
        className={clsx(
          textColor,
          "font-orbitron flex h-auto items-center gap-2",
          innerBg,
        )}
        style={{
          clipPath:
            "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
