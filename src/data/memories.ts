export type Memory = {
  id: string;
  title: string;
  date: string;
  locationName: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
  mapplsPin?: string;
  eLoc?: string;
  story: string;
  image?: string;
};

export const memories: Memory[] = [
  {
    id: "first-meeting",
    title: "The First Time We Met",
    date: "2024-02-14",
    locationName: "Lodhi Garden, New Delhi",
    coordinates: {
      longitude: 77.2207,
      latitude: 28.5933,
    },
    story:
      "The city felt softer here. We walked slowly, laughed at nothing, and somehow this quiet garden became the beginning of everything.",
    image: "/memories/lodhi-garden.svg",
  },
  {
    id: "coffee-date",
    title: "Our Rainy Coffee Date",
    date: "2024-07-21",
    locationName: "Khan Market, New Delhi",
    coordinates: {
      longitude: 77.2273,
      latitude: 28.6003,
    },
    story:
      "Rain tapped against the windows while we stayed longer than planned, saving tiny stories for one more cup.",
    image: "/memories/coffee-date.svg",
  },
  {
    id: "sunset-walk",
    title: "The Sunset Walk",
    date: "2024-11-09",
    locationName: "India Gate, New Delhi",
    coordinates: {
      longitude: 77.2295,
      latitude: 28.6129,
    },
    story:
      "We watched the sky turn gold and pink, then walked home like the evening had made a promise just for us.",
    image: "/memories/sunset-walk.svg",
  },
  {
    id: "late-night-dessert",
    title: "Late Night Dessert",
    date: "2025-01-18",
    locationName: "Connaught Place, New Delhi",
    coordinates: {
      longitude: 77.2167,
      latitude: 28.6315,
    },
    story:
      "A spontaneous dessert stop turned into one of those small, perfect memories: bright lights, shared spoons, and no rush to leave.",
  },
];
