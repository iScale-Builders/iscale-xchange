export const AVAILABILITY_OPTIONS = [
  { value: "coming_soon", label: "Coming soon" },
  { value: "testing", label: "Testing" },
  { value: "available", label: "Available" },
] as const

// The status badge is driven by the explicit `availability` field the
// submitter/owner sets. `status` (launch_status) and `websiteUrl` are kept only
// as a legacy fallback for rows that predate the availability field.
export function toolStatusLabel(
  status: string,
  websiteUrl?: string | null,
  availability?: string | null,
): "Coming soon" | "Testing" | "Available" {
  if (availability === "available") return "Available"
  if (availability === "testing") return "Testing"
  if (availability === "coming_soon") return "Coming soon"

  // Legacy fallback (no explicit availability): derive from url + launch status.
  if (websiteUrl === null || websiteUrl === "" || websiteUrl === undefined) return "Coming soon"
  if (status === "ongoing") return "Testing"
  return "Available"
}
