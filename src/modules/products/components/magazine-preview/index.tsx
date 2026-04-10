"use client"

import { useRef, useEffect } from "react"
import { Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PreviewPrice from "../product-preview/price"
import dynamic from "next/dynamic"

const PaperSceneWrapper = dynamic(
  () => import("@modules/home/components/paper-model/PaperSceneWrapper"),
  { ssr: false }
)

// Helper to get full URL for image - use proxy for external URLs to bypass CORS
function getFullImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  // If external URL, route through our proxy to bypass CORS
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`
  }
  // Otherwise prepend backend URL
  const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  return `${MEDUSA_BACKEND_URL}${url.startsWith("/") ? "" : "/"}${url}`
}

type MagazinePreviewProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  isFeatured?: boolean
}

export default function MagazinePreview({
  product,
  region,
  isFeatured,
}: MagazinePreviewProps) {
  const { cheapestPrice } = getProductPrice({ product })
  const paperSceneRef = useRef<{ setScrollProgress: (p: number) => void; setBendAmount: (b: number) => void } | null>(null)

  // Set initial state when component mounts - straight magazine, no bend
  useEffect(() => {
    if (paperSceneRef.current) {
      paperSceneRef.current.setScrollProgress(0) // Closed/straight magazine
      paperSceneRef.current.setBendAmount(0) // No bend
    }
  }, [])

  // Get front and back cover images from product with full URLs
  // Use thumbnail or first image for front, second image for back
  const rawFrontCover = product.thumbnail || (product.images && product.images.length > 0 ? product.images[0].url : undefined)
  const rawBackCover = product.images && product.images.length > 1 ? product.images[1].url : rawFrontCover
  
  const frontCover = getFullImageUrl(rawFrontCover)
  const backCover = getFullImageUrl(rawBackCover)
  
  // Debug: log image URLs - ALWAYS log, not just in useEffect
  console.log("=== MagazinePreview ===")
  console.log("Product title:", product.title)
  console.log("Product images array:", product.images)
  console.log("Product thumbnail:", product.thumbnail)
  console.log("rawFrontCover:", rawFrontCover)
  console.log("rawBackCover:", rawBackCover)
  console.log("frontCover (full URL):", frontCover)
  console.log("backCover (full URL):", backCover)
  console.log("=======================")

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group block">
      <div data-testid="magazine-wrapper" className="relative">
        {/* 3D Magazine Viewer - transparent background */}
        <div 
          className="aspect-[11/14] w-full bg-transparent rounded-lg overflow-hidden"
          style={{ minHeight: "300px" }}
        >
          <PaperSceneWrapper ref={paperSceneRef} frontCover={frontCover} backCover={backCover} />
        </div>
        
        {/* Product Info */}
        <div className="flex txt-compact-medium mt-4 justify-between">
          <Text className="text-ui-fg-subtle" data-testid="product-title">
            {product.title}
          </Text>
          <div className="flex items-center gap-x-2">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
