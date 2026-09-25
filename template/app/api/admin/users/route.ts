import { authenticated, HttpError, json, route } from "@/lib/http/server";

export async function GET(request: Request) {
  return route(async () => {
    const { client, user } = await authenticated();
    const { data: role, error: roleError } = await client
      .from("admin_members")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (roleError || !role) throw new HttpError(403, "Accesso non consentito.");
    const raw = Number(new URL(request.url).searchParams.get("page") || 0);
    const page = Number.isInteger(raw) && raw >= 0 ? Math.min(raw, 10000) : 0;
    const { data, error } = await client
      .from("profiles")
      .select("id,display_name,created_at")
      .order("created_at", { ascending: false })
      .order("id")
      .range(page * 20, page * 20 + 20);
    if (error) throw new HttpError(500, "Impossibile caricare gli utenti.");
    return json({ users: data.slice(0, 20), hasMore: data.length > 20 });
  });
}
