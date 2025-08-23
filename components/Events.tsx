"use client";

import React, { useState } from "react";
import EventCardGrid from "./EventCard";
import EventModal from "./EventModal";
import { EventDetail } from "../lib/events";
import { allEvents } from "../lib/events";

export default function Events() {
  const [selectedCard, setSelectedCard] = useState<EventDetail | null>(null);

  // Filter the events to display on this page
  const devHostEvents = allEvents.filter((card) => card.id <= 9);

  return (
    <div className="flex justify-center pb-10 items-center w-full">
      <div className="max-w-6xl mx-auto mb-20 w-full px-4">
        <h2 className="select-none text-center text-3xl md:text-4xl font-semibold md:pb-16 pb-10">
          DevHost Events
        </h2>
        <EventCardGrid
          cards={devHostEvents}
          onCardClick={(id: number) => {
            const card = devHostEvents.find((card) => card.id === id) || null;
            setSelectedCard(card);
          }}
        />
      </div>
      {selectedCard && (
        <EventModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
}