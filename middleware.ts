import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

import { appPath, BASE_PATH } from "@/lib/base-path"

// DECISION 3: browsing/search/viewing tools + profiles is fully PUBLIC.
// Only a small set of routes require an authenticated user. Everything else
// (homepage, /explore, /projects/[slug], /u/[id], search, etc.) stays open.
const isProtectedRoute = createRouteMatcher([
  "/dashboard/:path*",
  `${BASE_PATH}/dashboard/:path*`,
  "/settings/:path*",
  `${BASE_PATH}/settings/:path*`,
  "/admin/:path*",
  `${BASE_PATH}/admin/:path*`,
  "/projects/submit/:path*",
  `${BASE_PATH}/projects/submit/:path*`,
])

export default clerkMiddleware(
  async (auth, request) => {
    if (isProtectedRoute(request)) {
      // Redirect signed-out users to the Clerk sign-in page and return them back
      // after auth, instead of Clerk's default 404 for protected pages.
      const { userId, redirectToSignIn } = await auth()
      if (!userId) {
        // This app is served through a multi-zone rewrite. request.url therefore
        // uses the private zone hostname; never expose that as Clerk's post-login
        // destination. Rebuild the same path on the configured public origin.
        const publicOrigin = new URL(
          process.env.NEXT_PUBLIC_URL ?? "https://www.iscalelabs.com/iscalexchange",
        ).origin
        const returnBackUrl = new URL(
          `${appPath(request.nextUrl.pathname)}${request.nextUrl.search}`,
          publicOrigin,
        )

        return redirectToSignIn({ returnBackUrl })
      }
    }
  },
  {
    frontendApiProxy: {
      enabled: true,
      path: appPath("/__clerk"),
    },
  },
)

export const config = {
  matcher: [
    // With basePath enabled, Next prefixes matchers. The general matcher below
    // requires a slash after the prefix, so the exact zone root needs its own
    // entry or Clerk auth() cannot see that middleware ran.
    "/",
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|gif|png|svg|ico|webp|woff2?|ttf|otf|map)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Clerk frontend API proxy path.
    "/__clerk/(.*)",
  ],
}
