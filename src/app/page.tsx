"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";

export default function Home() {
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);

  useEffect(() => {
    if (!isWhyModalOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsWhyModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWhyModalOpen]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--bg) px-5 py-10 md:px-8">
      <section className="flex w-full max-w-4xl flex-col items-center rounded-4xl border border-(--border-strong) bg-(--surface)/70 px-6 py-10 text-center shadow-lg shadow-(--cta)/5 backdrop-blur md:px-12 md:py-14">
        <div className="flex items-center justify-center">
          <Image
            src="/memories/logo/heart-icon.svg"
            alt="HeartPrint"
            width={56}
            height={56}
            className="h-14 w-14"
          />
        </div>

        <div className="mt-10 max-w-3xl">
          <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight text-(--heading) md:text-7xl">
            A map of the places
            <span className="mt-3 block text-(--cta)">that became ours.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-lg text-base font-light leading-7 text-(--body) md:text-lg">
            Every place we shared lives here — pinned, remembered, and waiting to
            be revisited.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-(--cta) px-5 py-3 text-sm font-medium tracking-wide text-white transition hover:bg-(--accent)"
            >
              Open Memories Map
              <ArrowUpRight className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={() => setIsWhyModalOpen(true)}
              className="inline-flex items-center justify-center rounded-full border border-(--border-strong) px-5 py-3 text-sm font-medium tracking-wide text-(--cta) transition hover:border-(--cta) hover:text-(--accent)"
            >
              Why this
            </button>
          </div>
        </div>

        <p className="mt-12 text-xs text-(--body)/40">
          {new Date().getFullYear()} · All memories are private.
        </p>
      </section>

      {isWhyModalOpen && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 p-3 backdrop-blur-md md:items-center md:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="why-this-title"
          onClick={() => setIsWhyModalOpen(false)}
        >
          <article
            className="relative w-full max-w-lg rounded-2xl bg-(--surface) px-6 py-7 text-left shadow-2xl shadow-black/40 ring-1 ring-(--border) md:px-8 md:py-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setIsWhyModalOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-(--bg)/80 text-(--body) ring-1 ring-(--border) transition hover:text-(--heading)"
            >
              <X className="h-4 w-4" />
            </button>

            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--cta)">
              Why this
            </p>
            <h2
              id="why-this-title"
              className="mt-3 pr-8 text-3xl font-semibold leading-tight tracking-tight text-(--heading)"
            >
              A tiny place for every memory.
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-(--body) md:text-base">
              <p>
                This idea came from wanting more than photos in a gallery. Some
                places keep a feeling attached to them: a first walk, a favorite
                corner, a conversation that stayed.
              </p>
              <p>
                HeartPrint is meant to hold those places together, so we can
                return to the map and remember not just where we went, but what
                each place became for us.
              </p>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}
