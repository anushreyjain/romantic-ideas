import type { Memory } from "@/data/memories";

type ApiError = {
  error?: string;
};

async function parseApiError(response: Response) {
  const data = (await response.json().catch(() => ({}))) as ApiError;
  return data.error || "Something went wrong. Try again.";
}

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return (await response.json()) as T;
}

// ── Read ─────────────────────────────────────────────────────
export async function getMemories(): Promise<Memory[]> {
  return fetchJson<Memory[]>("/api/memories", { cache: "no-store" });
}

// ── Create ───────────────────────────────────────────────────
export async function addMemory(memory: Omit<Memory, "id">): Promise<Memory> {
  return fetchJson<Memory>("/api/memories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(memory),
  });
}

// ── Delete ───────────────────────────────────────────────────
export async function deleteMemory(id: string): Promise<void> {
  await fetchJson<{ ok: true }>(`/api/memories/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// ── Image upload ─────────────────────────────────────────────
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const data = await fetchJson<{ url: string }>("/api/memories/images", {
    method: "POST",
    body: formData,
  });
  return data.url;
}
