import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-start justify-between bg-[var(--bg)] px-8 py-12 md:px-16 md:py-16">
      <div className="flex items-center">
        <img src="/memories/logo/heart-icon.svg" alt="HeartPrint" className="h-14 w-14" />
      </div>

      <div className="max-w-3xl">
        <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight text-[var(--heading)] md:text-7xl">
          A map of the places{" "}
          <span className="text-[var(--cta)]">that became ours.</span>
        </h1>
        <p className="mt-8 max-w-lg text-base font-light leading-7 text-[var(--body)] md:text-lg">
          Every place we shared lives here — pinned, remembered, and waiting to
          be revisited.
        </p>

        <Link
          href="/memories-map"
          className="mt-10 inline-flex items-center gap-2 border-b border-[var(--cta)] pb-0.5 text-sm font-medium tracking-wide text-[var(--cta)] transition hover:text-[var(--accent)] hover:border-[var(--accent)]"
        >
          Open Memories Map
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <p className="text-xs text-[var(--body)]/40">
        {new Date().getFullYear()} · All memories are private.
      </p>
    </main>
  );
}
