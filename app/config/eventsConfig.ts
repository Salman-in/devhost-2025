import { events } from "@/app/data/eventsData";

export const individualEventIds = [6, 7, 8];
export const groupEventIds = [1, 2, 3, 4, 5];

// Add maxMembers per group event dynamically
export const groupEvents = events
  .filter((e) => groupEventIds.includes(e.id))
  .map((e) => {
    // define max team size per event id as you like
    let maxMembers = 3;
    if (e.id === 1) maxMembers = 4;
    if (e.id === 4) maxMembers = 2;
    return { ...e, maxMembers };
  });

export const individualEvents = events.filter((e) => individualEventIds.includes(e.id));