"use client"

import { useEffect } from "react"
import { useCustomLayout } from "@/context/custom-layout-context"

export function LoadingAnimation() {
  const { isLoading, setIsLoading } = useCustomLayout()

  useEffect(() => {
    // Simulate loading completion after 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [setIsLoading])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative">
        {/* Loading spinner */}
        <div className="w-16 h-16 border-4 border-gray-800 border-t-white rounded-full animate-spin"></div>
        
        {/* Loading text */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white text-sm font-light tracking-wider">
          LOADING
        </div>
      </div>
    </div>
  )
}
