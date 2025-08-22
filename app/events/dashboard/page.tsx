'use client';

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface EventRegistration {
  event_id: number;
  type: "individual" | "team";
  leader_email: string;
  participants: string[];
  createdAt: string;
  paymentStatus?: string;
  paymentDetails?: { transactionId?: string };
}

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

export default function EventsDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRegistrations() {
      if (!user) {
        setRegistrations([]);
        setLoading(false);
        return;
      }
      try {
        setError("");
        setLoading(true);
        const token = await user.getIdToken(true);
        const res = await fetch("/api/v1/event/my-registrations", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch registrations");
        const data = await res.json();

        // Filter registrations to only include those with paymentStatus === "paid"
        const paidRegistrations = (data.registrations || []).filter(
          (reg: EventRegistration) => reg.paymentStatus === "Paid"
        );

        setRegistrations(paidRegistrations);
      } catch (e: any) {
        setError(e.message || "Error loading registrations");
      } finally {
        setLoading(false);
      }
    }

    fetchRegistrations();
  }, [user]);

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

        {error && (
          <div className="text-red-500 text-sm mb-4" role="alert">
            {error}
          </div>
        )}

        {!registrations.length && (
          <div className="text-gray-700">You have not registered for any events yet.</div>
        )}

        <div className="flex flex-col gap-6">
          {registrations.map((reg) => {
            const eventInfo = eventData[reg.event_id];
            const isTeam = eventInfo?.type === "team";

            return (
              <div
                key={reg.event_id + "-" + reg.createdAt}
                className="bg-white shadow rounded-lg p-5 flex flex-col gap-2"
                aria-label={`Event registration: ${eventInfo?.title ?? `Event #${reg.event_id}`}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold" style={{ color: "black" }}>
                      {eventInfo?.title ?? `Event #${reg.event_id}`}
                    </h2>
                    <p className="text-sm text-gray-500">{isTeam ? "Team event" : "Individual event"}</p>
                  </div>
                </div>

                <div className="text-sm mt-2 font-medium" style={{ color: "black" }}>
                  {isTeam ? (
                    <>
                      <span className="text-yellow-700">Team Leader:</span>
                      <p>{reg.leader_email}</p>
                      <br />
                      <span className="text-blue-700">Team Members:</span>
                      <ul className="ml-4 list-disc">
                        {reg.participants.map((member, idx) => (
                          <li key={`${member}-${idx}`}>{member}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <>
                      <p>Registered as: <strong>{reg.leader_email}</strong></p>
                    </>
                  )}
                </div>

                <div className="text-xs text-gray-400 mt-2">
                  Registered {new Date(reg.createdAt).toLocaleString()}
                </div>

                <div className="text-xs text-gray-400 mt-2">
                  Payment Status: <strong>{reg.paymentStatus ?? "Pending"}</strong>
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
