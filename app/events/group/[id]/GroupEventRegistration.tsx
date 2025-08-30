"use client";

import React, { useState } from "react";
import PaymentButton from "@/components/PaymentButton";
import { addTeamMembers, checkRegisteredEmails } from "@/app/events/group/[id]/actions";
import { useRouter } from "next/navigation";

interface Props {
  event: {
    id: string | number;
    title: string;
    description: string;
    price: number;
  };
  leader: string;
  maxMembers: number;
  alreadyRegistered: boolean;
}

export default function GroupEventRegistration({
  event,
  leader,
  maxMembers,
  alreadyRegistered,
}: Props) {
  const router = useRouter();
  // Only allow to add maxMembers - 1 additional emails besides leader
  const [memberEmails, setMemberEmails] = useState<string[]>([""]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // can proceed to payment if leader + memberEmails length matches maxMembers
  const canProceedToPayment =
    memberEmails.length === maxMembers - 1 &&
    memberEmails.every((e) => e.trim().length > 0);

  const addMemberField = () => {
    if (memberEmails.length < maxMembers - 1) {
      setMemberEmails([...memberEmails, ""]);
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  };

  const updateEmail = (idx: number, val: string) => {
    const newEmails = [...memberEmails];
    newEmails[idx] = val;
    setMemberEmails(newEmails);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const emails: string[] = [];
    // Collect member emails (excluding leader)
    for (const key of formData.keys()) {
      if (key.startsWith("email-")) {
        const email = formData.get(key);
        if (typeof email === "string" && email.trim()) {
          emails.push(email.trim());
        }
      }
    }

    if (emails.length !== maxMembers - 1) {
      setErrorMessage(`Please add exactly ${maxMembers - 1} valid member emails.`);
      setLoading(false);
      return;
    }

    // Combine leader email with entered member emails
    const fullTeam = [leader, ...emails];

    // Check duplicates including leader
    if (new Set(fullTeam).size !== fullTeam.length) {
      setErrorMessage("Duplicate emails are not allowed, including the leader's email.");
      setLoading(false);
      return;
    }

    // Check all emails are registered (including leader)
    const unregistered = await checkRegisteredEmails(fullTeam);
    if (unregistered.length > 0) {
      setErrorMessage(`These emails are not registered: ${unregistered.join(", ")}`);
      setLoading(false);
      return;
    }

    try {
      // Save team members including leader
      await addTeamMembers(leader, Number(event.id), fullTeam);
      setSuccessMessage("Team members confirmed! You can now proceed to payment.");
    } catch (e) {
      setErrorMessage("Failed to save team members. Please try again.");
    }
    setLoading(false);
  }

  if (alreadyRegistered) {
    return (
      <div className="max-w-xl mx-auto py-10 text-center">
        <h2 className="text-xl font-bold text-red-600">
          You have already registered for this event.
        </h2>
        <p>Please contact support if you want to make changes.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 py-10">
      <h1 className="text-3xl font-bold">{event.title}</h1>
      <p>{event.description}</p>
      <p className="text-sm text-gray-500">
        Team Leader: <strong>{leader}</strong>
      </p>
      <p className="text-sm text-gray-600">
        Members Added: {memberEmails.length + 1} / {maxMembers}
      </p>

      {errorMessage && <p className="font-bold text-red-600">{errorMessage}</p>}
      {successMessage && <p className="font-bold text-green-600">{successMessage}</p>}

      <form action={onSubmit}>
        {memberEmails.map((email, idx) => (
          <input
            key={idx}
            name={`email-${idx}`}
            type="email"
            placeholder="Member email"
            value={email}
            onChange={(e) => updateEmail(idx, e.target.value)}
            required
            className="mb-2 w-full rounded border p-2"
          />
        ))}

        {memberEmails.length < maxMembers - 1 && (
          <button
            type="button"
            onClick={addMemberField}
            disabled={loading}
            className="mr-2 rounded bg-blue-500 px-4 py-2 text-white"
          >
            Add Member
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded bg-yellow-500 px-6 py-2 font-bold text-black"
        >
          {loading ? "Saving..." : "Confirm Team Members"}
        </button>
      </form>

      {successMessage && canProceedToPayment && (
        <div className="mt-6">
          <PaymentButton
            amount={event.price * 100}
            leader={leader}
            eventId={event.id}
            onSuccess={(paymentId) =>
              router.push(`/events/group/${event.id}/payment-success?paymentId=${paymentId}`)
            }
          />
        </div>
      )}
    </div>
  );
}
