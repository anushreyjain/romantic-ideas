"use client";

import { useCallback, useEffect, useState } from "react";
import type { Memory } from "@/data/memories";
import { getMemories, addMemory, deleteMemory } from "@/lib/memories-api";
import { isSupabaseConfigured } from "@/lib/supabase";
import { AddMemoryModal } from "./AddMemoryModal";
import {
  LocationPickerPanel,
  type SearchedLocation,
} from "./LocationPickerPanel";
import { MapplsMemoryMap, type PickedMapplsLocation } from "./MapplsMemoryMap";
import { MemoryModal } from "./MemoryModal";
import { MemorySidebar } from "./MemorySidebar";

type PickedPin = { lat: number; lng: number };

export function MemoryMap() {
  // ── Data ──────────────────────────────────────────────────────
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();

  // ── Map selection state ───────────────────────────────────────
  const [activeMemoryId, setActiveMemoryId] = useState<string>();
  const [focusMemory, setFocusMemory] = useState<Memory>();
  const [resetViewKey, setResetViewKey] = useState(0);
  const [modalMemory, setModalMemory] = useState<Memory>();

  // ── Location picking state ────────────────────────────────────
  /** True while the location picker panel is visible. */
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  /**
   * The current result from the search panel (name / eLoc metadata).
   * Updated when user selects an autosuggest result.
   */
  const [searchedLocation, setSearchedLocation] =
    useState<SearchedLocation | null>(null);
  /**
   * The live pin position on the map (lat/lng).
   * Starts from searchedLocation; updated on drag or map-click.
   */
  const [pickedPin, setPickedPin] = useState<PickedPin | null>(null);
  const [pickedPinFocusKey, setPickedPinFocusKey] = useState<string>();

  /**
   * Set when user confirms the picked pin.
   * Opens AddMemoryModal.
   */
  const [pendingLocation, setPendingLocation] =
    useState<PickedMapplsLocation | null>(null);

  // ── Load memories ─────────────────────────────────────────────
  useEffect(() => {
    getMemories()
      .then(setMemories)
      .catch((e: Error) => setLoadError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  // ── Memory selection ──────────────────────────────────────────
  const focusMemoryOnly = useCallback((memory: Memory) => {
    setActiveMemoryId(memory.id);
    setFocusMemory({ ...memory });
  }, []);

  const openMemory = useCallback((memory: Memory) => {
    setActiveMemoryId(memory.id);
    setFocusMemory({ ...memory });
    setModalMemory(memory);
  }, []);

  // ── Location picker callbacks ─────────────────────────────────

  /** Called when user picks a place from the autosuggest dropdown. */
  const handleLocationSearched = useCallback((loc: SearchedLocation) => {
    setSearchedLocation(loc);
    if (Number.isFinite(loc.lat) && Number.isFinite(loc.lng)) {
      setPickedPin({ lat: loc.lat!, lng: loc.lng! });
      setPickedPinFocusKey(
        loc.eLoc ?? `${loc.locationName}:${loc.lat}:${loc.lng}`,
      );
    } else {
      setPickedPin(null);
      setPickedPinFocusKey(undefined);
    }
  }, []);

  /** Called when user drags the pin on the map. */
  const handlePinDragged = useCallback((pos: PickedPin) => {
    setPickedPin(pos);
    setPickedPinFocusKey(undefined);
  }, []);

  /**
   * Called when user clicks anywhere on the map while picking.
   * Drops / moves the pin to that spot.
   */
  const handleMapClick = useCallback((pos: PickedPin) => {
    setPickedPin(pos);
    setPickedPinFocusKey(undefined);
    // If no name yet (manual drop), give it a default
    setSearchedLocation((prev) =>
      prev
        ? prev
        : {
            lat: pos.lat,
            lng: pos.lng,
            locationName: "Custom location",
            address: "",
          },
    );
  }, []);

  /** Called when user clicks Confirm in the picker panel. */
  const handleConfirm = useCallback(() => {
    if (!pickedPin || !searchedLocation) return;
    setPendingLocation({
      coordinates: {
        latitude: pickedPin.lat,
        longitude: pickedPin.lng,
      },
      locationName: searchedLocation.locationName,
      eLoc: searchedLocation.eLoc,
      mapplsPin: searchedLocation.eLoc,
    });
    setIsPickingLocation(false);
    setSearchedLocation(null);
    setPickedPin(null);
    setPickedPinFocusKey(undefined);
  }, [pickedPin, searchedLocation]);

  const cancelPicking = useCallback(() => {
    setIsPickingLocation(false);
    setSearchedLocation(null);
    setPickedPin(null);
    setPickedPinFocusKey(undefined);
  }, []);

  const startAddPin = useCallback(() => {
    setIsPickingLocation(true);
    setSearchedLocation(null);
    setPickedPin(null);
    setPickedPinFocusKey(undefined);
  }, []);

  const resetMapView = useCallback(() => {
    setActiveMemoryId(undefined);
    setFocusMemory(undefined);
    setModalMemory(undefined);
    setIsPickingLocation(false);
    setSearchedLocation(null);
    setPickedPin(null);
    setPickedPinFocusKey(undefined);
    setPendingLocation(null);
    setResetViewKey((key) => key + 1);
  }, []);

  // ── CRUD ──────────────────────────────────────────────────────
  const handleSaveMemory = useCallback(async (data: Omit<Memory, "id">) => {
    const newMemory = await addMemory(data);
    setMemories((prev) =>
      [...prev, newMemory].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    );
    setPendingLocation(null);
    setActiveMemoryId(newMemory.id);
    setFocusMemory(newMemory);
    setModalMemory(newMemory);
  }, []);

  const handleDeleteMemory = useCallback(async (id: string) => {
    await deleteMemory(id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
    setModalMemory(undefined);
    setActiveMemoryId((current) => (current === id ? undefined : current));
    setFocusMemory((current) => (current?.id === id ? undefined : current));
    setResetViewKey((key) => key + 1);
  }, []);

  // ── Render ────────────────────────────────────────────────────
  return (
    <main className="flex h-dvh overflow-hidden bg-[var(--bg)] text-[var(--body)]">
      {/* Left sidebar — desktop */}
      <div className="hidden md:flex md:flex-col">
        <MemorySidebar
          memories={memories}
          isLoading={isLoading}
          selectedMemoryId={activeMemoryId}
          onSelectMemory={focusMemoryOnly}
          onResetView={resetMapView}
          onStartAddPin={startAddPin}
        />
      </div>

      {/* Map area */}
      <div className="relative flex-1">
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg)]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--cta)]" />
              <p className="text-xs text-[var(--body)]/50">Loading memories…</p>
            </div>
          </div>
        )}

        {!isLoading && (
          <MapplsMemoryMap
            memories={memories}
            activeMemoryId={activeMemoryId}
            focusMemory={focusMemory}
            resetViewKey={resetViewKey}
            isPickingLocation={isPickingLocation}
            pickedPinPosition={pickedPin}
            pickedPinFocusKey={isPickingLocation ? pickedPinFocusKey : undefined}
            mapplsPinToResolve={
              isPickingLocation && !pickedPin ? searchedLocation?.eLoc : undefined
            }
            onMemoryClick={openMemory}
            onPinDragged={handlePinDragged}
            onMapplsPinResolved={handlePinDragged}
            onMapClick={handleMapClick}
          />
        )}

        {/* Location picker panel — overlaid on top of the map */}
        {isPickingLocation && (
          <LocationPickerPanel
            pickedPin={pickedPin}
            confirmedName={searchedLocation?.locationName}
            onLocationSearched={handleLocationSearched}
            onConfirm={handleConfirm}
            onCancel={cancelPicking}
          />
        )}

        {/* Demo-mode banner */}
        {!isSupabaseConfigured && (
          <div className="absolute left-1/2 top-4 z-30 w-max max-w-[90vw] -translate-x-1/2 rounded-xl bg-[var(--surface)] px-4 py-2.5 text-xs text-[var(--body)] shadow-lg ring-1 ring-[var(--border)]">
            <span className="font-semibold text-[var(--cta)]">Demo mode</span>
            {" — "}add your Supabase keys to save memories permanently.
          </div>
        )}

        {/* Error toast */}
        {loadError && (
          <div className="absolute left-1/2 top-14 z-30 -translate-x-1/2 rounded-xl bg-[var(--surface)] px-4 py-3 text-sm text-[var(--cta)] shadow-lg ring-1 ring-[var(--border)]">
            {loadError}
          </div>
        )}

        {!isLoading && !loadError && memories.length === 0 && (
          <div className="pointer-events-none absolute left-1/2 top-4 z-30 w-max max-w-[90vw] -translate-x-1/2 rounded-xl bg-[var(--surface)] px-4 py-3 text-center text-sm text-[var(--body)] shadow-lg ring-1 ring-[var(--border)]">
            No memories in the database yet. Add your first pin to begin.
          </div>
        )}

        {/* Mobile bottom drawer */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex md:hidden">
          <MemorySidebar
            memories={memories}
            isLoading={isLoading}
            selectedMemoryId={activeMemoryId}
            onSelectMemory={focusMemoryOnly}
            onResetView={resetMapView}
            onStartAddPin={startAddPin}
          />
        </div>
      </div>

      {/* Memory story modal */}
      <MemoryModal
        memory={modalMemory}
        onClose={() => setModalMemory(undefined)}
        onDelete={handleDeleteMemory}
      />

      {/* Add-memory form — shown after confirming a picked location */}
      {pendingLocation && (
        <AddMemoryModal
          coordinates={pendingLocation.coordinates}
          initialLocationName={pendingLocation.locationName}
          mapplsPin={pendingLocation.mapplsPin}
          eLoc={pendingLocation.eLoc}
          onSave={handleSaveMemory}
          onClose={() => setPendingLocation(null)}
        />
      )}
    </main>
  );
}
