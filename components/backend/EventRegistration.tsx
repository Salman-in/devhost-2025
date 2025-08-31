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
import { LoaderCircle } from "lucide-react";

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

  // Generic api handler with alerts
  const handleApiAction = useCallback(
    async (
      url: string,
      options: RequestInit,
      onSuccess: (data: any) => void,
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
        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Action failed");
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
    handleApiAction(
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
    handleApiAction(
      `/api/v1/events/${eventId}/teams/join`,
      { method: "POST", body: JSON.stringify({ leaderEmail }) },
      (data) => {
        setTeam({
          id: data.teamId,
          leaderEmail,
          members: [leaderEmail, userEmail],
          paymentDone: false,
        });
        setStep(2);
      },
    );
  };

  const handlePayment = () => {
    if (!team) return;
    handleApiAction(
      `/api/v1/events/${eventId}/teams/${team.id}/pay`,
      { method: "POST" },
      () => setTeam({ ...team, paymentDone: true, registered: true }),
    );
  };

  const handleDisband = () => {
    if (!team) return;
    if (!confirm("Are you sure you want to disband the team?")) return;
    handleApiAction(
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
    handleApiAction(
      `/api/v1/events/${eventId}/teams/${team.id}/remove`,
      {
        method: "POST",
        body: JSON.stringify({ memberEmail }),
      },
      (data) => setTeam({ ...team, members: data.members }),
    );
  };

  if (userLoading || !initialized) {
    return (
      <div>
        <LoaderCircle className="text-primary h-12 w-12 animate-spin" />
      </div>
    );
  }

  const event = events.find((event) => event.id === parseInt(eventId));

  return (
    <div
      className="group bg-primary relative mx-auto h-fit w-full max-w-2xl p-[1px]"
      style={{
        clipPath:
          "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
      }}
    >
      <div
        className="font-orbitron flex h-full flex-col gap-2 bg-[#101810] p-4 py-6"
        style={{
          clipPath:
            "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
        }}
      >
        <p className="text-primary text-center text-3xl font-bold uppercase">
          Event Registration
        </p>
        <p className="text-center text-lg">&gt; {event?.title}</p>

        <div className="p-4">
          {!userEmail && (
            <p className="font-orbitron text-center text-black">
              Please log in to continue.
            </p>
          )}

          {userEmail && step === 1 && (
            <div className="space-y-6">
              {/* Create Team */}
              <div>
                <h3 className="mb-2 text-sm font-semibold tracking-wide text-white uppercase">
                  Create a Team
                </h3>
                <ClippedCard className="w-full" innerBg="bg-primary">
                  <button
                    className="w-full px-4 py-1 text-center text-xs font-bold tracking-widest text-black uppercase"
                    onClick={handleCreateTeam}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Creating..." : "Create Team"}
                  </button>
                </ClippedCard>
              </div>

              <div className="border-primary/50 border border-b" />

              {/* Join Team */}
              <div>
                <h3 className="mb-2 text-sm font-semibold tracking-wide text-white uppercase">
                  Join a Team
                </h3>
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Enter Leader's Email"
                    value={leaderEmail}
                    onChange={(e) => setLeaderEmail(e.target.value)}
                    disabled={actionLoading}
                    className="flex-1 rounded-md border border-black bg-white/10 px-4 py-2 text-white placeholder:text-white/50 focus:ring-2 focus:ring-black focus:outline-none"
                  />
                  <ClippedCard className="h-fit" innerBg="bg-primary">
                    <button
                      onClick={handleJoinTeam}
                      disabled={actionLoading}
                      className="px-6 py-1 text-xs font-bold tracking-widest text-black uppercase"
                    >
                      {actionLoading ? "Joining..." : "Join"}
                    </button>
                  </ClippedCard>
                </div>
              </div>
            </div>
          )}

          {userEmail && step === 2 && team && (
            <div>
              {/* Team Dashboard */}
              <div>
                <h3 className="mb-2 text-sm font-semibold tracking-wide text-white uppercase">
                  Team Dashboard
                </h3>

                <div className="border-primary/50 space-y-4 rounded-md border bg-white/5 p-4">
                  {/* Leader */}
                  <div className="text-sm">
                    <p>
                      <b>&gt; Leader:</b>
                    </p>
                    <p className="text-primary">{team.leaderEmail}</p>
                  </div>

                  {/* Members */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-white">
                      <b>&gt; Members:</b>
                    </p>
                    <ul className="space-y-2">
                      {team.members.map((m) => (
                        <li
                          key={m}
                          className="text-primary flex h-6 items-center justify-between rounded-md text-sm"
                        >
                          <p>{m}</p>
                          {team.leaderEmail === userEmail &&
                            m !== userEmail &&
                            !team.registered && (
                              <ClippedCard
                                innerBg="bg-red-600"
                                outerBg="bg-transparent"
                                className="h-fit"
                              >
                                <button
                                  className="px-4 py-1 text-xs font-bold text-white"
                                  disabled={actionLoading}
                                  onClick={() => handleRemoveMember(m)}
                                >
                                  Remove
                                </button>
                              </ClippedCard>
                            )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-primary/50 border border-b" />

                  {/* Status + Payment */}
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-white">
                      <b>&gt; Status: </b>
                      <span className="text-primary">
                        {team.registered ? "Registered" : "Pending"}
                      </span>
                    </p>
                    <p className="text-sm font-medium text-white">
                      <b>&gt; Payment: </b>
                      <span className="text-primary">
                        {team.paymentDone ? "Done" : "Not Done"}
                      </span>
                    </p>
                  </div>

                  {/* Leader Actions */}
                  {team.leaderEmail === userEmail && !team.paymentDone && (
                    <div className="flex gap-3 pt-2">
                      <ClippedCard className="flex-1" innerBg="bg-primary">
                        <button
                          onClick={handlePayment}
                          disabled={actionLoading}
                          className="w-full px-5 py-2 text-xs font-bold tracking-widest text-black uppercase"
                        >
                          {actionLoading ? "Processing..." : "Pay Now"}
                        </button>
                      </ClippedCard>
                      <ClippedCard className="flex-1" innerBg="bg-black">
                        <button
                          onClick={handleDisband}
                          disabled={actionLoading}
                          className="w-full px-5 py-2 text-xs font-bold tracking-widest text-white uppercase"
                        >
                          {actionLoading ? "Disbanding..." : "Disband Team"}
                        </button>
                      </ClippedCard>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
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
