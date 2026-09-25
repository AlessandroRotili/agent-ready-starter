import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { sessionClient } from "@/lib/db/server";

export const currentUser = cache(async () => {
  const client = await sessionClient();
  if (!client) return null;
  const { data, error } = await client.auth.getUser();
  return !error ? data.user : null;
});

export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}

export async function isAdmin(id: string) {
  const client = await sessionClient();
  if (!client) return false;
  const { data, error } = await client
    .from("admin_members")
    .select("user_id")
    .eq("user_id", id)
    .maybeSingle();
  return !error && Boolean(data);
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!(await isAdmin(user.id))) redirect("/account");
  return user;
}
