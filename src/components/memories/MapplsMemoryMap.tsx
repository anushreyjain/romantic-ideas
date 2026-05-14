"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Memory } from "@/data/memories";

// ── Shared types ───────────────────────────────────────────────

type LatLng = { lat: number; lng: number };

export type MapplsSuggestion = {
  eLoc?: string;
  placeName?: string;
  placeAddress?: string;
  latitude?: string | number;
  longitude?: string | number;
  type?: string;
  source?: "mappls" | "serpapi";
};

export type MapplsPlaceDetail = {
  latitude?: number | string;
  longitude?: number | string;
  placeName?: string;
  formatted_address?: string;
};

type Coordinates = {
  longitude: number;
  latitude: number;
};

type LngLatBounds = [[number, number], [number, number]];

export type PickedMapplsLocation = {
  coordinates: Coordinates;
  locationName: string;
  mapplsPin?: string;
  eLoc?: string;
};

// ── Mappls SDK typings (minimal, defensive) ────────────────────

type MapplsMarker = {
  remove?: () => void;
  addListener?: (event: string, cb: (e?: unknown) => void) => void;
  removeListener?: (event: string) => void;
  getLocation?: () => unknown;
  getPosition?: () => unknown;
  setPosition?: (pos: LatLng) => void;
  setPopup?: (html: string, options?: Record<string, unknown>) => void;
};

type MapplsMap = {
  on?: (event: string, cb: (e?: unknown) => void) => void;
  addListener?: (event: string, cb: (e?: unknown) => void) => void;
  removeListener?: (event: string) => void;
  remove?: () => void;
  flyTo?: (options: Record<string, unknown>) => void;
  easeTo?: (options: Record<string, unknown>) => void;
  fitBounds?: (bounds: LngLatBounds, options?: Record<string, unknown>) => void;
  panTo?: (center: [number, number] | LatLng, options?: Record<string, unknown>) => void;
  setCenter?: (center: [number, number] | LatLng) => void;
  setZoom?: (zoom: number, options?: Record<string, unknown>) => void;
  setView?: (
    center: LatLng,
    zoom?: number,
    options?: Record<string, unknown>,
  ) => void;
  getCenter?: () => unknown;
};

type MapplsGlobal = {
  Map: new (id: string, props: Record<string, unknown>) => MapplsMap;
  Marker: new (props: Record<string, unknown>) => MapplsMarker;
  pinMarker?: (
    opts: Record<string, unknown>,
    cb?: (data: unknown) => void,
  ) => { remove?: () => void } | void;
  remove?: (opts: Record<string, unknown>) => void;
  search?: (
    opts: Record<string, unknown>,
    cb: (data: { suggestedLocations?: MapplsSuggestion[] } | null) => void,
  ) => void;
  getDetails?: (
    opts: Record<string, unknown>,
    cb: (data: MapplsPlaceDetail | null) => void,
  ) => void;
};

type MapplsTokenResponse = {
  accessToken?: string;
};

declare global {
  interface Window {
    mappls?: MapplsGlobal;
  }
}

// ── Props ──────────────────────────────────────────────────────

type MapplsMemoryMapProps = {
  memories: Memory[];
  activeMemoryId?: string;
  focusMemory?: Memory;
  resetViewKey?: number;
  /**
   * When true the map is in location-picking mode.
   * A draggable pin is shown at `pickedPinPosition` (if set).
   * Clicking the map fires `onMapClick`.
   */
  isPickingLocation: boolean;
  /**
   * Coordinates of the pending / draggable pin.
   * Pass null to remove the picking pin.
   */
  pickedPinPosition: LatLng | null;
  /** Changes when the picked pin came from a new searched address. */
  pickedPinFocusKey?: string;
  /**
   * Mappls eLoc to resolve through the Web SDK marker plugin when REST details
   * are not allowed to return coordinates for this account.
   */
  mapplsPinToResolve?: string;
  onMemoryClick: (memory: Memory) => void;
  /** Fired when the user drags the picking pin. */
  onPinDragged: (pos: LatLng) => void;
  /** Fired when a Mappls eLoc marker has been resolved to map coordinates. */
  onMapplsPinResolved: (pos: LatLng) => void;
  /** Fired when the user clicks the map while isPickingLocation = true. */
  onMapClick: (pos: LatLng) => void;
};

