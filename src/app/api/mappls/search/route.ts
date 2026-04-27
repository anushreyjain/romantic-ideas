import { getMapplsAuth, mapplsApiError } from "@/lib/mappls-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return Response.json({ suggestedLocations: [] });
  }

  try {
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
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        typeof data?.error === "string"
          ? data.error
          : `Mappls search failed (${response.status}).`;
      return Response.json({ error: message }, { status: response.status });
    }

    return Response.json(data);
  } catch (error) {
    return mapplsApiError(error);
  }
}
