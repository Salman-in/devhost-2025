import React from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <Card
      onClick={onClick}
      className="cursor-pointer bg-background border border-white/10 w-full flex flex-col h-full transition-all duration-300 shadow-md hover:shadow-[0_0_8px_3px_rgba(180,255,57,0.4)] hover:scale-[1.02] focus:outline-none"
    >
      <CardHeader className="p-0">
        <div className="relative w-full aspect-video">
          <Image
            src={card.imageSrc}
            alt={card.title}
            fill
            className="rounded-t-lg object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex flex-col h-full">
        <CardTitle className="text-lg font-bold text-white mb-1">{card.title}</CardTitle>
        <CardDescription className="mb-1 font-semibold text-white/80">{card.date}</CardDescription>
        <time className="mb-2 font-normal text-white/60">{card.time}</time>
        <CardDescription className="pt-1 font-semibold text-primary">{card.caption}</CardDescription>
        <CardDescription className="text-sm tracking-wider py-1 grow text-white/80">{card.description}</CardDescription>
      </CardContent>
      <CardFooter className="mt-auto flex flex-col items-start p-4 pt-0">
        <div className="text-sm tracking-wide">
          <span className="block font-semibold text-white text-xs">Organizer:</span>
          <span className="block font-normal text-white/90 text-sm">{card.organizer}</span>
        </div>
        <div className="mt-4 w-full bg-gray-800 text-white rounded-md px-4 py-2 text-center pointer-events-none">
          View Details
        </div>
      </CardFooter>
    </Card>
  );
}

interface GridProps {
  cards: CardData[];
  onCardClick: (id: number) => void;
}

export default function EventCardGrid({ cards, onCardClick }: GridProps) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
      style={{ justifyItems: "stretch", width: "100%" }}
    >
      {cards.map((card) => (
        <div key={card.id} className="w-full">
          {/* onCardClick is now passed to the EventCard */}
          <EventCard card={card} onClick={() => onCardClick(card.id)} />
        </div>
      ))}
    </div>
  );
}