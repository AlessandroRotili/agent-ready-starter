export const imageWidths = [480, 960, 1600] as const;
// withoutEnlargement means small originals have smaller actual pixel widths.
export function imageSourceSet(hash: string, originalWidth: number, format: 'webp' | 'avif') {
  if (!Number.isInteger(originalWidth) || originalWidth < 1) throw new Error('Invalid image width');
  const variants = new Map(imageWidths.map(width => [Math.min(width, originalWidth), `/media/immutable/${imageVariantName(hash, width, format)}`]));
  return [...variants].map(([width, src]) => `${src} ${width}w`).join(', ');
}
export function imageVariantName(
  hash: string,
  width: number,
  format: "webp" | "avif",
) {
  if (
    !/^[a-f0-9]{16}$/.test(hash) ||
    !imageWidths.includes(width as (typeof imageWidths)[number])
  )
    throw new Error("Invalid media variant");
  return `${hash}-${width}.${format}`;
}
