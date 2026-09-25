import { z } from "zod";
export const documentTypes = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "text/plain": "txt",
} as const;
export const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;
export const documentType = z.enum([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
]);
export const documentName = z
  .string()
  .trim()
  .min(1)
  .max(180)
  .refine((value) => !/[\x00-\x1f]/.test(value));
export const uploadInput = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("prepare"),
    name: documentName,
    type: documentType,
    size: z.number().int().min(1).max(MAX_DOCUMENT_BYTES),
  }),
  z.object({
    action: z.literal("complete"),
    id: z.uuid(),
    name: documentName,
    type: documentType,
  }),
]);
export function documentPath(
  owner: string,
  id: string,
  type: keyof typeof documentTypes,
) {
  return `${z.uuid().parse(owner)}/${z.uuid().parse(id)}.${documentTypes[type]}`;
}
