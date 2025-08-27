"use client";

import Events from "@/components/Events";
import { useRouter } from "next/navigation";
import { individualEventIds, groupEventIds } from "@/app/config/eventsConfig";

export default function EventsPage() {
  const router = useRouter();

  const handleCardClick = (eventId: number) => {
    if (individualEventIds.includes(eventId)) {
      router.push(`/events/individual/${eventId}`);
    } else if (groupEventIds.includes(eventId)) {
      router.push(`/events/group/${eventId}`);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Events onCardClick={handleCardClick} />
    </div>
  );
}
