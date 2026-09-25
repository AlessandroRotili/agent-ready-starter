import type { ContentRepository } from "@/domain/content";
import { ServiceNotConfiguredError } from "@/lib/errors";
// Implement this port for Postgres/MySQL/SQLite/HTTP. No provider SDK in services or UI.
// Filter published rows in the DB, select explicit columns and use bounded queries.
export const genericContentRepository: ContentRepository = {
  async listPublished() {
    throw new ServiceNotConfiguredError("Repository contenuti");
  },
  async findPublished() {
    throw new ServiceNotConfiguredError("Repository contenuti");
  },
};
