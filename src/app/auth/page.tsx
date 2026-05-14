"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

type LoginResponse = {
  error?: string;
  redirectTo?: string;
};

export default function AuthPage() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/auth/couple-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    const data = (await response.json().catch(() => ({}))) as LoginResponse;

    if (!response.ok) {
      setError(data.error || "Could not open this memory map.");
      setIsSubmitting(false);
      return;
    }

    router.replace(data.redirectTo || "/memories-map");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--bg) px-5 py-10">
      <section className="relative w-full max-w-md rounded-4xl border border-(--border-strong) bg-(--surface)/80 px-6 py-8 shadow-lg shadow-(--cta)/5 backdrop-blur md:px-8 md:py-10">
        <Link
          href="/"
          aria-label="Back to home"
          className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-(--border) text-(--body)/70 transition hover:border-(--cta) hover:text-(--cta)"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="flex flex-col items-center text-center">
          <Image
            src="/memories/logo/heart-icon.svg"
            alt="HeartPrint"
            width={56}
            height={56}
            className="h-14 w-14"
          />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-(--cta)">
            Private map
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-(--heading)">
            Enter your couple key.
          </h1>
          <p className="mt-4 text-sm leading-6 text-(--body)/70">
            Every couple has a separate key, so your memories stay connected
            only to your shared map.
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="couple-key"
              className="mb-2 block text-xs font-medium text-(--body)/70"
            >
              Couple key
            </label>
            <input
              id="couple-key"
              type="text"
              value={key}
              onChange={(event) => {
                setKey(event.target.value);
                setError("");
              }}
              placeholder="Example: RHEA-ANUJ-7K29"
              autoComplete="off"
              autoFocus
              className="w-full rounded-xl border border-(--border-strong) bg-(--bg) px-4 py-3 text-sm font-medium tracking-wide text-(--heading) outline-none transition placeholder:text-(--body)/30 focus:border-(--cta)/60 focus:ring-2 focus:ring-(--cta)/15"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-(--cta)/10 px-4 py-3 text-sm font-medium text-(--cta)">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--cta) px-5 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-(--accent) disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {isSubmitting ? "Opening map..." : "Open Memories Map"}
          </button>
        </form>
      </section>
    </main>
  );
}
