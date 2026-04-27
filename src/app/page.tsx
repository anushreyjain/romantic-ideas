import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-start justify-between bg-[#1A1418] px-8 py-12 md:px-16 md:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ED93B1]">
        Private · Romantic Timeline
      </p>

      <div className="max-w-3xl">
        <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight text-[#FBEAF0] md:text-7xl">
          A map of the places{" "}
          <span className="text-[#ED93B1]">that became ours.</span>
        </h1>
        <p className="mt-8 max-w-lg text-base font-light leading-7 text-[#D3C8CD] md:text-lg">
          Every place we shared lives here — pinned, remembered, and waiting to
          be revisited.
        </p>

        <Link
          href="/memories-map"
          className="mt-10 inline-flex items-center gap-2 border-b border-[#ED93B1] pb-0.5 text-sm font-medium tracking-wide text-[#ED93B1] transition hover:text-[#F4C0D1] hover:border-[#F4C0D1]"
        >
          Open Memories Map
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <p className="text-xs text-[#D3C8CD]/40">
        {new Date().getFullYear()} · All memories are private.
      </p>
    </main>
  );
}
