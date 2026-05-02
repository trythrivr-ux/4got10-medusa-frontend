"use client"

import { useEffect } from "react"
import { useCustomLayout } from "@/context/custom-layout-context"

export function CookieBanner() {
  const { hasAcceptedCookies, setHasAcceptedCookies } = useCustomLayout()

  useEffect(() => {
    // Check if cookies were already accepted
    const cookiesAccepted = localStorage.getItem("cookies-accepted")
    if (cookiesAccepted === "true") {
      setHasAcceptedCookies(true)
    }
  }, [setHasAcceptedCookies])

  const handleAccept = () => {
    localStorage.setItem("cookies-accepted", "true")
    setHasAcceptedCookies(true)
  }

  const handleDecline = () => {
    localStorage.setItem("cookies-accepted", "false")
    setHasAcceptedCookies(true)
  }

  if (hasAcceptedCookies) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm">
            <span className="font-semibold">Cookies:</span> We use cookies to enhance your experience and analyze site traffic. 
            By continuing to use our site, you agree to our use of cookies.
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm border border-gray-600 rounded hover:bg-gray-800 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-white text-gray-900 rounded hover:bg-gray-200 transition-colors font-medium"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
}
