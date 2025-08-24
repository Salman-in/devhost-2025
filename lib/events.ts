export interface EventDetail {
  id: number;
  title: string;
  caption: string;
  description: string;
  organizer: string;
  date: string;
  time: string;
  imageSrc: string;
  type: "team" | "individual";
  maxTeamSize?: number;
  amount: number;
}


export const allEvents: EventDetail[] = [
  {
    id: 1,
    title: "CSS Action",
    caption: "Put your web design skills to the test!",
    description: "Join a dynamic web-based competition showcasing stunning UI using HTML and CSS.",
    organizer: "Koshin Hegde - 7899715941",
    date: "8th Nov",
    time: "9:00am - 10:45pm",
    imageSrc: "/events/CSS_Action.png",
    type: "individual",
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
    type: "individual",
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
    type: "team",
    maxTeamSize: 2,
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
    type: "team",
    maxTeamSize: 3,
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
    type: "team",
    maxTeamSize: 4,
    amount: 100,
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
    type: "individual",
    amount: 50,
  },
  {
    id: 8,
    title: "Blazing Fingers",
    caption: "Are you a typing speed demon?",
    description: "Compete in our typing competition for the title of fastest typist!",
    organizer: "Kshama S - 9741433993",
    date: "All Three Days",
    time: "",
    imageSrc: "/events/BlazingFingers.jpg",
    type: "individual",
    amount: 50,
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
    type: "team",
    maxTeamSize: 5,
    amount: 100,
  },
];

export const eventData: Record<string, EventDetail> = allEvents.reduce((acc, event) => {
  acc[event.id] = event;
  return acc;
}, {} as Record<string, EventDetail>);

export const eventsById: Record<number, EventDetail> = allEvents.reduce((acc, event) => {
  acc[event.id] = event;
  return acc;
}, {} as Record<number, EventDetail>);