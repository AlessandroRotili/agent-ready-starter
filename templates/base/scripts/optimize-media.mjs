import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir, realpath } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
const input = process.argv[2];
if (!input) {
  console.error("Usage: npm run media:optimize -- /path/to/public-image.jpg");
  process.exit(1);
}
const bytes = await readFile(await realpath(input));
const metadata = await sharp(bytes, { limitInputPixels: 40000000 }).metadata();
if (
  !["jpeg", "png", "webp", "avif"].includes(metadata.format) ||
  (metadata.pages ?? 1) > 1
)
  throw new Error("Use a still JPEG/PNG/WebP/AVIF image.");
// Include pipeline version in identity: changing settings must change immutable URLs.
const hash = createHash("sha256")
  .update("variants-v1-quality75-rotate")
  .update(bytes)
  .digest("hex")
  .slice(0, 16);
const output = path.resolve("public/media/immutable");
await mkdir(output, { recursive: true });
const variants = [];
for (const width of [480, 960, 1600])
  for (const format of ["webp", "avif"]) {
    const name = `${hash}-${width}.${format}`;
    const result = await sharp(bytes, { limitInputPixels: 40000000 })
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .toFormat(format, { quality: 75 })
      .toBuffer({ resolveWithObject: true });
    const destination = path.join(output, name);
    try {
      await writeFile(destination, result.data, { flag: "wx" });
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }
    variants.push({
      src: `/media/immutable/${name}`,
      width: result.info.width,
      height: result.info.height,
      bytes: result.data.length,
    });
  }
await writeFile(
  path.join(output, `${hash}.json`),
  JSON.stringify(variants, null, 2) + "\n",
);
console.log(JSON.stringify(variants, null, 2));
