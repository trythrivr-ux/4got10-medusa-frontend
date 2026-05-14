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
    <div className="fixed bottom-4 left-0 right-0 z-[9998] flex justify-center px-4 pointer-events-none">
      <div
        className="w-full max-w-[640px] bg-white rounded-[16px] shadow-2xl overflow-hidden pointer-events-auto"
        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
      >
        <div className="flex items-center gap-[16px] px-[20px] py-[18px]">
          <p className="flex-1 text-[13px] font-medium text-[#00000070] leading-relaxed">
            <span className="text-black font-semibold">Cookies</span> — We use
            cookies to enhance your experience and analyze site traffic.
          </p>
          <div className="flex items-center gap-[8px] shrink-0">
            <button
              onClick={handleDecline}
              className="text-[11px] font-medium text-[#00000060] hover:text-black border border-[#e5e5e5] rounded-full px-[12px] py-[5px] transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="text-[11px] font-medium text-white bg-black hover:bg-[#222] border border-black rounded-full px-[12px] py-[5px] transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
