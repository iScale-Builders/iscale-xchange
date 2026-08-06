export const BASE_PATH = "/iscalexchange"

/**
 * Prefix browser-authored URLs that Next.js does not base-path automatically
 * (plain img src values, fetch calls, and server redirects).
 */
export function appPath(path: string): string {
  if (!path.startsWith("/")) return path
  if (path === "/") return BASE_PATH
  if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) return path
  return `${BASE_PATH}${path}`
}
