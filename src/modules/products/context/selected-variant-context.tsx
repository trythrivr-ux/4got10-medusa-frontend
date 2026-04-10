"use client"

import { createContext, useContext, useState, ReactNode, useMemo } from "react"
import { HttpTypes } from "@medusajs/types"

type SelectedVariantContextType = {
  selectedImage: string | null
  setSelectedImage: (image: string | null) => void
  clearSelectedImage: () => void
  selectedVariant: HttpTypes.StoreProductVariant | undefined
  setSelectedVariant: (variant: HttpTypes.StoreProductVariant | undefined) => void
}

export const SelectedVariantContext = createContext<SelectedVariantContextType | undefined>(undefined)

export function SelectedVariantProvider({ children }: { children: ReactNode }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<HttpTypes.StoreProductVariant | undefined>(undefined)

  const clearSelectedImage = () => setSelectedImage(null)

  const value = useMemo(() => ({
    selectedImage,
    setSelectedImage,
    clearSelectedImage,
    selectedVariant,
    setSelectedVariant,
  }), [selectedImage, selectedVariant])

  return (
    <SelectedVariantContext.Provider value={value}>
      {children}
    </SelectedVariantContext.Provider>
  )
}

export function useSelectedVariant() {
  const context = useContext(SelectedVariantContext)
  if (context === undefined) {
    throw new Error("useSelectedVariant must be used within a SelectedVariantProvider")
  }
  return context
}
