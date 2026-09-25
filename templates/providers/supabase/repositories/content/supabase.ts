import "server-only";
import { createClient } from "@supabase/supabase-js";
import { contentInput, type ContentRepository } from "@/domain/content";
import { ServiceNotConfiguredError } from "@/lib/errors";
// Anonymous client: RLS exposes only published rows. No session enters public cache.
function database() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new ServiceNotConfiguredError("Supabase");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
export const supabaseContentRepository: ContentRepository = {
  async listPublished(limit, offset) {
    const { data, error } = await database()
      .from("content_entries")
      .select("slug,title,summary,body,published")
      .eq("published", true)
      .order("slug")
      .range(offset, offset + limit - 1);
    if (error) throw new Error("Content query failed");
    return data.map((row) => contentInput.parse(row));
  },
  async findPublished(slug) {
    const { data, error } = await database()
      .from("content_entries")
      .select("slug,title,summary,body,published")
      .eq("published", true)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error("Content query failed");
    return data ? contentInput.parse(data) : null;
  },
};
