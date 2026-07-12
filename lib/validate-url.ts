// Accepts only real web links. Rejects javascript:, data:, vbscript:, and any
// other non-web scheme that becomes XSS or phishing when rendered into an href.
// Shared by the submit and edit paths so both enforce the same rule.
export function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}
