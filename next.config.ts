import type { NextConfig } from "next"

import createMDX from "@next/mdx"
import remarkGfm from "remark-gfm"

// Baseline security headers applied to every response. A Content-Security-Policy
// is intentionally NOT set here yet — a strict CSP needs per-integration tuning
// (Clerk, Plausible, UploadThing, next/image) and should be rolled out in
// Report-Only mode first to avoid breaking the live site.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
]

const nextConfig: NextConfig = {
  /* config options here */

  // TypeScript errors DO fail the build — the code type-checks clean and a type
  // error is a real defect worth blocking a deploy over. ESLint stays
  // non-blocking (it also passes clean; enforce it in CI) so a trivial lint nit
  // can't wedge a manual deploy.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },

  // Configuration pour MDX
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    // SECURITY: the next/image optimizer fetches remote URLs server-side, so a
    // wildcard host is an open image-proxy / SSRF-amplification surface. The
    // wildcard is kept because makers submit logos/screenshots from arbitrary
    // hosts and a strict allowlist crashed those pages (2026-06-17); the
    // hardening below blunts the abuse (no inline SVG execution, forced
    // attachment disposition, long cache TTL to limit re-fetch DoS).
    // TODO: replace the wildcard with a host allowlist + graceful <img> fallback.
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      ...(process.env.NEXT_PUBLIC_UPLOADTHING_URL
        ? [
            {
              protocol: "https" as const,
              hostname: process.env.NEXT_PUBLIC_UPLOADTHING_URL,
            },
          ]
        : []),
    ],
  },
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
  },
})

// Combine MDX and Next.js config
export default withMDX(nextConfig)
