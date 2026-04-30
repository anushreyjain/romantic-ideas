"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2, MapPin, Search, X } from "lucide-react";
import type { MapplsSuggestion, MapplsPlaceDetail } from "./MapplsMemoryMap";

// ── Types ──────────────────────────────────────────────────────

export type SearchedLocation = {
  lat?: number;
  lng?: number;
  locationName: string;
  address: string;
  eLoc?: string;
};

type Props = {
  /** Current pin position on the map (set by search result, drag, or click). */
  pickedPin: { lat: number; lng: number } | null;
  onLocationSearched: (location: SearchedLocation) => void;
  onConfirm: () => void;
  onCancel: () => void;
  confirmedName?: string;
};

// ── Mappls API helpers ──────────────────────────────────────────

async function mapplsRequest<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data?.error === "string"
        ? data.error
        : `Mappls request failed (${response.status}).`;
    throw new Error(message);
  }

  return data as T;
}

async function sdkSearch(query: string): Promise<MapplsSuggestion[]> {
  const data = await mapplsRequest<{
    suggestedLocations?: MapplsSuggestion[];
    userAddedLocations?: MapplsSuggestion[];
  }>(`/api/location-search?q=${encodeURIComponent(query)}`);

  return [
    ...(data.suggestedLocations ?? []),
    ...(data.userAddedLocations ?? []),
  ].slice(0, 5);
}

async function sdkGetDetails(eLoc: string): Promise<MapplsPlaceDetail> {
  return mapplsRequest<MapplsPlaceDetail>(
    `/api/mappls/place-details?eLoc=${encodeURIComponent(eLoc)}`,
  );
}

function numericField(data: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = Number(data[key]);
    if (Number.isFinite(value)) return value;
  }

  return NaN;
}

function detailCoordinates(detail: MapplsPlaceDetail) {
  const record = detail as Record<string, unknown>;

  return {
    lat: numericField(record, ["latitude", "lat"]),
    lng: numericField(record, ["longitude", "lng", "lon"]),
  };
}

function detailAddress(detail: MapplsPlaceDetail) {
  const record = detail as Record<string, unknown>;

  return (
    detail.formatted_address ??
    (typeof record["formattedAddress"] === "string" ? record["formattedAddress"] : undefined) ??
    (typeof record["address"] === "string" ? record["address"] : undefined) ??
    ""
  );
}

function detailName(detail: MapplsPlaceDetail) {
  const record = detail as Record<string, unknown>;

  return (
    detail.placeName ??
    (typeof record["name"] === "string" ? record["name"] : undefined)
  );
}

// ── Component ──────────────────────────────────────────────────

