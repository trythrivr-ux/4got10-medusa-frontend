"use client"

import { useParams, usePathname } from "next/navigation"

export default function NavFloating() {
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

  return (
    <style>{`
      .group.sticky.top-0 {
        position: absolute !important;
        width: 100%;
      }
      .group.sticky.top-0 header {
        background: transparent !important;
        border-bottom: none !important;
      }
    `}</style>
  )
}
