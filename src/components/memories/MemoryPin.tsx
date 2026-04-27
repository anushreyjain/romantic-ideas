import { Heart } from "lucide-react";
import type { Memory } from "@/data/memories";

type MemoryPinProps = {
  memory: Memory;
  isSelected: boolean;
  isVibrating: boolean;
  onClick: (memory: Memory) => void;
};

export function MemoryPin({
  memory,
  isSelected,
  isVibrating,
  onClick,
}: MemoryPinProps) {
  return (
    <button
      type="button"
      aria-label={`Open memory: ${memory.title}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(memory);
      }}
      className={`group relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-200 ${
        isVibrating ? "animate-[memory-pin-vibrate_0.8s_ease-in-out_2]" : ""
      }`}
    >
      {/* Outer ring — pulses when selected */}
      <span
        className={`absolute rounded-full transition-all duration-300 ${
          isSelected
            ? "h-14 w-14 border border-[var(--pin)]/60 bg-[var(--pin)]/10 animate-ping"
            : "h-12 w-12 border border-[var(--pin)]/40 bg-transparent opacity-0 group-hover:opacity-100"
        }`}
      />

      {/* Core */}
      <span
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-lg transition-all duration-200 ${
          isSelected
            ? "scale-110 border-[var(--heading)]/30 bg-[var(--pin)] shadow-[var(--pin)]/40"
            : "border-[var(--bg)]/60 bg-[var(--pin)] shadow-[var(--pin)]/25 group-hover:scale-110 group-hover:opacity-85"
        }`}
      >
        <Heart className="h-5 w-5 fill-[var(--surface)] text-[var(--surface)]" />
      </span>

      {/* Tooltip */}
      <span className="pointer-events-none absolute left-1/2 top-[calc(100%+0.6rem)] -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--heading)] opacity-0 shadow-lg ring-1 ring-[var(--border)] transition-opacity group-hover:opacity-100">
        {memory.title}
      </span>
    </button>
  );
}
