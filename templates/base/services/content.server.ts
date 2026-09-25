import "server-only";
import { unstable_cache } from "next/cache";
import { repository } from "@/repositories/content/selected";
import { createContentService } from "./content-service";
import { publicContentCache } from "@/config/cache";
const service = createContentService(repository);
// This cache contains only published, anonymous content. Never add session data.
export const listPublicContent = unstable_cache(
  (page: number) => service.list(page),
  ["public-content-list"],
  { revalidate: publicContentCache.seconds, tags: [publicContentCache.tag] },
);
export const findPublicContent = unstable_cache(
  (slug: string) => service.find(slug),
  ["public-content-detail"],
  { revalidate: publicContentCache.seconds, tags: [publicContentCache.tag] },
);
