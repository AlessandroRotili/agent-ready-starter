import { NextResponse } from "next/server";
import { sessionClient } from "@/lib/db/server";
import { siteOrigin } from "@/lib/env";
import { privateHeaders } from "@/lib/http/security";

// Token-hash email links work even when opened on a different device.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const token_hash = params.get("token_hash");
  const type = params.get("type");
  const client = await sessionClient();
  if (client && token_hash && (type === "signup" || type === "recovery")) {
    const { error } = await client.auth.verifyOtp({ token_hash, type });
    if (!error)
      return NextResponse.redirect(
        new URL(
          type === "recovery" ? "/account/password" : "/account",
          siteOrigin(),
        ),
        { headers: privateHeaders },
      );
  }
  return NextResponse.redirect(
    new URL("/login?error=confirmation", siteOrigin()),
    { headers: privateHeaders },
  );
}
