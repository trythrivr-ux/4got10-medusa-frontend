import React, { Suspense } from "react"

import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { getActiveRollouts } from "@lib/data/rollouts"
import SimpleDeskScene from "@modules/desk/components/simple-desk-scene"

import ProductActionsWrapper from "../product-actions-wrapper"

type MagazineProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const MagazineProductTemplate: React.FC<MagazineProductTemplateProps> = async ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const rolloutsData = await getActiveRollouts()
  const rollouts = (rolloutsData as any)?.rollouts || []
  const now = new Date()

  const productRollout = rollouts.find(
    (rollout: any) =>
      rollout.product_ids && rollout.product_ids.includes(product.id)
  )

  if (productRollout && productRollout.announcement_date) {
    const announcementDate = new Date(productRollout.announcement_date)
    if (announcementDate > now) {
      return notFound()
    }
  }

  // Helper to get full URL for image - use proxy for external URLs to bypass CORS
  function getFullImageUrl(url: string | undefined): string | undefined {
    if (!url) return undefined
    // If external URL, route through our proxy to bypass CORS
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`
    }
    // Otherwise prepend backend URL
    const MEDUSA_BACKEND_URL =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    return `${MEDUSA_BACKEND_URL}${url.startsWith("/") ? "" : "/"}${url}`
  }

  // Get first and second product images for front and back covers with CORS handling
  const rawFrontCover = product.images?.[0]?.url
  const rawBackCover = product.images?.[1]?.url || product.images?.[0]?.url
  const frontCover = getFullImageUrl(rawFrontCover)
  const backCover = getFullImageUrl(rawBackCover)

  return (
    <>
      <div className="w-full min-h-screen flex flex-col relative overflow-hidden -mt-[63px]">
        <div className="w-full h-[calc(100vh+200px)] rounded-[12px] overflow-hidden relative">
          <SimpleDeskScene frontCover={frontCover} backCover={backCover} />
          <div className="bg-gradient-to-t from-[#efefef] to-transparent h-[100px] absolute bottom-0 right-0 left-0"></div>
        </div>
        <div className="flex flex-col gap-[12px] px-[12px] pb-[15px]">
          <div className="h-[800px] bg-white w-full rounded-[12px]"></div>
          <div className="flex flex-row gap-[12px]">
            <div className="aspect-square bg-white w-full rounded-[12px]"></div>
            <div className="aspect-square bg-white w-full rounded-[12px]"></div>
          </div>
          <div className="flex flex-row gap-[12px]">
            <div className="aspect-square bg-white w-full rounded-[12px]"></div>
            <div className="aspect-square bg-white w-full rounded-[12px]"></div>
            <div className="aspect-square bg-white w-full rounded-[12px]"></div>
            <div className="aspect-square bg-white w-full rounded-[12px]"></div>
            <div className="aspect-square bg-white w-full rounded-[12px]"></div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MagazineProductTemplate
