export function safeNext(value: string | null): string {
  if (!value || /[\\\x00-\x20]/.test(value)) return "/account";
  try {
    const origin = "https://internal.invalid";
    const url = new URL(value, origin);
    if (!value.startsWith("/") || url.origin !== origin) return "/account";
    if (!/^\/(account|admin)(\/|$)/.test(url.pathname)) return "/account";
    return url.pathname + url.search;
  } catch {
    return "/account";
  }
}
