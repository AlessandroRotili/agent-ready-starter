import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { publicEnv } from "@/lib/env";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = publicEnv();
  if (env) {
    const supabase = createServerClient(env.url, env.key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (items) => {
          items.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          items.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });
    await supabase.auth.getClaims();
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

// Do not refresh sessions on public static pages or media.
export const config = {
  matcher: [
    "/account/:path*",
    "/admin/:path*",
    "/auth/:path*",
    "/api/:path*",
    "/login",
    "/signup",
    "/forgot-password",
  ],
};
