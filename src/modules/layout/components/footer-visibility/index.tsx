"use client"

import { useParams, usePathname } from "next/navigation"

export default function FooterVisibility() {
  const pathname = usePathname()
  const params = useParams()

  const countryCode = (params.countryCode as string | undefined)?.toLowerCase()

  if (!countryCode) {
    return null
  }

  const normalized = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname
  const isHome = normalized === `/${countryCode}`

  if (!isHome) {
    return null
  }

  return <style>{"#site-footer{display:none !important;}"}</style>
}
