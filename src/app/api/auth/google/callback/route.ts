import { NextRequest, NextResponse } from "next/server";
import { createSession, consumeOAuthState } from "@/lib/auth/session";
import { exchangeGoogleCode, fetchGoogleUserProfile, getGoogleClientConfig } from "@/lib/auth/google";
import { upsertGoogleUser } from "@/lib/auth/users";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const oauthError = request.nextUrl.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(new URL("/?auth_error=google_denied", request.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/?auth_error=google_invalid_callback", request.url));
  }

  const stateRow = await consumeOAuthState(state);
  if (!stateRow) {
    return NextResponse.redirect(new URL("/?auth_error=google_state_invalid", request.url));
  }

  try {
    const { clientId, clientSecret, redirectUri } = await getGoogleClientConfig();
    const accessToken = await exchangeGoogleCode({
      code,
      codeVerifier: stateRow.code_verifier,
      clientId,
      clientSecret,
      redirectUri,
    });
    const profile = await fetchGoogleUserProfile(accessToken);
    const userId = await upsertGoogleUser(profile);
    await createSession(
      userId,
      request.headers.get("cf-connecting-ip") || null,
      request.headers.get("user-agent") || null
    );

    return NextResponse.redirect(new URL(stateRow.return_to, request.url));
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown OAuth callback error";
    console.error("Google OAuth callback failed:", detail);

    const url = new URL("/?auth_error=google_exchange_failed", request.url);
    if (process.env.NODE_ENV !== "production") {
      url.searchParams.set("auth_error_detail", detail.slice(0, 180));
    }
    return NextResponse.redirect(url);
  }
}
