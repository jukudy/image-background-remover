import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentSession();
  return NextResponse.json(
    session ? { authenticated: true, session } : { authenticated: false, session: null },
    { headers: { "Cache-Control": "no-store, private" } }
  );
}
