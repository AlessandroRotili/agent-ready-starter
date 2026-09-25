import { z } from "zod";
export const contentInput = z
  .object({
    slug: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().trim().min(1).max(160),
    summary: z.string().trim().max(300),
    body: z.string().trim().max(20000),
    published: z.boolean(),
  })
  .strict();
export type ContentEntry = z.infer<typeof contentInput>;
export interface ContentRepository {
  listPublished(limit: number, offset: number): Promise<ContentEntry[]>;
  findPublished(slug: string): Promise<ContentEntry | null>;
}
