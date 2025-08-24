import Image from "next/image";
import React from "react";
import { CardData } from "./EventCard";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface Props {
  card: CardData;
  open: boolean;    
  onClose: () => void;
}

export default function EventModal({ card, open, onClose }: Props) {
  const router = useRouter();

  const handleRegister = () => {
    router.push(`/events/${card.id}/register`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-6xl p-0 bg-background shadow-xl rounded-2xl animate-modal-open">
        <DialogClose
          asChild
        >
          <button
            className="absolute top-4 right-4 text-xl text-white z-10"
            aria-label="Close"
            type="button"
          >
            &times;
          </button>
        </DialogClose>

        <div className="flex flex-col items-center relative p-8">
          <div className="relative w-full h-80 mb-4">
            <Image
              src={card.imageSrc}
              alt={card.title}
              fill
              className="rounded-xl object-cover"
              sizes="100vw"
            />
          </div>
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-white mb-2">
              {card.title}
            </DialogTitle>
            <h3 className="text-lg text-primary mb-2">{card.caption}</h3>
            <DialogDescription className="text-white/90 mb-2">
              {card.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center mb-3">
            <span className="font-semibold text-white text-sm">Organizer:</span>
            <span className="font-normal text-white/90 text-sm">{card.organizer}</span>
          </div>
          <div className="flex gap-4 w-full justify-center mt-4">
            <button
              onClick={handleRegister}
              className="bg-secondary text-white rounded-lg px-6 py-2 font-semibold hover:bg-primary-dark transition"
              type="button"
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
      </DialogContent>
    </Dialog>
  );
}
