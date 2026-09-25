export function sameOrigin(request: Request, origin: string) {
  // Authenticated writes from the browser must have an exact Origin match.
  return request.headers.get("origin") === origin;
}

export const privateHeaders = { "Cache-Control": "private, no-store" };
