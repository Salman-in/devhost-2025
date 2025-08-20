"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const eventData: Record<number, { title: string; type: "team" | "individual" }> = {
  1: { title: "CSS Action", type: "individual" },
  2: { title: "Code Forge", type: "individual" },
  3: { title: "Bit Breaker", type: "team" },
  5: { title: "PitchX", type: "team" },
  6: { title: "BGMI", type: "team" },
  7: { title: "Speed Cuber", type: "individual" },
  8: { title: "Blazzing Fingers", type: "individual" },
  9: { title: "The Surge", type: "team" },
};

interface EventRegistration {
  event_id: number;
  type: "individual" | "team";
  leader_email: string;
  participants: string[];
  createdAt: string;
  paymentStatus?: string;
  paymentDetails?: { transactionId?: string };
}

export default function EventsDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [leaveLoading, setLeaveLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!user) {
        setRegistrations([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        const idToken = await user.getIdToken(true);
        const res = await fetch("/api/v1/event/my-registrations", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch registrations");
        const data = await res.json();
        setRegistrations(data.registrations || []);
      } catch (err: any) {
        setError(err.message || "Error loading dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, [user]);

  const handleLeaveEvent = async (event_id: number, leader_email: string) => {
    if (!user) return;
    if (leader_email.toLowerCase() !== user.email?.toLowerCase()) {
      setError("Only the team leader can leave the event.");
      return;
    }

    setLeaveLoading(String(event_id));
    setError("");
    try {
      const idToken = await user.getIdToken(true);
      const res = await fetch("/api/v1/event/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ event_id }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to leave event");
      }
      setRegistrations(registrations.filter((reg) => reg.event_id !== event_id));
    } catch (err: any) {
      setError(err.message || "Could not leave/cancel event");
    } finally {
      setLeaveLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 flex flex-col items-center">
      <div className="max-w-2xl w-full px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Event Registrations</h1>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        {!registrations.length && (
          <div className="text-gray-700">You have not registered for any events yet.</div>
        )}
        <div className="flex flex-col gap-6">
          {registrations.map((reg) => {
            const isLeader = user?.email?.toLowerCase() === reg.leader_email.toLowerCase();

            return (
              <div key={reg.event_id} className="bg-white shadow rounded-lg p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold" style={{ color: "black" }}>
                      {eventData[reg.event_id]?.title || `Event #${reg.event_id}`}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {eventData[reg.event_id]?.type === "team" ? "Team event" : "Individual event"}
                    </p>
                  </div>
                  <Button
                    className="bg-red-500 text-white hover:bg-red-600"
                    onClick={() => handleLeaveEvent(reg.event_id, reg.leader_email)}
                    disabled={!!leaveLoading || !isLeader}
                    title={!isLeader ? "Only team leader can leave this event" : undefined}
                  >
                    {leaveLoading === String(reg.event_id) ? "Leaving..." : "Leave Event"}
                  </Button>
                </div>
                <div className="text-sm mt-2 font-medium">
                  {eventData[reg.event_id]?.type === "team" ? (
                    <>
                      <span className="text-yellow-700">Team Leader:</span>
                      <p style={{ color: "black" }}>{reg.leader_email}</p>
                      <br />
                      <span className="text-blue-700">Team Members:</span>
                      <ul className="ml-4 list-disc">
                        {reg.participants.map((member, index) => (
                          <li key={`${member}-${index}`} style={{ color: "black" }}>
                            {member}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <>
                      Registered as: <span className="text-gray-800">{reg.leader_email}</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Registered {new Date(reg.createdAt).toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Payment Status: <strong>{reg.paymentStatus || "Pending"}</strong>
                  {reg.paymentDetails?.transactionId && (
                    <>
                      <br />
                      Transaction ID: {reg.paymentDetails.transactionId}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
