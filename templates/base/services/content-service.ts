import type { ContentRepository } from "@/domain/content";
// Business contract independent of Next.js, SQL dialect and provider SDKs.
export function createContentService(repository: ContentRepository) {
  return {
    async list(page = 0) {
      if (!Number.isSafeInteger(page) || page < 0 || page > 10000)
        throw new RangeError("Invalid page");
      const rows = await repository.listPublished(13, page * 12);
      // Defense in depth: a provider regression must not expose a draft.
      const published = rows.filter((entry) => entry.published);
      return {
        entries: published.slice(0, 12),
        hasMore: published.length > 12,
      };
    },
    async find(slug: string) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100)
        return null;
      const entry = await repository.findPublished(slug);
      return entry?.published ? entry : null;
    },
  };
}
