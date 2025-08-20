"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EventDetail {
  id: number;
  title: string;
  type: "team" | "individual";
  maxTeamSize?: number;
  fee: number;
}

const eventData: Record<string, EventDetail> = {
  "1": { id: 1, title: "CSS Action", type: "individual", fee: 0 },
  "2": { id: 2, title: "Code Forge", type: "individual", fee: 0 },
  "3": { id: 3, title: "Bit Breaker", type: "team", maxTeamSize: 2, fee: 0 },
  "5": { id: 5, title: "PitchX", type: "team", maxTeamSize: 3, fee: 0 },
  "6": { id: 6, title: "BGMI", type: "team", maxTeamSize: 4, fee: 100 },
  "9": { id: 9, title: "The Surge", type: "team", maxTeamSize: 5, fee: 100 },
  "7": { id: 7, title: "Speed Cuber", type: "individual", fee: 50 },
  "8": { id: 8, title: "Blazzing Fingers", type: "individual", fee: 50 },
};

export default function EventRegisterPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [leaderEmail, setLeaderEmail] = useState(user?.email || "");
  const [emails, setEmails] = useState<string[]>([]);
  const [error, setError] = useState("");

  const event = eventData[eventId];

  useEffect(() => {
    if (!event) {
      router.push("/events");
      return;
    }
    if (event.type === "team") {
      setEmails([]);
      if (user?.email) setLeaderEmail(user.email);
    }
  }, [event, router, user]);

  const handleLeaderEmailChange = (val: string) => setLeaderEmail(val);

  const handleTeamEmailChange = (index: number, val: string) => {
    const newEmails = [...emails];
    newEmails[index] = val;
    setEmails(newEmails);
  };

  const handleAddMember = () => {
    if (emails.length < (event?.maxTeamSize || 2)) {
      setEmails([...emails, ""]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !event) return;

    if (leaderEmail.trim().toLowerCase() !== user.email?.toLowerCase()) {
      setError(
        "You must be logged in with the team leader’s email to register."
      );
      return;
    }

    if (event.type === "team" && emails.some((e) => !e.trim())) {
      setError("Please fill all team members' email addresses.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      const idToken = await user.getIdToken(true);

      const payload = {
        event_id: event.id,
        type: event.type,
        leader_email: leaderEmail.trim().toLowerCase(),
        members:
          event.type === "team"
            ? emails.map((e) => e.trim().toLowerCase())
            : [],
      };

      const res = await fetch("/api/v1/event/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Event registration failed");
      }

      // Redirect automatically to payment page with event details and amounts
      router.push(
        `/payment?title=${encodeURIComponent(
          event.title
        )}&organizer=${encodeURIComponent(
          leaderEmail
        )}&eventId=${encodeURIComponent(
          event.id
        )}&userEmail=${encodeURIComponent(user.email || "")}&amount=${
          event.fee * 100
        }`
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="bg-white shadow rounded-lg p-8 max-w-md w-full">
        <h2
          className="text-2xl font-bold mb-4 text-center"
          style={{ color: "black" }}
        >
          {event.title} Registration
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {event.type === "team" && (
            <>
              <Label className="block mb-2" style={{ color: "black" }}>
                Team Leader Email
              </Label>
              <Input
                type="email"
                value={leaderEmail}
                onChange={(e) => handleLeaderEmailChange(e.target.value)}
                placeholder="Enter team leader email"
                className="mb-4"
                required
                style={{ color: "black" }}
              />

              <Label className="block mb-2" style={{ color: "black" }}>
                Team Members' Emails
              </Label>
              {emails.map((email, idx) => (
                <Input
                  key={idx}
                  type="email"
                  value={email}
                  onChange={(e) => handleTeamEmailChange(idx, e.target.value)}
                  placeholder="Enter member email"
                  className="mb-2"
                  required
                  style={{ color: "black" }}
                />
              ))}
              {emails.length < (event.maxTeamSize || 2) && (
                <Button
                  type="button"
                  className="w-full bg-gray-200 text-black hover:bg-gray-300"
                  onClick={handleAddMember}
                >
                  + Add Member
                </Button>
              )}
            </>
          )}

          {event.type === "individual" && (
            <p className="text-sm text-gray-600 mb-2">
              You are registering as an <strong>individual participant</strong>.
              After registration you will be redirected to payment page.
            </p>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
      </div>
    </div>
  );
}