// ── Constants ──────────────────────────────────────────────────

const DEFAULT_CENTER: Coordinates = { latitude: 28.6139, longitude: 77.209 };
const MEMORY_MARKER_ICON = "https://apis.mappls.com/map_v3/1.png";
const MEMORY_MARKER_SIZE = 44;
const PICKING_MARKER_WIDTH = 56;
const PICKING_MARKER_ANCHOR_HEIGHT = 56;

// ── Script loader (module-level cache) ────────────────────────

const loadedScripts = new Map<string, Promise<void>>();

function removeLoadedScript(id: string) {
  document.getElementById(id)?.remove();
  loadedScripts.delete(id);
}

function loadScript(id: string, src: string, timeoutMs = 10_000): Promise<void> {
  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing) {
    if (existing.src === src) {
      if (loadedScripts.has(id)) return loadedScripts.get(id)!;
      const p = Promise.resolve();
      loadedScripts.set(id, p);
      return p;
    }

    existing.remove();
    loadedScripts.delete(id);
  }

  const p = new Promise<void>((resolve, reject) => {
    const el = document.createElement("script");
    const timeout = window.setTimeout(() => {
      loadedScripts.delete(id);
      el.remove();
      reject(new Error(`Timed out loading ${id}`));
    }, timeoutMs);

    el.id = id;
    el.src = src;
    el.async = true;
    el.defer = true;
    el.onload = () => {
      window.clearTimeout(timeout);
      resolve();
    };
    el.onerror = () => {
      window.clearTimeout(timeout);
      loadedScripts.delete(id);
      el.remove();
      reject(new Error(`Failed to load ${id}`));
    };
    document.head.appendChild(el);
  });

  loadedScripts.set(id, p);
  return p;
}

// ── Helpers ────────────────────────────────────────────────────

