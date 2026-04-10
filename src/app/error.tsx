"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Check if it's a localStorage error and auto-recover
    if (
      error.message.includes("localStorage") ||
      error.message.includes("getItem is not a function") ||
      error.message.includes("setItem is not a function")
    ) {
      console.warn("Caught localStorage error, attempting auto-recovery...")
      
      // Auto-retry after a short delay
      const timer = setTimeout(() => {
        reset()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [error, reset])

  // For localStorage errors, show a loading state while auto-recovering
  if (
    error.message.includes("localStorage") ||
    error.message.includes("getItem is not a function") ||
    error.message.includes("setItem is not a function")
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we prepare the store for you.</p>
        </div>
      </div>
    )
  }

  // For other errors, show the standard error page
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-4">We apologize for the inconvenience.</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
