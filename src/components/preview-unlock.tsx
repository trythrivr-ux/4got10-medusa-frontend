"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

export default function PreviewUnlock() {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()

  // Only show on the home page (e.g. /us, /dk, /)
  const isHomePage = pathname === "/" || /^\/[a-z]{2}$/.test(pathname)

  // Don't render if the bypass cookie is already set
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const has = document.cookie
      .split(";")
      .some((c) => c.trim().startsWith("_site_preview="))
    if (!has) setVisible(true)
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60)
    } else {
      setPassword("")
      setError(null)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim() || loading) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        setSuccess(true)
        setVisible(false)
        setTimeout(() => {
          setOpen(false)
          // Reload so WebsiteLockGuard re-evaluates with the new cookie
          window.location.reload()
        }, 800)
      } else {
        setError("Incorrect password.")
        setPassword("")
        inputRef.current?.focus()
      }
    } catch {
      setError("Could not connect. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!visible || !isHomePage) return null

  return (
    <>
      {/* Trigger button — small lock icon fixed to top-right */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Enter preview password"
        className="fixed top-[22px] right-[22px] z-[999] w-[32px] h-[32px] rounded-full bg-black/8 backdrop-blur-[6px] flex items-center justify-center hover:bg-white/15 bg-white/10 transition-colors"
        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-black/50"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/25 backdrop-blur-[4px]"
            onClick={() => setOpen(false)}
          />

          {/* Card */}
          <div
            className="relative bg-white rounded-[16px] w-[340px] overflow-hidden"
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.14)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-[24px] pt-[24px] pb-[20px] border-b border-[#f0f0f0]">
              <div className="flex items-center gap-[10px]">
                <div className="w-[32px] h-[32px] rounded-full bg-[#f0f0f0] flex items-center justify-center shrink-0">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-black/60"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-black leading-tight">
                    Preview access
                  </p>
                  <p className="text-[11.5px] text-[#00000055] mt-[1px]">
                    Enter the password to continue
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="px-[24px] pt-[20px] pb-[24px] flex flex-col gap-[10px]"
            >
              <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
                placeholder="Password"
                disabled={loading || success}
                className="w-full h-[42px] px-[14px] rounded-[10px] border border-[#e8e8e8] text-[13.5px] font-medium text-black outline-none focus:border-black transition-colors placeholder:text-[#00000030] bg-white disabled:opacity-50"
              />

              {error && (
                <p className="text-[12px] text-red-500 font-medium">{error}</p>
              )}

              {success && (
                <p className="text-[12px] text-green-600 font-medium">
                  Access granted ✓
                </p>
              )}

              <button
                type="submit"
                disabled={loading || success || !password.trim()}
                className="w-full h-[42px] bg-black text-white rounded-[10px] text-[13.5px] font-semibold hover:bg-[#222] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Checking..." : success ? "Unlocked!" : "Unlock"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
