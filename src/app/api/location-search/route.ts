import { getMapplsAuth } from "@/lib/mappls-server";

export const dynamic = "force-dynamic";

type UnifiedSuggestion = {
  eLoc?: string;
  placeName?: string;
  placeAddress?: string;
  latitude?: string | number;
  longitude?: string | number;
  type?: string;
  source?: "mappls" | "serpapi";
};

type MapplsSearchResponse = {
  suggestedLocations?: UnifiedSuggestion[];
  userAddedLocations?: UnifiedSuggestion[];
};

type SerpApiPlace = {
  title?: string;
  name?: string;
  address?: string;
  place_id?: string;
  data_id?: string;
  gps_coordinates?: {
    latitude?: number;
    longitude?: number;
  };
};

type SerpApiSearchResponse = {
  local_results?: SerpApiPlace[];
  place_results?: SerpApiPlace;
  error?: string;
};

function withMapplsSource(data: MapplsSearchResponse): MapplsSearchResponse {
  return {
    suggestedLocations: (data.suggestedLocations ?? []).map((result) => ({
      ...result,
      source: "mappls",
    })),
    userAddedLocations: (data.userAddedLocations ?? []).map((result) => ({
      ...result,
      source: "mappls",
    })),
  };
}

function mapplsResultCount(data: MapplsSearchResponse | null) {
  return (
    (data?.suggestedLocations?.length ?? 0) +
    (data?.userAddedLocations?.length ?? 0)
  );
}

async function searchMappls(query: string): Promise<MapplsSearchResponse | null> {
  const auth = await getMapplsAuth();
  const url = new URL(
    auth.mode === "oauth"
      ? "https://atlas.mappls.com/api/places/search/json"
      : "https://search.mappls.com/search/places/autosuggest/json",
  );
  url.searchParams.set("query", query);
  url.searchParams.set("region", "IND");

  const response =
    auth.mode === "oauth"
      ? await fetch(url, {
          headers: { Authorization: auth.authorization },
          cache: "no-store",
        })
      : await fetch(`${url}&access_token=${encodeURIComponent(auth.accessToken)}`, {
          cache: "no-store",
        });

  if (!response.ok) return null;

  const data = (await response.json().catch(() => ({}))) as MapplsSearchResponse;
  return withMapplsSource(data);
}

function serpApiPlaceToSuggestion(place: SerpApiPlace): UnifiedSuggestion | null {
  const lat = place.gps_coordinates?.latitude;
  const lng = place.gps_coordinates?.longitude;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    placeName: place.title ?? place.name ?? "Selected location",
    placeAddress: place.address ?? "",
    latitude: lat,
    longitude: lng,
    type: "serpapi",
    source: "serpapi",
  };
}

function uniqueSuggestions(results: UnifiedSuggestion[]) {
  const seen = new Set<string>();

  return results.filter((result) => {
    const key = [
      result.placeName?.toLowerCase() ?? "",
      result.placeAddress?.toLowerCase() ?? "",
      result.latitude ?? "",
      result.longitude ?? "",
    ].join("|");

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function searchSerpApi(query: string): Promise<MapplsSearchResponse> {
  const apiKey = process.env.SERPAPI_API_KEY?.trim();
  if (!apiKey) return { suggestedLocations: [] };

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_maps");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "search");
  url.searchParams.set("gl", "in");
  url.searchParams.set("hl", "en");
  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url, { cache: "no-store" });
  const data = (await response.json().catch(() => ({}))) as SerpApiSearchResponse;

  if (!response.ok || data.error) {
    return { suggestedLocations: [] };
  }

  const directResult = data.place_results ? [data.place_results] : [];
  const places = [...directResult, ...(data.local_results ?? [])];
  const suggestedLocations = uniqueSuggestions(
    places
      .map(serpApiPlaceToSuggestion)
      .filter((result): result is UnifiedSuggestion => Boolean(result)),
  );

  return { suggestedLocations };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return Response.json({ suggestedLocations: [] });
  }

  const mapplsResults = await searchMappls(query).catch(() => null);
  if (mapplsResultCount(mapplsResults) > 0) {
    return Response.json(mapplsResults);
  }

  const serpApiResults = await searchSerpApi(query).catch(() => ({
    suggestedLocations: [],
  }));
  return Response.json(serpApiResults);
}
