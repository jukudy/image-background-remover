import { NextRequest, NextResponse } from "next/server";
import { buildGoogleAuthorizationUrl, getGoogleClientConfig } from "@/lib/auth/google";
import { getSiteUrl, isLocalhostUrl, sanitizeReturnTo } from "@/lib/auth/config";
import { createOpaqueToken, pkceChallengeFromVerifier } from "@/lib/auth/crypto";
import { storeOAuthState } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { clientId, redirectUri } = await getGoogleClientConfig();
  const localSiteUrl = getSiteUrl();
  if (isLocalhostUrl(localSiteUrl) && !isLocalhostUrl(redirectUri)) {
    return NextResponse.json(
      {
        error: {
          code: "LOCAL_GOOGLE_CALLBACK_NOT_CONFIGURED",
          message:
            "Local Google OAuth is not fully configured yet. Set GOOGLE_OAUTH_REDIRECT_URI to http://localhost:3000/api/auth/google/callback and add that same redirect URI in Google Cloud Console.",
        },
      },
      { status: 400, headers: { "Cache-Control": "no-store, private" } }
    );
  }
  const state = createOpaqueToken(24);
  const codeVerifier = createOpaqueToken(48);
  const codeChallenge = await pkceChallengeFromVerifier(codeVerifier);
  const returnTo = sanitizeReturnTo(request.nextUrl.searchParams.get("returnTo"));

  await storeOAuthState(state, codeVerifier, returnTo);

  return NextResponse.redirect(
    buildGoogleAuthorizationUrl({
      clientId,
      redirectUri,
      state,
      codeChallenge,
    })
  );
}
