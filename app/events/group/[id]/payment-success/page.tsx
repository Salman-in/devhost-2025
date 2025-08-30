import { adminAuth } from "@/firebase/admin";
import { groupEvents } from "@/app/config/eventsConfig";
import { cookies } from "next/headers";
import { getTeamMembersByLeaderAndEvent, getPaymentDetailsById } from "@/app/events/group/[id]/actions";

interface Props {
  params: { id: string };
  searchParams: { paymentId?: string };
}

export default async function PaymentSuccessPage({ params, searchParams }: Props) {
  const eventId = Number(params.id);
  const event = groupEvents.find((e) => e.id === eventId);
  if (!event) {
    return (
      <div className="max-w-xl mx-auto py-10 text-center">
        <h1 className="text-xl font-bold text-red-600">Event not found.</h1>
      </div>
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("__session")?.value || "";
  let leader = "";
  if (token) {
    try {
      const decoded = await adminAuth.verifySessionCookie(token);
      leader = decoded.email || "";
    } catch {
      // do nothing, no leader set
    }
  }

  if (!leader) {
    return (
      <div className="max-w-xl mx-auto py-10 text-center">
        <h1 className="text-xl font-bold text-red-600">Sign-in required</h1>
        <p>You must sign in to view this page.</p>
      </div>
    );
  }

  const teamMembers = await getTeamMembersByLeaderAndEvent(leader, eventId);
  const paymentId = searchParams.paymentId || "";
  const paymentDetails = paymentId ? await getPaymentDetailsById(paymentId) : null;

  return (
    <div className="max-w-xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">Payment Successful!</h1>
      <h2 className="text-xl font-semibold">{event.title}</h2>
      <p>{event.description}</p>

      <section>
        <h3 className="text-lg font-semibold">Team Members</h3>
        <ul className="list-disc list-inside">
          {teamMembers.length > 0 ? (
            teamMembers.map((member) => (
              <li key={member}>
                {member}
                {member === leader ? " - Team Leader" : ""}
              </li>
            ))
          ) : (
            <li>No team members found.</li>
          )}
        </ul>
      </section>

      {paymentDetails ? (
        <section>
          <h3 className="text-lg font-semibold">Payment Details</h3>
          <p>
            <strong>Payment ID:</strong> {paymentDetails.id}
          </p>
          <p>
            <strong>Status:</strong> {paymentDetails.status}
          </p>
          <p>
            <strong>Amount Paid:</strong> ${(paymentDetails.amount / 100).toFixed(2)}
          </p>
          <p>
            <strong>Date:</strong> {new Date(paymentDetails.created * 1000).toLocaleString()}
          </p>
        </section>
      ) : (
        <p>Loading payment details...</p>
      )}
    </div>
  );
}