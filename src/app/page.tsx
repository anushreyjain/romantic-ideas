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
              Why this exist
            </button>
          </div>
        </div>

        <p className="mt-12 text-xs text-(--body)/40">
          {new Date().getFullYear()} · All memories are private.
        </p>
      </section>

      {isWhyModalOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 px-3 py-[50px] backdrop-blur-md sm:px-6 md:px-[50px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="why-this-title"
          onClick={() => setIsWhyModalOpen(false)}
        >
          <article
            className="relative max-h-[calc(100dvh-100px)] w-full max-w-5xl overflow-y-auto rounded-2xl bg-(--surface) px-6 py-7 text-left shadow-2xl shadow-black/40 ring-1 ring-(--border) md:px-10 md:py-9"
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
              Why this exist
            </p>
            <h2
              id="why-this-title"
              className="mt-3 pr-8 text-3xl font-semibold leading-tight tracking-tight text-(--heading)"
            >
              A tiny place for every memory.
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-6 text-(--body)">
              <p>
                HeartPrint was not made just to store photos or mark places on
                a map. It was made for{" "}
                <strong className="font-semibold uppercase text-(--cta)">
                  her
                </strong>
                ,
                the{" "}
                <strong className="font-semibold uppercase text-(--cta)">
                  love of my life
                </strong>
                , my{" "}
                <strong className="font-semibold uppercase text-(--cta)">
                  Lady Luck
                </strong>
                .
              </p>
              <p>
                This idea came to me one quiet night, out of nowhere, with one
                simple thought: I wanted to keep our memories in a way that felt
                as special as she is. Not just pictures in a gallery, but places
                with feelings attached to them. A first walk. A favorite corner.
                A conversation that stayed with us. A moment that may have
                looked ordinary to the world, but meant everything to us.
              </p>
              <p>
                I wanted to build something that could hold the story of us,
                from the beginning of our bond to every little step in our
                journey. Where we went, what we talked about, how it felt, what
                changed between us, and how each place became a part of our love.
              </p>
              <p>
                One day, when we grow old and come back to these memories, I
                want every moment to come alive in front of our eyes again. I
                want us to remember not just where we were, but who we were in
                that moment, what we felt, how we smiled, how we laughed, and
                how beautifully it all became ours.
              </p>
              <p>
                Most of all, I made this for{" "}
                <strong className="font-semibold uppercase text-(--cta)">
                  her
                </strong>
                .
                To make{" "}
                <strong className="font-semibold uppercase text-(--cta)">
                  her
                </strong>{" "}
                feel special, loved, excited, and happy like a little child. I
                love the way{" "}
                <strong className="font-semibold uppercase text-(--cta)">
                  she
                </strong>{" "}
                giggles, the way her small childish things light up my heart, and
                the way she makes even simple moments feel magical.
              </p>
              <p>
                I hope that years from now, when she reads these memories, she
                giggles again. I hope she feels all the love hidden inside every
                word, every place, and every little detail.
              </p>
              <p>
                HeartPrint is my way of saying that our memories deserve a home.
                And that home is made only for{" "}
                <strong className="font-semibold uppercase text-(--cta)">
                  her
                </strong>
                ,
                my{" "}
                <strong className="font-semibold uppercase text-(--cta)">
                  Lady Luck
                </strong>
                .
              </p>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}
