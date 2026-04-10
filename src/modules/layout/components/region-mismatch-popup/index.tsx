"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@medusajs/ui"

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`
}

export default function RegionMismatchPopup() {
  const [show, setShow] = useState(false)
  const [homeCountry, setHomeCountry] = useState<string | null>(null)
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()

  const currentCountry = (params.countryCode as string)?.toLowerCase()

  useEffect(() => {
    const detected = getCookie("_medusa_country")
    const dismissed = getCookie("_medusa_region_dismissed")

    if (
      detected &&
      currentCountry &&
      detected !== currentCountry &&
      dismissed !== `${detected}-${currentCountry}`
    ) {
      setHomeCountry(detected)
      setShow(true)
    } else {
      setShow(false)
    }
  }, [currentCountry])

  if (!show || !homeCountry) return null

  const handleGoHome = () => {
    const restOfPath = pathname.replace(`/${currentCountry}`, "") || ""
    router.push(`/${homeCountry}${restOfPath}`)
    setShow(false)
  }

  const handleStay = () => {
    setCookie("_medusa_region_dismissed", `${homeCountry}-${currentCountry}`, 60 * 60 * 24)
    setShow(false)
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-white border border-ui-border-base rounded-lg shadow-xl p-5">
        <p className="text-ui-fg-base text-sm font-medium mb-1">
          It looks like you&apos;re browsing from{" "}
          <span className="uppercase font-semibold">{homeCountry}</span>
        </p>
        <p className="text-ui-fg-subtle text-sm mb-4">
          Would you like to switch back to your region, or stay on{" "}
          <span className="uppercase font-semibold">{currentCountry}</span>?
        </p>
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="base"
            onClick={handleGoHome}
            className="flex-1"
          >
            Go to /{homeCountry.toUpperCase()}
          </Button>
          <Button
            variant="secondary"
            size="base"
            onClick={handleStay}
            className="flex-1"
          >
            Stay on /{currentCountry.toUpperCase()}
          </Button>
        </div>
      </div>
    </div>
  )
}
