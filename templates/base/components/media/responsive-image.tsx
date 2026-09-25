import { imageSourceSet, imageVariantName } from "@/lib/media/variants";
// For files created by media:optimize: already resized, no second optimizer needed.
export function ResponsiveImage({
  hash,
  alt,
  width,
  height,
  eager = false,
  sizes = "(max-width: 768px) 100vw, 960px",
}: {
  hash: string;
  alt: string;
  width: number;
  height: number;
  eager?: boolean;
  sizes?: string;
}) {
  const set = (format: "webp" | "avif") => imageSourceSet(hash, width, format);
  return (
    <picture>
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      {/* Explicit pre-sized variants avoid paying for duplicate transformations. */}
      <img
        src={`/media/immutable/${imageVariantName(hash, 960, "webp")}`}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        style={{ maxWidth: "100%", height: "auto" }}
      />
    </picture>
  );
}
