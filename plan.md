# Memories Map App Plan

## Goal

Build a private web app for a romantic memories map. Each place where you both met is shown as a pin on an interactive map. Clicking a pin opens a story modal with an optional image. A sidebar lists all memories, and clicking any sidebar event smoothly zooms the map to that location.

## Recommended App Type

Start with a web app.

This is the smoothest first version because it can be shared as a private link, opened on phone or laptop, and built using the existing Next.js + React setup in this repo.

## Recommended Tech Stack

- Framework: Next.js + React + TypeScript
- Styling: Tailwind CSS
- Map/search provider: Mappls / MapmyIndia Web SDK
- Place search: Mappls Autosuggest and Place Details
- Icons: `lucide-react`
- Modal UI: existing UI components, `@base-ui/react`, or shadcn-style dialog components
- Data source: Supabase, with local fallback when Supabase is not configured

## Why Use Mappls

Mappls is the best default for this app because memories will be added only from India and the main requirement is exact place discovery for cafes, restaurants, parks, malls, buildings, and small local places.

Using Mappls for both the map and search keeps place IDs, Indian address data, map display, and exact pin placement in one provider ecosystem.

## Main Features

- Full-screen interactive map.
- Custom romantic pins for each memory.
- Zoom in and zoom out controls.
- Clickable pins.
- Story modal for each pin.
- Optional image inside each memory modal.
- Sidebar with all events listed in date order.
- Clicking a sidebar event selects the pin and zooms the map to that location.
- “Show all memories” action to zoom out and fit every pin on the map.
- Mobile-friendly layout with a bottom drawer instead of a fixed sidebar.

## User Flow

1. User opens the memories map page.
2. Map loads with all memory pins visible.
3. User can zoom, drag, and explore the map.
4. User clicks a pin.
5. A modal opens with the memory title, date, place, story, and optional image.
6. User can also click a memory from the sidebar.
7. Map smoothly flies to that memory location and opens the modal.

## Suggested File Structure

```txt
src/app/memories-map/page.tsx
src/components/memories/MemoryMap.tsx
src/components/memories/MemoryPin.tsxwhy
src/components/memories/MemorySidebar.tsx
src/components/memories/MemoryModal.tsx
src/data/memories.ts
public/memories/
```

## Memory Data Model

```ts
export type Memory = {
  id: string;
  title: string;
  date: string;
  locationName: string;
  mapplsPin?: string;
  eLoc?: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
  story: string;
  image?: string;
};
```

## Example Memory Data

```ts
export const memories: Memory[] = [
  {
    id: "first-meeting",
    title: "The First Time We Met",
    date: "2024-02-14",
    locationName: "Cafe Name, City",
    coordinates: {
      longitude: 77.209,
      latitude: 28.6139,
    },
    story: "This was the day everything started.",
    image: "/memories/first-meeting.jpg",
  },
];
```

## Map Interaction Plan

- Render the map inside a client component because the Mappls Web SDK needs browser APIs.
- Render each memory as a Mappls marker with custom HTML pin UI.
- Use custom marker UI for the pin, such as a heart, photo circle, or glowing dot.
- Store the selected memory in React state.
- When a pin is clicked, set the selected memory and open the modal.
- When a sidebar item is clicked, set the selected memory and call `flyTo`.
- Use `fitBounds` to show all memories at once.

## Camera Behavior

When a memory is selected from the sidebar:

```ts
map.flyTo({
  center: [memory.coordinates.longitude, memory.coordinates.latitude],
  zoom: 14,
  speed: 1.2,
});
```

For showing all memories:

```ts
map.fitBounds(bounds, {
  padding: 80,
  duration: 1200,
});
```

## Desktop Layout

- Left sidebar: memory list.
- Right side: full map.
- Modal appears centered or as a floating card over the map.
- Selected sidebar item should be highlighted.

## Mobile Layout

- Map takes the full screen.
- Memory list becomes a bottom drawer or sheet.
- Modal opens as a bottom sheet or centered card.
- Pins should be large enough to tap comfortably.

## Package Recommendation

Required Mappls credentials:

```env
NEXT_PUBLIC_MAPPLS_MAP_KEY=your-mappls-static-web-key
```

The same Mappls static key is used for the Web Maps SDK and the allocated Mappls APIs for this app. Separate OAuth credentials are optional only if Mappls provides them later.

Optional packages:

```bash
npm install framer-motion
```

Only add `framer-motion` if richer modal/sidebar animation is needed. Tailwind transitions are enough for version 1.

## Build Phases

### Phase 1: Basic Map

- Create the `/memories-map` page.
- Add Mappls map.
- Add sample memory data.
- Show all pins.

### Phase 2: Pin And Modal

- Add custom pin component.
- Open modal when a pin is clicked.
- Show title, date, location, story, and optional image.

### Phase 3: Sidebar

- Add sidebar event list.
- Highlight selected memory.
- Click event to zoom map to location.

### Phase 4: Polish

- Add mobile drawer layout.
- Add “show all memories” button.
- Improve pin styling.
- Add soft animations.
- Add private route/password protection if needed.

## Future Ideas

- Password-protected page.
- Timeline view by year or month.
- Multiple photos per memory.
- Anniversary mode with special message.
- Music background toggle.
- “Add new memory” form.
- Sanity CMS integration so memories can be edited without touching code.

## Final Recommendation

Use Next.js with Mappls / MapmyIndia for India-only exact place search and map rendering. Save the Mappls place identifier plus user-confirmed coordinates for every memory.
