"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { uploadImage } from "@/lib/memories-api";
import type { Memory } from "@/data/memories";

type AddMemoryModalProps = {
  coordinates: { longitude: number; latitude: number };
  initialLocationName?: string;
  mapplsPin?: string;
  eLoc?: string;
  onSave: (memory: Omit<Memory, "id">) => Promise<void>;
  onClose: () => void;
};

const inputCn =
  "w-full rounded-md border border-[var(--border-strong)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--heading)] placeholder-[var(--body)]/30 shadow-sm outline-none transition focus:border-[var(--cta)]/60 focus:ring-2 focus:ring-[var(--cta)]/15";

const labelCn = "mb-1.5 block text-xs font-medium text-[var(--body)]/70";

export function AddMemoryModal({
  coordinates,
  initialLocationName = "",
  mapplsPin,
  eLoc,
  onSave,
  onClose,
}: AddMemoryModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [locationName, setLocationName] = useState(initialLocationName);
  const [story, setStory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Give this memory a title."); return; }
    if (!locationName.trim()) { setError("Add a location name."); return; }

    setIsSaving(true);
    setError("");

    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      await onSave({
        title: title.trim(),
        date,
        locationName: locationName.trim(),
        coordinates,
        story: story.trim(),
        image: imageUrl,
        mapplsPin,
        eLoc,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setIsSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-3 backdrop-blur-md md:items-center md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Add a new memory"
      onClick={onClose}
    >
      <form
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[var(--surface)] shadow-2xl shadow-black/40 ring-1 ring-[var(--border)]"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--cta)]">
              New Memory
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--heading)]">
              Add a place
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--body)]/50 transition hover:bg-[var(--bg)] hover:text-[var(--heading)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          <div className="space-y-4 px-6 pt-5 pb-6">
            {/* Coordinates badge */}
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1 text-xs text-[var(--body)]/60">
              <MapPin className="h-3 w-3 text-[var(--cta)]" />
              {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}
            </span>

            {error && (
              <p className="rounded-md bg-[var(--cta)]/10 px-3 py-2 text-xs font-medium text-[var(--cta)]">
                {error}
              </p>
            )}

            {/* Title */}
            <div>
              <label className={labelCn}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setError(""); }}
                placeholder="The day we…"
                autoFocus
                className={inputCn}
              />
            </div>

            {/* Date */}
            <div>
              <label className={labelCn}>Date</label>
              <DatePicker value={date} onChange={setDate} />
            </div>

            {/* Location */}
            <div>
              <label className={labelCn}>Location name</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => { setLocationName(e.target.value); setError(""); }}
                placeholder="Café, City"
                className={inputCn}
              />
            </div>

            {/* Story */}
            <div>
              <label className={cn(labelCn, "flex items-baseline gap-1.5")}>
                Story
                <span className="font-normal text-[var(--body)]/30">(optional)</span>
              </label>
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="What made this place special…"
                rows={3}
                className={cn(inputCn, "resize-none")}
              />
            </div>

            {/* Image */}
            <div>
              <label className={cn(labelCn, "flex items-baseline gap-1.5")}>
                Photo
                <span className="font-normal text-[var(--body)]/30">(optional)</span>
              </label>

              {imagePreview ? (
                <div className="relative overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-36 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                    aria-label="Remove photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border-strong)] py-5 text-sm text-[var(--body)]/50 transition hover:border-[var(--cta)]/40 hover:text-[var(--cta)]"
                >
                  <ImagePlus className="h-4 w-4" />
                  Upload a photo
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 rounded-md border border-[var(--border-strong)] bg-transparent py-2 text-sm font-medium text-[var(--body)] transition hover:bg-[var(--bg)] hover:text-[var(--heading)] disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[var(--cta)] py-2 text-sm font-semibold text-[var(--surface)] shadow-sm transition hover:opacity-90 disabled:opacity-60"
              >
                {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isSaving ? "Saving…" : "Save Memory"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
