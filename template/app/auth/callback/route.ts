import { NextResponse } from "next/server";
import { sessionClient } from "@/lib/db/server";
import { safeNext } from "@/lib/auth/redirect";
import { siteOrigin } from "@/lib/env";
import { privateHeaders } from "@/lib/http/security";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const client = await sessionClient();
  const code = params.get("code");
  if (client && code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(safeNext(params.get("next")), siteOrigin()),
        { headers: privateHeaders },
      );
  }
  return NextResponse.redirect(
    new URL("/login?error=confirmation", siteOrigin()),
    { headers: privateHeaders },
  );
}
