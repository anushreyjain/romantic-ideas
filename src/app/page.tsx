import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-start justify-between bg-[#1A1418] px-8 py-12 md:px-16 md:py-16">
      <div className="flex items-baseline gap-0">
        <span className="text-base font-serif text-[#D3C8CD]" style={{ fontFamily: 'Georgia, serif', fontWeight: 500 }}>
          Heart
        </span>
        <span className="relative text-base italic text-[#ED93B1]" style={{ fontFamily: 'Brush Script MT, cursive', fontWeight: 400 }}>
          Pr
          <span className="relative inline-block" style={{ fontFeatureSettings: '"liga" 0' }}>
            <span style={{ visibility: 'hidden' }}>i</span>
            <span className="absolute inset-0" style={{ visibility: 'visible' }}>ı</span>
            <svg className="absolute left-1/2 -translate-x-1/2" style={{ top: '1px' }} width="5" height="5" viewBox="0 0 16 16" fill="none">
              <path d="M8 14L3 9C2 8 2 6 3 5C4 4 6 4 7 5L8 6L9 5C10 4 12 4 13 5C14 6 14 8 13 9L8 14Z" fill="#ED93B1"/>
            </svg>
          </span>
          nt
        </span>
      </div>

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
