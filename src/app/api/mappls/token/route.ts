import { getMapplsPluginToken, mapplsApiError } from "@/lib/mappls-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const accessToken = await getMapplsPluginToken();

    if (!accessToken) {
      return Response.json({ error: "Missing Mappls token." }, { status: 500 });
    }

    return Response.json({ accessToken });
  } catch (error) {
    return mapplsApiError(error);
  }
}