export function LocationPickerPanel({
  pickedPin,
  onLocationSearched,
  onConfirm,
  onCancel,
  confirmedName,
}: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MapplsSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    setErrorMsg("");
    try {
      const results = await sdkSearch(q);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Search failed.");
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => runSearch(val), 320);
    },
    [runSearch],
  );

  const selectSuggestion = useCallback(async (s: MapplsSuggestion) => {
    setShowDropdown(false);
    setQuery(s.placeName ?? s.placeAddress ?? "");
    setErrorMsg("");

    // Try coordinates already in the suggestion
    const lat = Number(s.latitude);
    const lng = Number(s.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)) {
      onLocationSearched({
        lat,
        lng,
        locationName: s.placeName ?? "Selected location",
        address: s.placeAddress ?? "",
        eLoc: s.eLoc,
      });
      return;
    }

    // Need place detail round-trip for coordinates
    if (!s.eLoc) {
      setErrorMsg("Could not get coordinates for this place.");
      return;
    }
    setIsFetchingDetail(true);
    try {
      const detail = await sdkGetDetails(s.eLoc);
      const { lat: dLat, lng: dLng } = detailCoordinates(detail);
      const locationName = detailName(detail) ?? s.placeName ?? "Selected location";
      const address = detailAddress(detail) || s.placeAddress || "";

      onLocationSearched({
        ...(Number.isFinite(dLat) && Number.isFinite(dLng)
          ? { lat: dLat, lng: dLng }
          : {}),
        locationName,
        address,
        eLoc: s.eLoc,
      });
    } catch {
      onLocationSearched({
        locationName: s.placeName ?? "Selected location",
        address: s.placeAddress ?? "",
        eLoc: s.eLoc,
      });
    } finally {
      setIsFetchingDetail(false);
    }
  }, [onLocationSearched]);

  const isLoading = isSearching || isFetchingDetail;
  const hasPin = pickedPin !== null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col items-center px-3 pt-4">
      {/* Card */}
      <div className="pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl bg-[var(--surface)]/96 shadow-2xl ring-1 ring-[var(--border)] backdrop-blur-md">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
          <MapPin className="h-4 w-4 shrink-0 text-[var(--cta)]" />
          <span className="flex-1 text-sm font-semibold text-[var(--heading)]">
            Pick a memory location
          </span>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel location picker"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--body)]/50 transition hover:bg-[var(--bg)] hover:text-[var(--heading)]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Search input */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-[var(--body)]/40" />
            {isLoading && (
              <Loader2 className="pointer-events-none absolute right-3 h-3.5 w-3.5 animate-spin text-[var(--cta)]/60" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              placeholder="Search cafés, parks, streets…"
              autoComplete="off"
              className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg)] py-2.5 pl-9 pr-9 text-sm text-[var(--heading)] placeholder-[var(--body)]/30 outline-none transition focus:border-[var(--cta)]/60 focus:ring-2 focus:ring-[var(--cta)]/15"
            />
          </div>
          {errorMsg && (
            <p className="mt-2 text-xs text-[var(--cta)]">{errorMsg}</p>
          )}
        </div>

        {/* Suggestions dropdown (max 5) */}
        {showDropdown && suggestions.length > 0 && (
          <ul className="max-h-56 overflow-y-auto border-t border-[var(--border)]">
            {suggestions.map((s, i) => (
              <li key={s.eLoc ?? i}>
                <button
                  type="button"
                  onClick={() => selectSuggestion(s)}
                  className="group w-full px-4 py-3 text-left transition-colors hover:bg-[var(--surface2)]"
                >
                  <p className="text-sm font-medium leading-snug text-[var(--heading)] group-hover:text-[var(--cta)]">
                    {s.placeName ?? "Unnamed place"}
                  </p>
                  {s.placeAddress && (
                    <p className="mt-0.5 line-clamp-1 text-xs leading-snug text-[var(--body)]/50">
                      {s.placeAddress}
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Selected location + Confirm */}
        {hasPin && !showDropdown && (
          <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-3">
            <div className="min-w-0">
              {confirmedName && (
                <p className="truncate text-sm font-semibold text-[var(--heading)]">
                  {confirmedName}
                </p>
              )}
              <p className="font-mono text-[11px] text-[var(--body)]/40">
                {pickedPin!.lat.toFixed(5)}, {pickedPin!.lng.toFixed(5)}
              </p>
              <p className="mt-0.5 text-[11px] italic text-[var(--body)]/40">
                Drag the pin to fine-tune
              </p>
            </div>
            <button
              type="button"
              onClick={onConfirm}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[var(--cta)] px-4 py-2 text-sm font-semibold text-[var(--surface)] shadow-md transition hover:scale-105 hover:opacity-90"
            >
              <Check className="h-3.5 w-3.5" />
              Confirm
            </button>
          </div>
        )}
      </div>

      {/* Floating hint */}
      {!hasPin && (
        <p className="pointer-events-none mt-2 rounded-lg bg-[var(--surface)]/80 px-3 py-1.5 text-xs text-[var(--body)]/60 backdrop-blur">
          Search above — or click anywhere on the map to drop a pin
        </p>
      )}
    </div>
  );
}
