"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface CustomLayoutContextType {
  customLayout: boolean
  setCustomLayout: (value: boolean) => void
  isLoading: boolean
  setIsLoading: (value: boolean) => void
  hasAcceptedCookies: boolean
  setHasAcceptedCookies: (value: boolean) => void
}

const CustomLayoutContext = createContext<CustomLayoutContextType | undefined>(
  undefined
)

export function CustomLayoutProvider({ children }: { children: ReactNode }) {
  const [customLayout, setCustomLayout] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasAcceptedCookies, setHasAcceptedCookies] = useState(false)

  return (
    <CustomLayoutContext.Provider
      value={{
        customLayout,
        setCustomLayout,
        isLoading,
        setIsLoading,
        hasAcceptedCookies,
        setHasAcceptedCookies,
      }}
    >
      {children}
    </CustomLayoutContext.Provider>
  )
}

export function useCustomLayout() {
  const context = useContext(CustomLayoutContext)
  if (!context) {
    throw new Error("useCustomLayout must be used within CustomLayoutProvider")
  }
  return context
}
