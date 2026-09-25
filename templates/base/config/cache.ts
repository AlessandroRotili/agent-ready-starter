// Only anonymous, published content may use these shared caching defaults.
export const publicContentCache = {
  seconds: 300,
  tag: "public-content",
} as const;
export const privateResponseHeaders = {
  "Cache-Control": "private, no-store",
} as const;
