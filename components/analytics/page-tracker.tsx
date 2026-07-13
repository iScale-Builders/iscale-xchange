"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

// Fire-and-forget first-party view beacon; feeds the /admin Site Analytics
// panel. Must never throw or block navigation.
export function PageTracker() {
  const pathname = usePathname()
  const lastTracked = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || lastTracked.current === pathname) {
      return
    }
    lastTracked.current = pathname

    const payload = JSON.stringify({ path: pathname, referrer: document.referrer })
    try {
      const sent = navigator.sendBeacon?.(
        "/api/pulse",
        new Blob([payload], { type: "application/json" }),
      )
      if (!sent) {
        fetch("/api/pulse", {
          method: "POST",
          body: payload,
          headers: { "Content-Type": "application/json" },
          keepalive: true,
        }).catch(() => {})
      }
    } catch {
      // Tracking is best-effort only.
    }
  }, [pathname])

  return null
}
