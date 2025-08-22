"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface EventDetail {
  id: number;
  title: string;
  type: "team" | "individual";
  maxTeamSize?: number;
  fee: number;
}

// Events metadata
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
  const [emails, setEmails] = useState<string[]>([]); // Team member emails
  const [error, setError] = useState("");
  const [registeredUsers, setRegisteredUsers] = useState<string[]>([]); // For validation

  const event = eventData[eventId];
  const leaderEmail = user?.email?.toLowerCase() || "";

  // Initialize one input field for team events
  useEffect(() => {
    if (event?.type === "team" && emails.length === 0) {
      setEmails([""]);
    }
  }, [event, emails.length]);

  // Redirect to sign-in if no user logged in
  useEffect(() => {
    if (!user) {
      router.push("/signin");
    }
  }, [user, router]);

  // Fetch list of registered users for email validation
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/v1/users");
        if (!res.ok) throw new Error("Failed to fetch users");

        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Invalid users response");

        const usersList = data
          .map((u: any) => u.email?.toLowerCase())
          .filter(Boolean);
        setRegisteredUsers(usersList);
      } catch (err: any) {
        setError("Unable to load registered users list");
      }
    }
    if (user) fetchUsers();
  }, [user]);

  // Check if payment is pending from sessionStorage
  // If yes, redirect immediately to payment page to prevent returning to registration form
  useEffect(() => {
    if (!event || !user) return;
    const paymentPendingKey = `paymentPending_event_${event.id}_${leaderEmail}`;
    const paymentPending = sessionStorage.getItem(paymentPendingKey);

    if (paymentPending === "true") {
      router.push(
        `/payment?title=${encodeURIComponent(
          event.title
        )}&organizer=${encodeURIComponent(
          leaderEmail
        )}&eventId=${encodeURIComponent(
          event.id
        )}&userEmail=${encodeURIComponent(
          user.email || ""
        )}&members=${encodeURIComponent(emails.join(","))}&amount=${
          event.fee * 100
        }`
      );
    }
  }, [event, user, leaderEmail, emails, router]);

  // Add a new empty member email input if allowed
  const handleAddMember = () => {
    const maxMembers = (event?.maxTeamSize ?? 2) - 1;
    if (emails.length < maxMembers) {
      setEmails((prev) => [...prev, ""]);
    }
  };

  // Update email value for a member
  const handleMemberChange = (index: number, val: string) => {
    setEmails((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  // Handle form submit and validations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !event) return;

    try {
      setError("");
      setLoading(true);

      const idToken = await user.getIdToken(true);

      // Team event validation
      if (event.type === "team") {
        if (emails.some((e) => !e.trim())) {
          setError("Please enter all team members' email addresses.");
          setLoading(false);
          return;
        }

        const normalizedEmails = emails.map((e) => e.trim().toLowerCase());

        if (normalizedEmails.includes(leaderEmail)) {
          setError("Team members cannot include the leader's email.");
          setLoading(false);
          return;
        }

        const invalidEmails = normalizedEmails.filter(
          (email) => !registeredUsers.includes(email)
        );
        if (invalidEmails.length) {
          setError(
            `The following emails are not registered users: ${invalidEmails.join(
              ", "
            )}`
          );
          setLoading(false);
          return;
        }

        setEmails(normalizedEmails);
      }

      // Prepare registration payload
      const payload = {
        event_id: event.id,
        type: event.type,
        leader_email: leaderEmail,
        members: event.type === "team" ? emails : [],
      };

      // Register user with backend
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

      // Save payment pending flag in sessionStorage for this user and event
      const paymentPendingKey = `paymentPending_event_${event.id}_${leaderEmail}`;
      sessionStorage.setItem(paymentPendingKey, "true");

      // Redirect to payment page with all needed params
      router.push(
        `/payment?title=${encodeURIComponent(
          event.title
        )}&organizer=${encodeURIComponent(
          leaderEmail
        )}&eventId=${encodeURIComponent(
          event.id
        )}&userEmail=${encodeURIComponent(
          user.email || ""
        )}&members=${encodeURIComponent(emails.join(","))}&amount=${
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

  const maxMembers = (event?.maxTeamSize ?? 2) - 1;

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="bg-white shadow rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center text-black">
          {event.title} Registration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {event.type === "team" && (
            <>
              <Label className="block mb-2 text-black">
                Enter Team Members’ Email:
              </Label>

              {emails.map((email, idx) => (
                <input
                  key={idx}
                  type="email"
                  value={email}
                  placeholder={`Member ${idx + 1} email`}
                  onChange={(e) => handleMemberChange(idx, e.target.value)}
                  className="w-full border rounded p-2 text-black"
                  required
                  autoComplete="email"
                />
              ))}

              {emails.length < maxMembers && (
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
              You are registering as an <strong>individual participant</strong>.{" "}
              <br />
              Registered email: <strong>{leaderEmail}</strong>
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
