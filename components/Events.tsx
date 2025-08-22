import React, { useState } from "react";
import EventCardGrid, { CardData } from "./EventCard";
import EventModal from "./EventModal";

const cardData: CardData[] = [
  {
    id: 1,
    title: "CSS Action",
    caption: "Put your web design skills to the test!",
    description: "Join a dynamic web-based competition showcasing stunning UI using HTML and CSS.",
    organizer: "Koshin Hegde - 7899715941",
    date: "8th Nov",
    time: "9:00am - 10:45pm",
    imageSrc: "/events/CSS_Action.png",
    amount: 0,
  },
  {
    id: 2,
    title: "Code Forge",
    caption: "Unleash Your Coding Prowess",
    description: "Take on the ultimate coding challenge against top minds in the field.",
    organizer: "Nithesh Alva - 7483775694",
    date: "8th Nov",
    time: "9:00am - 11:00am",
    imageSrc: "/events/CodeForge.png",
    amount: 0,
  },
  {
    id: 3,
    title: "Bit Breaker",
    caption: "Ready for a mind-bending challenge?",
    description: "Test your problem-solving skills and capture flags in this exciting competition.",
    organizer: "Yash Laxman - 6362072050",
    date: "8th Nov",
    time: "10:30am - 12:00pm",
    imageSrc: "/events/ctf.jpg",
    amount: 0,
  },
  {
    id: 5,
    title: "PitchX",
    caption: "Spark Innovation and Inspire Change!",
    description: "Bring your ideas to life and compete in tech & entrepreneurship challenges.",
    organizer: "Apeksha L Naik - 8904315769",
    date: "8th Nov",
    time: "10:30am - 1:30pm",
    imageSrc: "/events/PitchX.png",
    amount: 0,
  },
  {
    id: 6,
    title: "Battleground Brawl: BGMI",
    caption: "Dominate the battlefield in our tournament!",
    description: "Showcase your skills and emerge victorious in BGMI matches.",
    organizer: "Advaith S Shetty - 9902698070",
    date: "8th Nov",
    time: "2:00pm - 4:00pm",
    imageSrc: "/events/BGMI.png",
    amount: 0,
  },
  {
    id: 7,
    title: "Speed Cuber",
    caption: "Are you a Rubik's Cube prodigy?",
    description: "Race against top competitors in this exhilarating speedcubing contest.",
    organizer: "Manushree P B - 6363316781",
    date: "All Three Days",
    time: "",
    imageSrc: "/events/Speedcuber.png",
    amount: 0,
  },
  {
    id: 8,
    title: "Blazzing Fingers",
    caption: "Are you a typing speed demon?",
    description: "Compete in our typing competition for the title of fastest typist!",
    organizer: "Kshama S - 9741433993",
    date: "All Three Days",
    time: "",
    imageSrc: "/events/BlazzingFingers.jpg",
    amount: 0,
  },
  {
    id: 9,
    title: "The Surge",
    caption: "Become the ultimate agent in our competition!",
    description: "Outsmart opponents to achieve victory in thrilling Valorant matches.",
    organizer: "Megarth - 9845153931",
    date: "7th Nov",
    time: "11:00am onwards",
    imageSrc: "/events/surge.jpg",
    amount: 0,
  },
];

export default function Events() {
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const devHostEvents = cardData.filter((card) => card.id <= 9);

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
