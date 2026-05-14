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
        <img src="/memories/logo/heart-icon.svg" alt="HeartPrint" className="h-12 w-12" />

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
