/**
 * Prefix a path to a file in /public with the GitHub Pages base path.
 * Always use this for static files — never hard-code "/coin.svg".
 */
export function withBase(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
