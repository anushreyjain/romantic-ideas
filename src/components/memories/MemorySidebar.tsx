import { Plus, RotateCcw } from "lucide-react";
import type { Memory } from "@/data/memories";
import { ThemeToggle } from "./ThemeToggle";

type MemorySidebarProps = {
  memories: Memory[];
  isLoading?: boolean;
  selectedMemoryId?: string;
  onSelectMemory: (memory: Memory) => void;
  onResetView: () => void;
  onStartAddPin: () => void;
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function MemorySidebar({
  memories,
  isLoading = false,
  selectedMemoryId,
  onSelectMemory,
  onResetView,
  onStartAddPin,
}: MemorySidebarProps) {
  return (
    <aside className="pointer-events-auto z-10 flex h-[48vh] w-full flex-col rounded-t-3xl bg-[var(--bg)] transition-all duration-300 md:h-full md:w-80 md:rounded-none md:border-r md:border-[var(--border)]">
      {/* Mobile drag handle */}
      <div className="mx-auto mt-3 mb-1 h-1 w-8 rounded-full bg-[var(--accent)]/20 md:hidden" />

      {/* Header */}
      <div className="px-6 pt-3 pb-4 md:pt-4">
        {/* Icon + Text Logo Side by Side */}
        <div className="flex items-center gap-3">
          {/* Icon Logo */}
          <div className="h-14 w-14 shrink-0">
            <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M256,368 C256,368 130,288 130,200 C130,162 158,136 194,136 C218,136 240,150 256,172 C272,150 294,136 318,136 C354,136 382,162 382,200 C382,288 256,368 256,368 Z"
                    stroke="var(--cta)" strokeWidth="11" fill="none" strokeLinejoin="round"/>
              <path d="M256,330 C256,330 166,272 166,210 C166,182 186,163 210,163 C228,163 244,173 256,191 C268,173 284,163 302,163 C326,163 346,182 346,210 C346,272 256,330 256,330 Z"
                    stroke="var(--cta)" strokeWidth="8" fill="none" strokeLinejoin="round" opacity="0.5"/>
              <path d="M256,294 C256,294 202,256 202,220 C202,202 215,190 230,190 C240,190 250,196 256,207 C262,196 272,190 282,190 C297,190 310,202 310,220 C310,256 256,294 256,294 Z"
                    stroke="var(--cta)" strokeWidth="6" fill="none" strokeLinejoin="round" opacity="0.25"/>
            </svg>
          </div>
          
          {/* Text Logo */}
          <div className="flex items-baseline">
            <span
              className="text-3xl text-[var(--heading)]"
              style={{ fontFamily: 'Palatino Linotype, Palatino, Book Antiqua, Georgia, serif', fontWeight: 400, fontStyle: 'italic', letterSpacing: '0.02em' }}
            >
              Heart
            </span>
            <span className="relative ml-0.5 text-3xl italic text-[var(--cta)]" style={{ fontFamily: 'Brush Script MT, cursive', fontWeight: 400 }}>
              Pr
              <span className="relative inline-block">
                ı
                <svg className="absolute left-1/2 -translate-x-1/2" style={{ top: '3px' }} width="8" height="8" viewBox="0 0 16 16" fill="none">
                  <path d="M8 14L3 9C2 8 2 6 3 5C4 4 6 4 7 5L8 6L9 5C10 4 12 4 13 5C14 6 14 8 13 9L8 14Z" fill="var(--cta)"/>
                </svg>
              </span>
              nt
            </span>
          </div>
        </div>

        {/* Heading + add + theme toggle */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--heading)]">
            Our Places
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={onResetView}
              disabled={isLoading || memories.length === 0}
              aria-label="Reset map view"
              title="Show all places"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--body)]/60 transition hover:scale-105 hover:border-[var(--cta)]/40 hover:text-[var(--cta)] disabled:pointer-events-none disabled:opacity-35"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onStartAddPin}
              aria-label="Add a new memory"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--cta)] text-[var(--surface)] shadow-md shadow-[var(--cta)]/20 transition hover:scale-105 hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-6 h-px bg-[var(--border)]" />

      {/* Memory list */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex flex-col gap-3 px-6 py-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse space-y-2">
                <div className="h-2.5 w-20 rounded-full bg-[var(--accent)]/20" />
                <div className="h-3.5 w-full rounded-full bg-[var(--accent)]/10" />
                <div className="h-2.5 w-28 rounded-full bg-[var(--accent)]/10" />
              </div>
            ))}
          </div>
        )}
        {!isLoading && memories.map((memory, index) => {
          const isSelected = selectedMemoryId === memory.id;

          return (
            <button
              type="button"
              key={memory.id}
              onClick={() => onSelectMemory(memory)}
              className={`group w-full cursor-pointer px-6 py-4 text-left transition-colors ${
                isSelected ? "bg-[var(--surface)]" : "hover:bg-[var(--surface)]/60"
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`mt-0.5 shrink-0 font-mono text-xs tabular-nums transition-colors ${
                    isSelected ? "text-[var(--cta)]" : "text-[var(--body)]/40"
                  }`}
                >
                  {String(memories.length - index).padStart(2, "0")}
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[11px] font-medium uppercase tracking-[0.2em] transition-colors ${
                      isSelected ? "text-[var(--cta)]" : "text-[var(--body)]/50"
                    }`}
                  >
                    {dateFormatter.format(new Date(`${memory.date}T00:00:00`))}
                  </p>
                  <h2
                    className={`mt-1 text-sm font-semibold leading-snug transition-colors ${
                      isSelected
                        ? "text-[var(--heading)]"
                        : "text-[var(--body)] group-hover:text-[var(--heading)]"
                    }`}
                  >
                    {memory.title}
                  </h2>
                  <p className="mt-1 text-xs leading-4 text-[var(--body)]/50">
                    {memory.locationName}
                  </p>
                </div>

                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-300 ${
                    isSelected ? "scale-110 bg-[var(--cta)]" : "bg-transparent"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--border)] px-6 py-3">
        <p className="text-[11px] text-[var(--body)]/40">
          {isLoading ? "Loading…" : `${memories.length} memories · tap a pin to open its story`}
        </p>
      </div>
    </aside>
  );
}
