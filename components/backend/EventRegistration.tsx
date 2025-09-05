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
import { events, groupEventMaxMembers } from "@/assets/data/events";
import { Button } from "../ui/button";
import LoadingSpinner from "../LoadingSpinner";
import PaymentButton from "@/components/backend/PaymentButton";

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
  const [showPaymentValidation, setShowPaymentValidation] = useState(false);

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

  type RazorpayResponse = {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  };

  const event = events.find((event) => event.id === parseInt(eventId));
  const eventPrice = 5000;
  const maxMembers = groupEventMaxMembers[parseInt(eventId)] ?? 1;
  const membersCount = team?.members.length ?? 0;
  const canPay =
    team &&
    team.leaderEmail === userEmail &&
    !team.paymentDone &&
    membersCount === maxMembers;

  const handlePaymentSuccess = async (response: RazorpayResponse) => {
    if (!team) return;
    await handleApiAction(
      `/api/v1/events/${eventId}/teams/${team.id}/pay`,
      {
        method: "POST",
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      },
      (data) => {
        if (data.team) {
          setTeam(data.team);
        } else {
          setTeam((prev) =>
            prev ? { ...prev, paymentDone: true, registered: true } : prev,
          );
        }
      },
    );
    setShowPaymentValidation(false);
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
    return <LoadingSpinner />;
  }

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
          {!userEmail && (
            <p className="text-center text-sm text-gray-300">
              Please log in to continue.
            </p>
          )}
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
                  <Button
                    onClick={handleCreateTeam}
                    disabled={actionLoading}
                    className="h-fit w-full cursor-pointer rounded-none px-4 py-2 text-xs font-bold tracking-widest text-black uppercase"
                  >
                    Create Team
                  </Button>
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
                    <Button
                      onClick={handleJoinTeam}
                      disabled={actionLoading}
                      className="h-fit w-full cursor-pointer rounded-none px-4 py-2 text-xs font-bold tracking-widest text-black uppercase"
                    >
                      Join
                    </Button>
                  </ClippedCard>
                </div>
              </div>
            </div>
          )}
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
                              <button
                                onClick={() => handleRemoveMember(m)}
                                disabled={actionLoading}
                                className="px-3 py-1 text-xs font-bold text-white"
                              >
                                Remove
                              </button>
                            </ClippedCard>
                          )}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-white">
                    {`(Members: ${team.members.length} / ${maxMembers})`}
                  </p>
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
                  <>
                    <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                      <ClippedCard
                        innerBg="bg-primary"
                        className="flex-1 hover:brightness-95"
                      >
                        {canPay ? (
                          <PaymentButton
                            amount={eventPrice}
                            disabled={actionLoading}
                            onPaymentSuccess={handlePaymentSuccess}
                            eventName={event?.title ?? "Event"}
                          />
                        ) : (
                          <Button
                            onClick={() => setShowPaymentValidation(true)}
                            disabled={actionLoading}
                            className="h-fit w-full cursor-pointer rounded-none px-4 py-2 text-xs font-bold tracking-widest text-black uppercase"
                          >
                            Pay Now
                          </Button>
                        )}
                      </ClippedCard>
                      <ClippedCard
                        innerBg="bg-black"
                        className="flex-1 hover:brightness-95"
                      >
                        <Button
                          onClick={handleDisband}
                          disabled={actionLoading}
                          className="h-fit w-full cursor-pointer rounded-none bg-black px-4 py-2 text-xs font-bold tracking-widest text-white uppercase hover:bg-black"
                        >
                          Disband Team
                        </Button>
                      </ClippedCard>
                    </div>
                    {showPaymentValidation && (
                      <div className="mt-2 text-center font-bold text-red-500">
                        {`Add ${maxMembers - membersCount} more member(s) to proceed to payment.`}
                      </div>
                    )}
                  </>
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