function markerLatLng(marker: MapplsMarker): LatLng | null {
  // SDK returns either .getLocation() or .getPosition(), result shape varies
  const raw = marker.getLocation?.() ?? marker.getPosition?.();
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  // Shape: { lat, lng } or { LatLng: { lat, lng } } or { lat(), lng() }
  const lat =
    typeof r["lat"] === "number"
      ? r["lat"]
      : typeof r["lat"] === "function"
        ? (r["lat"] as () => number)()
        : typeof (r["LatLng"] as Record<string, unknown> | undefined)?.["lat"] === "number"
          ? ((r["LatLng"] as Record<string, unknown>)["lat"] as number)
          : NaN;
  const lng =
    typeof r["lng"] === "number"
      ? r["lng"]
      : typeof r["lng"] === "function"
        ? (r["lng"] as () => number)()
        : typeof (r["LatLng"] as Record<string, unknown> | undefined)?.["lng"] === "number"
          ? ((r["LatLng"] as Record<string, unknown>)["lng"] as number)
          : NaN;
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

function mapClickLatLng(event: unknown): LatLng | null {
  if (!event || typeof event !== "object") return null;
  const e = event as Record<string, unknown>;
  // Mappls SDK v3 click event has e.lngLat = { lat, lng }
  const ll = (e["lngLat"] ?? e["LatLng"] ?? e["latLng"]) as
    | Record<string, unknown>
    | undefined;
  if (ll && typeof ll === "object") {
    const lat = Number(ll["lat"]);
    const lng = Number(ll["lng"]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }
  return null;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "\"":
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

function memoryMarkerHtml(memory: Memory, isActive: boolean) {
  const title = escapeHtml(memory.title);
  const size = isActive ? MEMORY_MARKER_SIZE + 8 : MEMORY_MARKER_SIZE;
  const heartSize = isActive ? 21 : 18;

  return `
    <div
      class="memory-map-marker${isActive ? " is-active" : ""}"
      title="${title}"
      aria-label="${title}"
      style="--memory-marker-size:${size}px; --memory-heart-size:${heartSize}px;"
    >
      <span class="memory-map-marker__pulse" aria-hidden="true"></span>
      <svg width="${heartSize}" height="${heartSize}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 21s-7.2-4.35-9.7-8.65C.55 9.34 1.48 5.7 4.68 4.5 7.12 3.58 9.28 4.38 12 7.2c2.72-2.82 4.88-3.62 7.32-2.7 3.2 1.2 4.13 4.84 2.38 7.85C19.2 16.65 12 21 12 21Z"/>
      </svg>
      <span class="memory-map-marker__tooltip">${title}</span>
    </div>
  `;
}

function pickingMarkerHtml() {
  return `
    <div class="memory-pick-marker" aria-label="Selected location">
      <span class="memory-pick-marker__ring" aria-hidden="true"></span>
      <span class="memory-pick-marker__head" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 21s-7.2-4.35-9.7-8.65C.55 9.34 1.48 5.7 4.68 4.5 7.12 3.58 9.28 4.38 12 7.2c2.72-2.82 4.88-3.62 7.32-2.7 3.2 1.2 4.13 4.84 2.38 7.85C19.2 16.65 12 21 12 21Z"/>
        </svg>
      </span>
      <span class="memory-pick-marker__tip" aria-hidden="true"></span>
      <span class="memory-pick-marker__label">Selected address</span>
    </div>
  `;
}

function latLngFromUnknown(value: unknown, depth = 0): LatLng | null {
  if (!value || typeof value !== "object" || depth > 3) return null;
  const record = value as Record<string, unknown>;

  const lat = Number(record["lat"] ?? record["latitude"]);
  const lng = Number(record["lng"] ?? record["lon"] ?? record["longitude"]);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };

  for (const child of Object.values(record)) {
    const found = latLngFromUnknown(child, depth + 1);
    if (found) return found;
  }

  return null;
}

function mapCenterLatLng(map: MapplsMap): LatLng | null {
  const raw = map.getCenter?.();
  if (!raw || typeof raw !== "object") return null;
  const center = raw as Record<string, unknown>;

  const lat =
    typeof center["lat"] === "number"
      ? center["lat"]
      : typeof center["lat"] === "function"
        ? (center["lat"] as () => number)()
        : NaN;
  const lng =
    typeof center["lng"] === "number"
      ? center["lng"]
      : typeof center["lng"] === "function"
        ? (center["lng"] as () => number)()
        : NaN;

  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

function focusMap(map: MapplsMap, coords: Coordinates, zoom = 18) {
  const center: [number, number] = [coords.longitude, coords.latitude];
  const latLng: LatLng = { lat: coords.latitude, lng: coords.longitude };

  if (map.flyTo) {
    map.flyTo({
      center,
      zoom,
      duration: 1600,
      curve: 1.35,
      speed: 0.8,
      essential: true,
    });
    return;
  }

  if (map.easeTo) {
    map.easeTo({
      center,
      zoom,
      duration: 1400,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });
    return;
  }

  if (map.setView) {
    map.setView(latLng, zoom, {
      pan: { animate: true, duration: 1.4 },
      zoom: { animate: true },
    });
    return;
  }

  if (map.panTo) {
    map.panTo(latLng, { animate: true, duration: 1.2 });
    window.setTimeout(() => map.setZoom?.(zoom, { animate: true }), 450);
    return;
  }

  map.setCenter?.(center);
  map.setZoom?.(zoom);
}

function zoomForBounds(bounds: LngLatBounds) {
  const [[west, south], [east, north]] = bounds;
  const span = Math.max(Math.abs(east - west), Math.abs(north - south));

  if (span > 10) return 5;
  if (span > 3) return 7;
  if (span > 1) return 9;
  if (span > 0.25) return 11;
  if (span > 0.05) return 13;
  return 15;
}

function showAllMemories(map: MapplsMap, memories: Memory[]) {
  if (memories.length === 0) {
    focusMap(map, DEFAULT_CENTER, 5);
    return;
  }

  if (memories.length === 1) {
    focusMap(map, memories[0].coordinates, 12);
    return;
  }

  const lngs = memories.map((memory) => memory.coordinates.longitude);
  const lats = memories.map((memory) => memory.coordinates.latitude);
  const bounds: LngLatBounds = [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];

  if (map.fitBounds) {
    try {
      map.fitBounds(bounds, {
        padding: 80,
        duration: 1200,
      });
      return;
    } catch {
      // Fall back to a center/zoom approximation for SDK variants.
    }
  }

  focusMap(
    map,
    {
      longitude: (bounds[0][0] + bounds[1][0]) / 2,
      latitude: (bounds[0][1] + bounds[1][1]) / 2,
    },
    zoomForBounds(bounds),
  );
}

async function fetchMapplsToken() {
  const tokenResponse = await fetch("/api/mappls/token", { cache: "no-store" });
  const tokenData = (await tokenResponse.json().catch(() => ({}))) as MapplsTokenResponse;

  return tokenResponse.ok ? tokenData.accessToken?.trim() : undefined;
}

async function loadMapplsSdk(publicKey: string) {
  const serverToken = await fetchMapplsToken().catch(() => undefined);
  const sdkTokens = Array.from(
    new Set([serverToken, publicKey].filter((token): token is string => Boolean(token))),
  );

  const sdkCandidates = [
    ...sdkTokens.map((token) => ({
      token,
      src: `https://apis.mappls.com/advancedmaps/api/${encodeURIComponent(token)}/map_sdk?layer=vector&v=3.0`,
    })),
    {
      token: publicKey,
      src: `https://sdk.mappls.com/map/sdk/web?v=3.0&access_token=${encodeURIComponent(publicKey)}`,
    },
  ];

  let lastError: unknown;
  for (const { src, token } of sdkCandidates) {
    removeLoadedScript("mappls-web-sdk");
    window.mappls = undefined;

    try {
      await loadScript("mappls-web-sdk", src, 8_000);
      if (window.mappls?.Map) return token;
      lastError = new Error("Mappls SDK loaded but Map API is unavailable.");
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unable to load Mappls map.");
}

// ── Component ──────────────────────────────────────────────────

export function MapplsMemoryMap({
  memories,
  activeMemoryId,
  focusMemory,
  resetViewKey,
  isPickingLocation,
  pickedPinPosition,
  pickedPinFocusKey,
  mapplsPinToResolve,
  onMemoryClick,
  onPinDragged,
  onMapplsPinResolved,
  onMapClick,
}: MapplsMemoryMapProps) {
  const reactId = useId();
  const mapId = useMemo(
    () => `mappls-map-${reactId.replace(/:/g, "")}`,
    [reactId],
  );

  const mapRef = useRef<MapplsMap | null>(null);
  const memMarkerRefs = useRef<MapplsMarker[]>([]);
  const pickingMarkerRef = useRef<MapplsMarker | null>(null);
  const pinMarkerRef = useRef<{ remove?: () => void } | null>(null);
  const mapClickHandlerRef = useRef<((e?: unknown) => void) | null>(null);
  const initialMemoryRef = useRef<Memory | undefined>(memories[0]);
  const lastFocusedPickKeyRef = useRef<string | undefined>(undefined);

  const mapplsKey = process.env.NEXT_PUBLIC_MAPPLS_MAP_KEY;

  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | undefined>(
    mapplsKey ? undefined : "Missing NEXT_PUBLIC_MAPPLS_MAP_KEY.",
  );

  // ── 1. Load SDK and initialise the map ────────────────────────
  useEffect(() => {
    if (!mapplsKey) return;
    const key = mapplsKey;
    let cancelled = false;

    const timeout = window.setTimeout(() => {
      if (!cancelled && !mapRef.current) {
        setMapError(
          "Mappls SDK took too long to load. Check the key and domain restrictions.",
        );
      }
    }, 10_000);

    async function init() {
      try {
        const pluginToken = await loadMapplsSdk(key);

        if (pluginToken) {
          loadScript(
            "mappls-web-sdk-plugins",
            `https://apis.mappls.com/advancedmaps/api/${encodeURIComponent(pluginToken)}/map_sdk_plugins?v=3.0&libraries=pinMarker`,
            8_000,
          ).catch(() => {
            // The map can still render without the pinMarker plugin; location
            // search falls back to map clicks when eLoc resolution is unavailable.
          });
        }
        if (cancelled) return;

        if (!window.mappls?.Map) {
          throw new Error("Mappls SDK loaded but Map API is unavailable.");
        }
        window.clearTimeout(timeout);

        const first = initialMemoryRef.current;
        const center = first?.coordinates ?? DEFAULT_CENTER;

        const map = new window.mappls.Map(mapId, {
          center: { lat: center.latitude, lng: center.longitude },
          zoom: first ? 12 : 5,
          zoomControl: true,
          geolocation: false,
          clickableIcons: false,
        });

        const onLoad = () => setIsMapReady(true);
        if (map.on) {
          map.on("load", onLoad);
        } else {
          map.addListener?.("load", onLoad);
        }

        mapRef.current = map;
        // Optimistically mark ready (some SDK versions fire "load" synchronously)
        setIsMapReady(true);
        setMapError(undefined);
      } catch (err) {
        if (!cancelled) {
          setMapError(
            err instanceof Error ? err.message : "Unable to load Mappls map.",
          );
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      memMarkerRefs.current.forEach((m) => m.remove?.());
      memMarkerRefs.current = [];
      pinMarkerRef.current?.remove?.();
      pinMarkerRef.current = null;
      pickingMarkerRef.current?.remove?.();
      pickingMarkerRef.current = null;
      mapRef.current?.remove?.();
      mapRef.current = null;
      setIsMapReady(false);
    };
  }, [mapId, mapplsKey]);

  // ── 2. Render / update memory markers ────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    const mappls = window.mappls;
    if (!map || !mappls?.Marker || !isMapReady) return;

    memMarkerRefs.current.forEach((m) => m.remove?.());
    memMarkerRefs.current = [];

    memMarkerRefs.current = memories.map((mem) => {
      const isActive = activeMemoryId === mem.id;
      const marker = new mappls.Marker({
        map,
        position: { lat: mem.coordinates.latitude, lng: mem.coordinates.longitude },
        html: memoryMarkerHtml(mem, isActive),
        width: isActive ? MEMORY_MARKER_SIZE + 8 : MEMORY_MARKER_SIZE,
        height: isActive ? MEMORY_MARKER_SIZE + 8 : MEMORY_MARKER_SIZE,
      });
      marker.addListener?.("click", () => onMemoryClick(mem));
      return marker;
    });
  }, [activeMemoryId, isMapReady, memories, onMemoryClick]);

  // ── 3. Focus map when a memory is selected from the sidebar ──
  useEffect(() => {
    if (!focusMemory || !mapRef.current || !isMapReady) return;
    focusMap(mapRef.current, focusMemory.coordinates);
  }, [focusMemory, isMapReady]);

  // ── 3b. Reset to the overview state when requested from the sidebar ──
  useEffect(() => {
    if (!resetViewKey || !mapRef.current || !isMapReady) return;
    showAllMemories(mapRef.current, memories);
  }, [isMapReady, memories, resetViewKey]);

  // ── 4. Map-click handler (only active while picking) ──────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    // Remove previous handler
    if (mapClickHandlerRef.current) {
      map.removeListener?.("click");
      mapClickHandlerRef.current = null;
    }

    if (!isPickingLocation) return;

    const handler = (e?: unknown) => {
      const pos = mapClickLatLng(e);
      if (pos) onMapClick(pos);
    };

    mapClickHandlerRef.current = handler;

    if (map.on) {
      map.on("click", handler);
    } else {
      map.addListener?.("click", handler);
    }

    // Cleanup when picking stops
    return () => {
      map.removeListener?.("click");
      mapClickHandlerRef.current = null;
    };
  }, [isMapReady, isPickingLocation, onMapClick]);

  // ── 5. Resolve Mappls pin to coordinates when REST hides lat/lng ──
  useEffect(() => {
    const map = mapRef.current;
    const mappls = window.mappls;
    if (!map || !mappls?.pinMarker || !isMapReady) return;

    pinMarkerRef.current?.remove?.();
    pinMarkerRef.current = null;

    if (!isPickingLocation || pickedPinPosition || !mapplsPinToResolve) return;

    let cancelled = false;
    let timeout: number | undefined;

    const resolvePin = (data?: unknown) => {
      if (cancelled) return;
      const center = latLngFromUnknown(data) ?? mapCenterLatLng(map);
      if (center) onMapplsPinResolved(center);
    };

    const markerLayer = mappls.pinMarker(
      {
        map,
        pin: mapplsPinToResolve,
        fitbounds: true,
        popupHtml: "Selected location",
        icon: { url: MEMORY_MARKER_ICON, width: 34, height: 46 },
      },
      (data) => {
        timeout = window.setTimeout(() => resolvePin(data), 250);
      },
    );

    pinMarkerRef.current = markerLayer ?? null;
    timeout = window.setTimeout(() => resolvePin(), 900);

    return () => {
      cancelled = true;
      if (timeout) window.clearTimeout(timeout);
      pinMarkerRef.current?.remove?.();
      pinMarkerRef.current = null;
    };
  }, [
    isMapReady,
    isPickingLocation,
    mapplsPinToResolve,
    onMapplsPinResolved,
    pickedPinPosition,
  ]);

  // ── 6. Picking (draggable) pin ────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    const mappls = window.mappls;
    if (!map || !mappls?.Marker || !isMapReady) return;

    // Remove picking marker when not picking or no position yet
    if (!isPickingLocation || !pickedPinPosition) {
      pickingMarkerRef.current?.remove?.();
      pickingMarkerRef.current = null;
      return;
    }

    const { lat, lng } = pickedPinPosition;
    const shouldFocusPickedPin =
      pickedPinFocusKey && lastFocusedPickKeyRef.current !== pickedPinFocusKey;

    if (pickingMarkerRef.current) {
      // Update existing marker position
      pickingMarkerRef.current.setPosition?.({ lat, lng });
      if (shouldFocusPickedPin) {
        focusMap(map, { latitude: lat, longitude: lng }, 18);
        lastFocusedPickKeyRef.current = pickedPinFocusKey;
      }
      return;
    }

    // Mappls anchors custom markers from the bottom-center of their marker box.
    // Keep the box height ending at the visual tip so the pin stays on the same
    // ground point at every zoom level.
    const marker = new mappls.Marker({
      map,
      position: { lat, lng },
      draggable: true,
      html: pickingMarkerHtml(),
      width: PICKING_MARKER_WIDTH,
      height: PICKING_MARKER_ANCHOR_HEIGHT,
    });

    marker.addListener?.("dragend", () => {
      const pos = markerLatLng(marker);
      if (pos) onPinDragged(pos);
    });

    pickingMarkerRef.current = marker;

    // Bring searched locations into a close view before the user confirms.
    focusMap(map, { latitude: lat, longitude: lng }, 18);
    lastFocusedPickKeyRef.current = pickedPinFocusKey;

    return () => {
      // Intentionally NOT removing here — managed by the outer isPickingLocation guard
    };
  }, [
    isMapReady,
    isPickingLocation,
    pickedPinFocusKey,
    pickedPinPosition,
    onPinDragged,
  ]);

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="relative h-full w-full bg-[var(--surface2)]">
      <div id={mapId} className="h-full w-full" />

      {/* Loading / error overlay */}
      {(!isMapReady || mapError) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--bg)]/90 p-6 text-center backdrop-blur-sm">
          <div className="max-w-sm rounded-2xl bg-[var(--surface)] p-5 shadow-2xl ring-1 ring-[var(--border)]">
            <p className="text-sm font-semibold text-[var(--heading)]">
              {mapError ? "Map unavailable" : "Loading map…"}
            </p>
            <p className="mt-2 text-xs leading-5 text-[var(--body)]/60">
              {mapError ?? "Preparing the map and memory pins…"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
