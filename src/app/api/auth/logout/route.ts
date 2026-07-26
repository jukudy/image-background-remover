import { NextRequest, NextResponse } from "next/server";
import { destroySessionFromCookie } from "@/lib/auth/session";
import { sanitizeReturnTo } from "@/lib/auth/config";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  await destroySessionFromCookie();
  const returnTo = sanitizeReturnTo(request.nextUrl.searchParams.get("returnTo"));
  return NextResponse.redirect(new URL(returnTo, request.url));
}
