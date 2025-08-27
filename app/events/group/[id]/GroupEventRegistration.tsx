"use client";

import React, { useState } from "react";
import { addAndSendInvites, registerAction } from "./actions";

interface Invite {
  email: string;
  accepted: boolean;
}

interface Props {
  event: any;
  leader: string;
  invites: Invite[];
  maxMembers: number;
  acceptedCount: number;
}

export default function GroupEventRegistration({
  event,
  leader,
  invites,
  maxMembers,
  acceptedCount,
}: Props) {
  const [memberEmails, setMemberEmails] = useState<string[]>(
    invites.length ? invites.map((i) => i.email) : [""]
  );

  const inviteSent = invites.length > 0;
  const canRegister = invites.length > 0 && acceptedCount === invites.length;

  const addMemberField = () => {
    if (memberEmails.length < maxMembers) {
      setMemberEmails([...memberEmails, ""]);
    }
  };

  const updateEmail = (idx: number, val: string) => {
    const newEmails = [...memberEmails];
    newEmails[idx] = val;
    setMemberEmails(newEmails);
  };

  return (
    <div className="max-w-xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">{event.title}</h1>
      <p>{event.description}</p>
      <p className="text-sm text-gray-500">
        Team Leader: <strong>{leader}</strong>
      </p>
      <p className="text-sm text-gray-600">
        Members Added: {invites.length} / {maxMembers} | Accepted: {acceptedCount}
      </p>

      <form
        action={async (formData: FormData) => {
          const emails: string[] = [];
          for (const key of formData.keys()) {
            if (key.startsWith("email-")) {
              const email = formData.get(key);
              if (typeof email === "string" && email.trim()) emails.push(email.trim());
            }
          }
          await addAndSendInvites(leader, event.id, emails);
        }}
      >
        <h2 className="font-semibold mb-2">Add Team Members</h2>

        {memberEmails.map((email, idx) => (
          <input
            key={idx}
            name={`email-${idx}`}
            type="email"
            placeholder="Member email"
            value={email}
            onChange={(e) => updateEmail(idx, e.target.value)}
            disabled={inviteSent}
            required
            className="w-full mb-2 border p-2 rounded"
          />
        ))}

        {!inviteSent && memberEmails.length < maxMembers && (
          <button
            type="button"
            onClick={addMemberField}
            className="bg-blue-500 text-white px-4 py-2 mr-2 rounded"
          >
            Add Member
          </button>
        )}

        {!inviteSent && (
          <button type="submit" className="bg-yellow-500 text-black px-6 py-2 font-bold rounded mt-2">
            Send Invite
          </button>
        )}
      </form>

      <form
        action={async () => {
          await registerAction(canRegister, event.id, leader);
        }}
      >
        <button
          type="submit"
          disabled={!canRegister}
          className={`mt-6 w-full py-2 font-bold rounded ${
            canRegister ? "bg-green-500" : "bg-gray-400 cursor-not-allowed"
          } text-black`}
        >
          Register &amp; Pay
        </button>
      </form>
    </div>
  );
}
