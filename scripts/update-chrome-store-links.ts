/**
 * Non-destructive patch: point PinTwist, iScale Etsy, and iScale Merch at their
 * live Chrome Web Store listings and mark them available.
 *
 * Does not delete projects, upvotes, or comments.
 *
 * Usage:
 *   npx tsx scripts/update-chrome-store-links.ts
 *   # or: npm run update:chrome-store-links
 */
import { db } from "@/drizzle/db"
import { project } from "@/drizzle/db/schema"
import { eq } from "drizzle-orm"

import { CHROME_WEB_STORE } from "@/lib/chrome-store"

const UPDATES: Array<{
  slug: string
  websiteUrl: string
  githubUrl?: string
  description: string
  availability: "available"
  launchStatus: "launched"
}> = [
  {
    slug: "pintwist",
    websiteUrl: CHROME_WEB_STORE.pintwist,
    githubUrl: "https://github.com/iScale-Builders/pintwist",
    description:
      "PinTwist is the open-source Pinterest research extension for print-on-demand sellers: it overlays save counts, reactions, comments, repins, and creation dates on every pin, then lets you sort, filter, build a local catalog, and export CSV — 100% local, no account or backend. Free on the Chrome Web Store and open source (Apache-2.0) on GitHub.",
    availability: "available",
    launchStatus: "launched",
  },
  {
    slug: "iscale-etsy",
    websiteUrl: CHROME_WEB_STORE.iscaleEtsy,
    githubUrl: "https://github.com/iScale-Builders/iscale-etsy",
    description:
      "iScale Etsy is a local-first Chrome extension for Etsy product research: batch scrape jobs, search-results capture, local Shop View, and CSV import/export. Free on the Chrome Web Store — no backend, no account, no telemetry.",
    availability: "available",
    launchStatus: "launched",
  },
  {
    slug: "iscale-merch",
    websiteUrl: CHROME_WEB_STORE.iscaleMerch,
    description:
      "iScale Merch is the Merch by Amazon research extension for POD operators: BSR, recent-upload dates, competition density, scans, and local CSV exports right on Amazon pages. Free on the Chrome Web Store — research data stays on your device.",
    availability: "available",
    launchStatus: "launched",
  },
]

async function run() {
  const now = new Date()
  const results: Array<{ slug: string; updated: boolean }> = []

  for (const row of UPDATES) {
    const set: {
      websiteUrl: string
      description: string
      availability: string
      launchStatus: string
      updatedAt: Date
      githubUrl?: string
      scheduledLaunchDate: null
    } = {
      websiteUrl: row.websiteUrl,
      description: row.description,
      availability: row.availability,
      launchStatus: row.launchStatus,
      updatedAt: now,
      scheduledLaunchDate: null,
    }
    if (row.githubUrl) {
      set.githubUrl = row.githubUrl
    }

    const updated = await db.update(project).set(set).where(eq(project.slug, row.slug)).returning({
      slug: project.slug,
    })

    results.push({ slug: row.slug, updated: updated.length > 0 })
  }

  console.log(JSON.stringify({ results }, null, 2))

  const missing = results.filter((r) => !r.updated)
  if (missing.length) {
    console.error(
      `No project row found for: ${missing.map((m) => m.slug).join(", ")}. Check production slugs.`,
    )
    process.exit(1)
  }
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
