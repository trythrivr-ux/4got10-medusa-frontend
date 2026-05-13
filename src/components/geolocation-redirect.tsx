"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function GeolocationRedirect() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const detectCountry = async () => {
      // Check if country is already detected (stored in cookie or localStorage)
      const detectedCountry = localStorage.getItem("detected_country")
      if (detectedCountry) {
        return // Already detected
      }

      // Check if already on a country-specific path
      const pathSegments = pathname.split("/").filter(Boolean)
      if (pathSegments.length > 0 && pathSegments[0].length === 2) {
        // Store the detected country from URL
        localStorage.setItem("detected_country", pathSegments[0])
        return
      }

      try {
        // Use a free geolocation API
        const response = await fetch("https://ipapi.co/json/")
        if (response.ok) {
          const data = await response.json()
          const countryCode = data.country_code?.toLowerCase()

          if (countryCode) {
            // Store the detected country
            localStorage.setItem("detected_country", countryCode)

            // Redirect to the country-specific path
            router.push(`/${countryCode}${pathname}`)
          }
        }
      } catch (error) {
        console.log("Geolocation detection failed, using default")
        // If geolocation fails, redirect to default region
        localStorage.setItem("detected_country", "us")
        router.push("/us")
      }
    }

    detectCountry()
  }, [pathname, router])

  return null
}
