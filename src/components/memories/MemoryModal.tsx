import Image from "next/image";
import { Trash2, X } from "lucide-react";
import { useState } from "react";
import type { Memory } from "@/data/memories";

type MemoryModalProps = {
  memory?: Memory;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const metaBadgeCn =
  "inline-flex min-h-7 items-center rounded-md px-2.5 py-1 text-[11px] font-semibold leading-none";

export function MemoryModal({ memory, onClose, onDelete }: MemoryModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!memory) return null;

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setIsDeleting(true);
    try {
      await onDelete(memory!.id);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-30 flex items-end justify-center bg-black/50 p-3 backdrop-blur-md md:items-center md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="memory-modal-title"
      onClick={() => { onClose(); setConfirmDelete(false); }}
    >
      <article
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[var(--surface)] shadow-2xl shadow-black/40 ring-1 ring-[var(--border)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          aria-label="Close"
          onClick={() => { onClose(); setConfirmDelete(false); }}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg)]/80 text-[var(--body)] ring-1 ring-[var(--border)] transition hover:text-[var(--heading)]"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image or accent stripe */}
        {memory.image ? (
          <div className="relative h-52 w-full overflow-hidden">
            <Image
              src={memory.image}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="(min-width: 768px) 32rem, 100vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[var(--surface)]/80 to-transparent" />
          </div>
        ) : (
          <div className="h-1.5 w-full bg-[var(--cta)]" />
        )}

        {/* Body */}
        <div className="px-6 py-6 md:px-7 md:py-7">
          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`${metaBadgeCn} bg-[var(--cta)]/10 uppercase tracking-[0.18em] text-[var(--cta)]`}>
              {dateFormatter.format(new Date(`${memory.date}T00:00:00`))}
            </span>
            <span className={`${metaBadgeCn} bg-[var(--accent)]/10 text-[var(--body)]`}>
              {memory.locationName}
            </span>
          </div>

          {/* Title */}
          <h2
            id="memory-modal-title"
            className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-[var(--heading)] md:text-3xl"
          >
            {memory.title}
          </h2>

          {/* Story */}
          <p className="mt-4 text-sm leading-7 text-[var(--body)] md:text-base">
            {memory.story}
          </p>

          {/* Delete */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                confirmDelete
                  ? "bg-red-500/15 text-red-500 hover:bg-red-500/25"
                  : "text-[var(--body)]/40 hover:bg-[var(--surface2)] hover:text-[var(--body)]"
              } disabled:opacity-50`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isDeleting ? "Deleting…" : confirmDelete ? "Tap again to confirm" : "Delete memory"}
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
