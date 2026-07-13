import { createHash } from "crypto"

import { NextRequest, NextResponse } from "next/server"

import { db } from "@/drizzle/db"
import { pageView } from "@/drizzle/db/schema"

export const runtime = "nodejs"

// Self-identified bots plus obvious scripted clients. Real-browser headless
// traffic can't be fully caught server-side; this keeps the counts honest
// without pretending to be a fraud filter.
const BOT_UA =
  /bot|crawl|spider|slurp|bingpreview|headless|lighthouse|pingdom|uptime|monitor|scrap|python|curl|wget|node-fetch|axios|go-http/i

// First-party page-view beacon. Fire-and-forget from the client; always
// answers 204 so tracking can never surface an error on the page. Stores no
// PII — the visitor id is a one-way hash that rotates daily.
export async function POST(request: NextRequest) {
  try {
    const ua = request.headers.get("user-agent") ?? ""
    if (!ua || BOT_UA.test(ua)) {
      return new NextResponse(null, { status: 204 })
    }

    const body = (await request.json().catch(() => null)) as {
      path?: unknown
      referrer?: unknown
    } | null

    // Only site-relative page paths, hard-bounded against junk payloads.
    const rawPath = typeof body?.path === "string" ? body.path : ""
    if (!rawPath.startsWith("/") || rawPath.startsWith("//") || rawPath.length > 300) {
      return new NextResponse(null, { status: 204 })
    }
    const path = rawPath.split(/[?#]/)[0] || "/"
    if (path.startsWith("/admin") || path.startsWith("/api") || path.startsWith("/_")) {
      return new NextResponse(null, { status: 204 })
    }

    // Referrers are reduced to a hostname; same-site navigation is noise, not
    // acquisition data.
    let referrer: string | null = null
    if (typeof body?.referrer === "string" && body.referrer) {
      try {
        const host = new URL(body.referrer).hostname
        referrer = host && !host.endsWith("iscalexchange.com") ? host.slice(0, 120) : null
      } catch {
        referrer = null
      }
    }

    const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown"
    const day = new Date().toISOString().slice(0, 10)
    const visitor = createHash("sha256")
      .update(`ixc-pulse|${day}|${ip}|${ua}`)
      .digest("hex")
      .slice(0, 24)

    const device = /mobi|iphone|android/i.test(ua)
      ? /ipad|tablet/i.test(ua)
        ? "tablet"
        : "mobile"
      : /ipad|tablet/i.test(ua)
        ? "tablet"
        : "desktop"

    await db.insert(pageView).values({
      path,
      referrer,
      visitor,
      country: request.headers.get("x-vercel-ip-country"),
      device,
    })
  } catch {
    // Tracking must never break or slow the site — swallow everything.
  }
  return new NextResponse(null, { status: 204 })
}
