"use client"

import { createContext, useContext, useState, ReactNode, useMemo, useRef, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { ProductMeta } from "@lib/data/products"

type ProductContextType = {
  product: HttpTypes.StoreProduct | null
  productMeta: ProductMeta | null
  selectedVariant: HttpTypes.StoreProductVariant | undefined
  setSelectedVariant: (variant: HttpTypes.StoreProductVariant | undefined) => void
  setProduct: (product: HttpTypes.StoreProduct | null) => void
  setProductMeta: (meta: ProductMeta | null) => void
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<HttpTypes.StoreProduct | null>(null)
  const [productMeta, setProductMeta] = useState<ProductMeta | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<HttpTypes.StoreProductVariant | undefined>(undefined)

  const value = useMemo(() => ({
    product,
    productMeta,
    selectedVariant,
    setSelectedVariant,
    setProduct,
    setProductMeta,
  }), [product, productMeta, selectedVariant])

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProduct() {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error("useProduct must be used within a ProductProvider")
  }
  return context
}
