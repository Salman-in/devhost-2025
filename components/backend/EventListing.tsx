"use client";

import React from "react";
import { ClippedButton } from "../ClippedButton";
import Image from "next/image";
import { events } from "@/assets/data/events";
import DecryptText from "../animated/TextAnimation";
import { useRouter } from "next/navigation";
import { eventDetails } from "@/assets/data/eventPayment";

export default function EventListing() {
  const router = useRouter();

  function onCardClick(eventId: number) {
    router.push(`/events/${eventId}`);
  }

  return (
    <div className="relative flex flex-col items-center overflow-hidden bg-black py-20 md:pb-[20vh]">
      {/* Static Green Background */}
      <div className="bg-primary absolute inset-0 z-0" />
      <div className="font-orbitron absolute top-4 left-4 z-20 flex gap-4 md:top-10 md:left-10">
        <ClippedButton
          innerBg="bg-black"
          outerBg="bg-black"
          textColor="text-white"
          onClick={() => router.push("/profile")}
        >
          Back
        </ClippedButton>
      </div>
      <div className="font-orbitron absolute top-6 right-6 text-sm font-bold text-black opacity-80">
        2025
      </div>

      {/* Heading */}
      <div className="relative z-10 mb-16 px-4 text-center">
        <h1 className="font-orbitron mb-6 text-center text-4xl font-bold text-black sm:text-7xl">
          DEVHOST EVENTS
        </h1>
        <div className="mt-4 px-4 text-lg sm:text-xl">
          <DecryptText
            text="> Build, Compete, and Leave Your Mark"
            startDelayMs={200}
            trailSize={6}
            flickerIntervalMs={50}
            revealDelayMs={100}
            className="font-orbitron h-8 text-base tracking-wider text-black md:text-xl"
          />
        </div>
      </div>

      {/* Event cards */}
      <div className="relative z-10 grid w-full max-w-[1200px] grid-cols-1 gap-8 px-4 lg:grid-cols-2">
        {events.map((event) => {
          const noRegister = [6, 7, 8].includes(event.id);
          return (
            <div
              key={event.id}
              className="relative mx-auto w-full overflow-hidden"
              style={{
                clipPath:
                  "polygon(20px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
              }}
            >
              <div
                className="relative z-10 m-[2px] flex h-full flex-col p-4 sm:flex-row"
                style={{
                  clipPath:
                    "polygon(20px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
                  backgroundColor: "#101810",
                }}
              >
                <div
                  className="relative aspect-square w-full overflow-hidden sm:aspect-[4/5] sm:w-1/2"
                  style={{
                    clipPath:
                      "polygon(20px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
                  }}
                >
                  <Image
                    src={event.image}
                    alt={event.title}
                    width={500}
                    height={500}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="mt-3 flex flex-1 flex-col justify-between px-2 py-4 pl-0 sm:mt-0 sm:pl-4">
                  <div>
                    <h2 className="font-orbitron mb-4 text-lg font-bold text-[#b4ff39] lg:text-xl">
                      &gt; {event.title}
                    </h2>
                    <p className="mb-1 text-sm text-white/90 italic">
                      {event.tagline}
                    </p>
                    <p className="mb-2 text-xs text-white/70 lg:text-sm">
                      {event.description}
                    </p>
                    <div className="space-y-0.5 text-xs text-white/80 lg:text-sm">
                      <p>
                        <span className="mr-1 font-semibold text-[#b4ff39]">
                          Date:
                        </span>
                        {event.date}
                      </p>
                      <p>
                        <span className="mr-1 font-semibold text-[#b4ff39]">
                          Time:
                        </span>
                        {event.time}
                      </p>
                      <p>
                        <span className="mr-1 font-semibold text-[#b4ff39]">
                          Organizer:
                        </span>
                        {event.organizer}
                      </p>
                      <p>
                        <span className="mr-1 font-semibold text-[#b4ff39]">
                          Contact:
                        </span>
                        {event.contact}
                      </p>
                      {!noRegister && (
                        <p className="flex items-baseline gap-2">
                          <span className="mr-1 font-semibold text-[#b4ff39]">
                            Amount:
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            ₹{eventDetails[event.id].amount + 50}
                          </span>
                          <span className="font-semibold text-[#b4ff39]">
                            ₹{eventDetails[event.id].amount}
                          </span>
                          / team
                        </p>
                      )}
                    </div>
                  </div>

                  {!noRegister && (
                    <div className="mt-6 flex justify-start">
                      <ClippedButton
                        innerBg="bg-primary"
                        textColor="text-black"
                        className="font-orbitron flex w-full items-center justify-center gap-2 px-6 py-2 text-center text-xs font-bold tracking-wider uppercase"
                        onClick={() => onCardClick(event.id)}
                      >
                        Register
                      </ClippedButton>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
