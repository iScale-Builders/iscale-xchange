import { readFileSync } from "node:fs"

const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8")
const packageJson = readFileSync(new URL("../package.json", import.meta.url), "utf8")
const failures = []

for (const [source, marker, message] of [
  [packageJson, '"@vercel/analytics"', "@vercel/analytics must remain installed."],
  [packageJson, '"@vercel/speed-insights"', "@vercel/speed-insights must remain installed."],
  [layout, "<Analytics", "The mounted root layout must render Vercel Analytics."],
  [layout, "<SpeedInsights", "The mounted root layout must render Speed Insights."],
  [
    layout,
    'const analyticsOrigin = "https://www.iscalelabs.com"',
    "The zone must report to the canonical www analytics owner.",
  ],
]) {
  if (!source.includes(marker)) failures.push(message)
}

if (failures.length > 0) {
  console.error("Canonical analytics assertion failed:\n")
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log("Canonical analytics assertion passed: iScaleXchange reports to www.")
