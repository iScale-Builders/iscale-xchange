/** Canonical Chrome Web Store listings for iScaleLabs extensions. */
export const CHROME_WEB_STORE = {
  pintwist: "https://chromewebstore.google.com/detail/jpafibmmnckjkpanchflenfbmggldmkk",
  iscaleEtsy: "https://chromewebstore.google.com/detail/fmeiigklgemlfcnpbdjeipdkogieidkm",
  iscaleMerch: "https://chromewebstore.google.com/detail/cdahaaaepjicdklfgohgfkmocnicjffg",
} as const

export function isChromeWebStoreUrl(url?: string | null): boolean {
  if (!url) return false
  return /chromewebstore\.google\.com/i.test(url)
}

/** Sidebar / CTA label for a project's primary external URL. */
export function externalProjectLinkLabel(url?: string | null): string {
  if (!url) return "Visit Website"
  if (isChromeWebStoreUrl(url)) return "Install from Chrome Web Store"
  if (/github\.com/i.test(url)) return "View on GitHub"
  return "Visit Website"
}
