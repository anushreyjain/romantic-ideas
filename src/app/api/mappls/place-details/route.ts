import { getMapplsAuth, mapplsApiError } from "@/lib/mappls-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eLoc = searchParams.get("eLoc")?.trim();

  if (!eLoc) {
    return Response.json({ error: "Missing eLoc." }, { status: 400 });
  }

  try {
    const auth = await getMapplsAuth();
    const url = new URL(
      auth.mode === "oauth"
        ? `https://explore.mappls.com/apis/O2O/entity/${encodeURIComponent(eLoc)}`
        : `https://place.mappls.com/O2O/entity/place-details/${encodeURIComponent(eLoc)}`,
    );

    const response =
      auth.mode === "oauth"
        ? await fetch(url, {
            headers: { Authorization: auth.authorization },
            cache: "no-store",
          })
        : await fetch(`${url}?access_token=${encodeURIComponent(auth.accessToken)}`, {
            cache: "no-store",
          });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        typeof data?.error === "string"
          ? data.error
          : `Mappls place details failed (${response.status}).`;
      return Response.json({ error: message }, { status: response.status });
    }

    return Response.json(data);
  } catch (error) {
    return mapplsApiError(error);
  }
}
