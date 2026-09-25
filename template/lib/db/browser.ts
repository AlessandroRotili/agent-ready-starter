"use client";
import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";

export function browserClient() {
  const env = publicEnv();
  if (!env) throw new Error("Servizio temporaneamente non disponibile.");
  return createBrowserClient(env.url, env.key);
}
