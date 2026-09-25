import type { ContentRepository } from "@/domain/content";
import { entries } from "@/content/entries";
export const localContentRepository: ContentRepository = {
  async listPublished(limit, offset) {
    return entries
      .filter((item) => item.published)
      .slice(offset, offset + limit)
      .map((item) => ({ ...item }));
  },
  async findPublished(slug) {
    const entry = entries.find((item) => item.slug === slug && item.published);
    return entry ? { ...entry } : null;
  },
};
