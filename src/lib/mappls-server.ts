type CachedToken = {
  value: string;
  tokenType: string;
  expiresAt: number;
};

export type MapplsAuth =
  | { mode: "oauth"; authorization: string }
  | { mode: "static"; accessToken: string };

let cachedToken: CachedToken | null = null;

function staticMapplsToken() {
  return process.env.MAPPLS_ACCESS_TOKEN?.trim() ?? "";
}

function hasOAuthCredentials() {
  return Boolean(
    process.env.MAPPLS_CLIENT_ID?.trim() && process.env.MAPPLS_CLIENT_SECRET?.trim(),
  );
}

async function generateMapplsToken(): Promise<CachedToken> {
  const clientId = process.env.MAPPLS_CLIENT_ID?.trim();
  const clientSecret = process.env.MAPPLS_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Mappls credentials. Add MAPPLS_ACCESS_TOKEN or MAPPLS_CLIENT_ID/MAPPLS_CLIENT_SECRET.",
    );
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch("https://outpost.mappls.com/api/security/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "romantic-timeline",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Mappls token request failed (${response.status}).`);
  }

  const data = (await response.json()) as {
    access_token?: string;
    token_type?: string;
    expires_in?: number;
  };

  if (!data.access_token) {
    throw new Error("Mappls token response did not include an access token.");
  }

  const expiresIn = typeof data.expires_in === "number" ? data.expires_in : 86_400;

  return {
    value: data.access_token,
    tokenType: data.token_type ?? "bearer",
    expiresAt: Date.now() + Math.max(expiresIn - 60, 60) * 1000,
  };
}

export async function getMapplsAuth(): Promise<MapplsAuth> {
  const staticToken = staticMapplsToken();
  if (staticToken) return { mode: "static", accessToken: staticToken };

  if (hasOAuthCredentials()) {
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
      return {
        mode: "oauth",
        authorization: `${cachedToken.tokenType} ${cachedToken.value}`,
      };
    }

    cachedToken = await generateMapplsToken();
    return {
      mode: "oauth",
      authorization: `${cachedToken.tokenType} ${cachedToken.value}`,
    };
  }

  const mapKeyFallback = process.env.NEXT_PUBLIC_MAPPLS_MAP_KEY?.trim();
  if (mapKeyFallback) return { mode: "static", accessToken: mapKeyFallback };

  throw new Error(
    "Missing Mappls credentials. Add MAPPLS_ACCESS_TOKEN or MAPPLS_CLIENT_ID/MAPPLS_CLIENT_SECRET.",
  );
}

export async function getMapplsPluginToken() {
  const staticToken = staticMapplsToken();
  if (staticToken) return staticToken;

  if (hasOAuthCredentials()) {
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
      return cachedToken.value;
    }

    cachedToken = await generateMapplsToken();
    return cachedToken.value;
  }

  return process.env.NEXT_PUBLIC_MAPPLS_MAP_KEY?.trim() ?? "";
}

export function mapplsApiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Mappls request failed.";

  return Response.json({ error: message }, { status: 502 });
}
