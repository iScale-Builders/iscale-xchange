import { redirect } from "next/navigation"

import { auth } from "@clerk/nextjs/server"

import { appPath } from "@/lib/base-path"
import { getLocalUser } from "@/lib/ensure-user"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Verify the user is signed in and is an admin.
  // Admin role lives in the local "user" table (not Clerk).
  const { userId } = await auth()

  if (!userId) {
    redirect(appPath("/"))
  }

  const localUser = await getLocalUser(userId)

  if (!localUser || localUser.role !== "admin") {
    redirect(appPath("/"))
  }

  return <div>{children}</div>
}
