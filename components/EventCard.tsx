import Image from "next/image";
import React from "react";

export interface CardData {
  id: number;
  title: string;
  date: string;
  time: string;
  caption: string;
  description: string;
  organizer: string;
  imageSrc: string;
  amount: number;
}

interface Props {
  card: CardData;
  onClick: () => void;
}

export function EventCard({ card, onClick }: Props) {
  return (
    <button
      className="bg-background rounded-xl border border-white/10 group w-full transition-all duration-300 shadow-md hover:shadow-[0_0_5px_2px_rgba(180,255,57,0.4)] hover:scale-105 focus:outline-none"
      onClick={onClick}
      style={{ minHeight: 220, padding: 0,maxWidth: 320 }}
    >
      <div className="h-full p-4 flex flex-col">
        <div className="relative w-full h-0 pb-[52.25%] mb-2">
          <Image
            src={card.imageSrc}
            alt={card.title}
            fill
            className="rounded-lg object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <h2 className="text-base font-bold mb-1 text-white">{card.title}</h2>
        <p className="mb-1 font-semibold text-white/80">{card.date}</p>
        <time className="mb-2 font-normal text-white/60">{card.time}</time>
        <h3 className="mb-1 pt-1 font-semibold text-primary">{card.caption}</h3>
        <div className="text-xs tracking-wider py-1 grow">{card.description}</div>
        <div className="mt-auto">
          <span className="block font-semibold text-white text-xs">Organizer:</span>
          <span className="block font-normal text-white/90 text-sm">{card.organizer}</span>
        </div>
      </div>
    </button>
  );
}

interface GridProps {
  cards: CardData[];
  onCardClick: (id: number) => void;
}

export default function EventCardGrid({ cards, onCardClick }: GridProps) {
   return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
      style={{ justifyItems: "center" }} // Center cards inside grid cells
    >
      {cards.map((card) => (
        <EventCard key={card.id} card={card} onClick={() => onCardClick(card.id)} />
      ))}
    </div>
  );
}
