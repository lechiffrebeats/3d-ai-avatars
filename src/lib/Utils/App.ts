export const ASSET_VERSION =
  import.meta.env.VITE_BUILD ??
  (import.meta.env.DEV ? String(Date.now()) : "1");

export function withVersion(url: string) {
  return `${url}${url.includes("?") ? "&" : "?"}v=${ASSET_VERSION}`;
}