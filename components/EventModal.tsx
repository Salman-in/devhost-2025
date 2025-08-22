import Image from "next/image";
import React from "react";
import { CardData } from "./EventCard";
import { useRouter } from "next/navigation";

interface Props {
  card: CardData;
  onClose: () => void;
}

export default function EventModal({ card, onClose }: Props) {
  const router = useRouter();

  const handleRegister = () => {
    router.push(`/events/${card.id}/register`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-background rounded-2xl shadow-xl w-full max-w-6xl relative p-8 animate-modal-open mx-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl text-white"
          aria-label="Close"
        >
          &times;
        </button>
        <div className="flex flex-col items-center">
          <div className="relative w-full h-80 mb-4">
            <Image
              src={card.imageSrc}
              alt={card.title}
              fill
              className="rounded-xl object-cover"
              sizes="100vw"
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">{card.title}</h2>
          <h3 className="text-lg text-primary mb-2">{card.caption}</h3>
          <p className="text-white/90 mb-2">{card.description}</p>
          <div className="flex flex-col items-center mb-3">
            <span className="font-semibold text-white text-sm">Organizer:</span>
            <span className="font-normal text-white/90 text-sm">{card.organizer}</span>
          </div>
          <div className="flex gap-4 w-full justify-center mt-4">
            <button
              onClick={handleRegister}
              className="bg-secondary text-white rounded-lg px-6 py-2 font-semibold hover:bg-primary-dark transition"
            >
              Register
            </button>
            <a
              href="/rulebook.pdf"
              className="bg-secondary text-white rounded-lg px-6 py-2 font-semibold hover:bg-secondary-dark transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              Rule Book
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
