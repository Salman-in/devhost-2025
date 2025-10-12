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
import { Button } from "../ui/button";
import LoadingSpinner from "../LoadingSpinner";
import PaymentButton from "@/components/backend/PaymentButton";
import { eventDetails } from "@/assets/data/eventPayment";
import { ClippedButton } from "../ClippedButton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

type Props = { eventId: string };

type TeamType = {
  id: string;
  leaderEmail: string;
  members: string[];
  paymentDone: boolean;
  registered?: boolean;
};

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};
function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="border-primary border-2">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel
            disabled={loading}
            className="bg-red-500 text-white hover:bg-red-500/80"
            onClick={onCancel}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={onConfirm}
            className="bg-red-500 text-white hover:bg-red-500/80"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function EventRegistration({ eventId }: Props) {
  const { user, loading: userLoading } = useAuth();
  const userEmail = user?.email ?? "";
  const router = useRouter();

  // Dialog state
  const [confirmDialog, setConfirmDialog] = useState<null | {
    title: string;
    description: string;
    action: () => void;
  }>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [leaderEmail, setLeaderEmail] = useState("");
  const [team, setTeam] = useState<TeamType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

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
        type ResponseType = { team?: TeamType; error?: string };
        const data: ResponseType = await res.json();
        if (res.ok && data.team) {
          setTeam(data.team);
          setStep(2);
        }
      } catch {
        console.error("Unexpected error while fetching team");
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
        const data: T & { error?: string } = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Action failed");
          if (res.status === 401) return;
        } else {
          onSuccess(data);
        }
      } catch {
        toast.error("Unexpected error");
      } finally {
        setActionLoading(false);
      }
    },
    [getIdToken],
  );

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
    handleApiAction<{ teamId: string }>(
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

  const event = events.find((event) => event.id === parseInt(eventId, 10));
  const minMembers = eventDetails[parseInt(eventId, 10)].min;
  const maxMembers = eventDetails[parseInt(eventId, 10)].max;
  const membersCount = team?.members.length ?? 0;
  const canPay =
    team &&
    team.leaderEmail === userEmail &&
    !team.paymentDone &&
    membersCount >= minMembers;

  // Handlers using ConfirmDialog
  const handleDisband = () => {
    setConfirmDialog({
      title: "Confirm Disband",
      description:
        "Are you sure you want to disband the team? This action cannot be undone.",
      action: async () => {
        setConfirmDialog(null);
        if (!team) return;
        await handleApiAction<unknown>(
          `/api/v1/events/${eventId}/teams/${team.id}`,
          { method: "DELETE" },
          () => {
            setTeam(null);
            setStep(1);
          },
        );
      },
    });
  };

  const handleRemoveMember = (memberEmail: string) => {
    setConfirmDialog({
      title: "Remove Member",
      description: `Remove ${memberEmail} from the team? This action cannot be undone.`,
      action: async () => {
        setConfirmDialog(null);
        if (!team || memberEmail === userEmail) return;
        await handleApiAction<{ members: string[] }>(
          `/api/v1/events/${eventId}/teams/${team.id}/remove`,
          {
            method: "POST",
            body: JSON.stringify({ memberEmail }),
          },
          (data) => setTeam({ ...team, members: data.members }),
        );
      },
    });
  };

  const handleLeaveTeam = () => {
    setConfirmDialog({
      title: "Leave Team",
      description:
        "Are you sure you want to leave the team? This action cannot be undone.",
      action: async () => {
        setConfirmDialog(null);
        if (!team) return;
        await handleApiAction<{ members: string[] }>(
          `/api/v1/events/${eventId}/teams/${team.id}/leave`,
          {
            method: "POST",
          },
          () => {
            window.location.reload();
          },
        );
      },
    });
  };

  if (userLoading || !initialized) {
    return (
      <div className="h-screen w-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const polygonClip =
    "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)";

  return (
    <div className="max-w-full px-2 sm:px-4">
      {confirmDialog && (
        <ConfirmDialog
          open={true}
          title={confirmDialog.title}
          description={confirmDialog.description}
          onConfirm={confirmDialog.action}
          onCancel={() => setConfirmDialog(null)}
          loading={actionLoading}
        />
      )}
      <div className="font-orbitron absolute top-4 left-4 z-20 flex gap-4 md:top-10 md:left-10">
        <ClippedButton onClick={() => router.push("/events")}>
          Back
        </ClippedButton>
      </div>
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

              <div className="border-primary/50 space-y-2 rounded-md border bg-white/5 p-4">
                {/* Members */}
                <div>
                  <p className="text-primary mb-2 text-xs font-medium sm:text-sm">
                    <b>&gt; Members:</b>
                  </p>
                  <ul className="space-y-2 pb-6">
                    {team.members.map((m) => (
                      <li
                        key={m}
                        className="flex items-center justify-between text-xs text-white sm:text-sm"
                      >
                        <span className="inline-flex items-center gap-1">
                          {team.leaderEmail === m && (
                            <span className="border-primary text-primary border px-1 text-xs font-bold">
                              L
                            </span>
                          )}
                          <span>{m}</span>
                        </span>
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
                  <div className="border-primary/50 border-t" />
                  <p className="mt-1 flex justify-around gap-8 text-xs text-white uppercase">
                    <span>{`min : ${minMembers}`}</span>
                    <span>{`max : ${maxMembers}`}</span>
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
                            disabled={actionLoading}
                            eventId={eventId}
                            teamId={team.id}
                          />
                        ) : (
                          <Button
                            onClick={() =>
                              toast.error(
                                `Add ${minMembers - membersCount} more member(s) to proceed to payment.`,
                              )
                            }
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
                  </>
                )}
                {/* Member Leave Option */}
                {team.leaderEmail !== userEmail && !team.registered && (
                  <div className="mt-4">
                    <ClippedCard className="hover:brightness-95">
                      <Button
                        onClick={handleLeaveTeam}
                        disabled={actionLoading}
                        className="h-fit w-full cursor-pointer rounded-none bg-black px-4 py-2 text-xs font-bold tracking-widest text-white uppercase hover:bg-black"
                      >
                        Leave Team
                      </Button>
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
