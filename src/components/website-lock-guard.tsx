"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

export default function WebsiteLockGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLocked, setIsLocked] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkLock = async () => {
      try {
        const response = await fetch("/api/website-lock", {
          cache: "no-store",
        })
        const data = await response.json()
        console.log("Lock state check:", data.locked)
        setIsLocked(data.locked)
      } catch (error) {
        console.error("Failed to check lock state:", error)
        setIsLocked(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkLock()

    // Check lock state every 5 seconds to ensure it's up to date
    const interval = setInterval(checkLock, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isLoading || isLocked === null) return

    // Bypass lock for API routes, images, and static assets
    const isApiRoute = pathname.startsWith("/api")
    const isImageRoute =
      pathname.startsWith("/images") || pathname.includes("/image-proxy")
    const isStaticAsset = pathname.startsWith("/_next")

    console.log(
      "Pathname:",
      pathname,
      "Locked:",
      isLocked,
      "API:",
      isApiRoute,
      "Image:",
      isImageRoute,
      "Static:",
      isStaticAsset
    )

    if (isApiRoute || isImageRoute || isStaticAsset) {
      return
    }

    // Check if user is on home page (e.g., /us, /dk, or just /)
    const isHomePage =
      pathname.match(/^\/[a-z]{2}$/) !== null || pathname === "/"

    console.log("Is home page:", isHomePage)

    // Check if the user has already entered the preview password
    const hasBypassCookie = document.cookie
      .split(";")
      .some((c) => c.trim().startsWith("_site_preview="))

    if (isLocked && !isHomePage && !hasBypassCookie) {
      console.log("Redirecting to home page")
      const countryCode = pathname.split("/")[1] || "us"
      router.push(`/${countryCode}`)
    }
  }, [isLocked, isLoading, pathname, router])

  if (isLoading) {
    return null
  }

  return <>{children}</>
}
