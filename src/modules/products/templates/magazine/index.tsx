import React from "react"

import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { getActiveRollouts } from "@lib/data/rollouts"
import { getProductFeatures } from "@lib/data/features"
import { listCategories } from "@lib/data/categories"
import { getProductPrice } from "@lib/util/get-product-price"
import SimpleDeskScene from "@modules/desk/components/simple-desk-scene"
import MagazineProductActions from "../magazine-product-actions"
import { Button, Divider, Typography } from "@/components/ui"
import AnimatedRow from "@modules/products/components/animated-row"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import ProductOnboardingCta from "../../components/product-onboarding-cta"
import FrequentlyAskedRow from "@modules/products/components/frequently-asked-row"

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

  // Get Magazines category
  const categories = await listCategories().catch(() => [])
  const magazinesCategory = categories.find((cat) =>
    cat.handle?.toLowerCase().includes("magazine")
  )

  // Get product price
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const rolloutsData = await getActiveRollouts()
  const rollouts = (rolloutsData as any)?.rollouts || []
  const now = new Date()

  const productRollout = rollouts.find(
    (rollout: any) =>
      rollout.product_ids && rollout.product_ids.includes(product.id)
  )

  const featuresData = await getProductFeatures(product.id)
  const features = (featuresData as any)?.features || []

  if (productRollout && productRollout.announcement_date) {
    const announcementDate = new Date(productRollout.announcement_date)
    if (announcementDate > now) {
      return notFound()
    }
  }

  function getFullImageUrl(url: string | undefined): string | undefined {
    if (!url) return undefined

    if (url.startsWith("http://") || url.startsWith("https://")) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`
    }

    const MEDUSA_BACKEND_URL =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

    return `${MEDUSA_BACKEND_URL}${url.startsWith("/") ? "" : "/"}${url}`
  }

  const rawFrontCover = product.images?.[0]?.url
  const rawBackCover = product.images?.[1]?.url || product.images?.[0]?.url
  const frontCover = getFullImageUrl(rawFrontCover)
  const backCover = getFullImageUrl(rawBackCover)

  const edgeFadeMask =
    "radial-gradient(circle at 50% 50%, black 40%, transparent 72%)"

  return (
    <div className="w-full relative">
      <div className="flex flex-col w-full items-start phone:flex-row">
        {/* 2/3 sticky parent */}
        <div className="w-full phone:w-[66.666%] flex flex-row items-end justify-end h-[85vh] phone:h-[calc(100vh-20px)] phone:sticky phone:top-0">
          <div className="h-full w-full rounded-[48px] overflow-hidden">
            <div
              className="relative h-full w-full rounded-[48px] overflow-hidden"
              style={{
                WebkitMaskImage: edgeFadeMask,
                maskImage: edgeFadeMask,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
                WebkitMaskPosition: "50% 50%",
                maskPosition: "50% 50%",
              }}
            >
              <SimpleDeskScene frontCover={frontCover} backCover={backCover} />
            </div>
          </div>

          <div className="hidden phone:block absolute h-fit w-full right-0 left-0 bottom-0 z-10 pl-[12px] pb-[12px]">
            <div className="flex flex-row gap-[10px] bg-[#F9F9F980] h-[62px] p-[8px] rounded-[12px]">
              <MagazineProductActions
                product={product}
                region={region}
                countryCode={countryCode}
                rolloutDates={
                  productRollout
                    ? {
                        drop_date: productRollout.drop_date,
                        sold_out_date: productRollout.sold_out_date,
                        announcement_date: productRollout.announcement_date,
                      }
                    : undefined
                }
              />
            </div>
          </div>
        </div>

        {/* Mobile add to cart wrapper - only visible on mobile */}
        <div className="block phone:hidden w-full px-[12px]">
          <div className="flex flex-row gap-[10px] bg-[#F9F9F980] h-[62px] p-[8px] rounded-[12px]">
            <MagazineProductActions
              product={product}
              region={region}
              countryCode={countryCode}
              rolloutDates={
                productRollout
                  ? {
                      drop_date: productRollout.drop_date,
                      sold_out_date: productRollout.sold_out_date,
                      announcement_date: productRollout.announcement_date,
                    }
                  : undefined
              }
            />
          </div>
        </div>

        {/* 1/3 normal scrolling column */}
        <div className="w-full phone:w-[33.333%] relative pt-[12px] phone:pt-[75px] flex flex-col gap-[10px] p-[12px] z-10">
          <Button variant="backdrop" className="w-fit" size="small">
            <Typography className="opacity-[55%]" variant="subtitle2">
              Overview
            </Typography>
          </Button>
          <div
            className={`flex flex-col gap-[10px] bg-white rounded-[10px] px-[11.5px] py-[12px] ${
              product.variants && product.variants.length > 1
                ? "min-h-[220px]"
                : "h-fit"
            }`}
          >
            <div className="w-full gap-[17px] flex flex-col h-fit">
              <div className="flex flex-col gap-[7px] w-full h-fit">
                <div className="w-full h-fit justify-between items-center flex flex-row">
                  <Typography className="opacity-[55%]" variant="subtitle1">
                    Magazine
                  </Typography>
                  <Typography className="opacity-[0%]" variant="subtitle1">
                    Volume II
                  </Typography>
                </div>
                <div className="w-full h-fit justify-between items-center flex flex-row">
                  <Typography
                    className="strok"
                    style={{ ["--strok" as any]: "0.02px" }}
                    variant="title"
                  >
                    {product.title}
                  </Typography>
                  <div className="flex flex-row gap-[2px]">
                    {cheapestPrice && (
                      <>
                        <Typography
                          className="strok"
                          style={{ ["--strok" as any]: "0.02px" }}
                          variant="title"
                        >
                          {cheapestPrice.calculated_price.split(".")[0]}
                        </Typography>
                        <Typography
                          style={{ ["--strok" as any]: "0.1px" }}
                          variant="title"
                        >
                          .
                        </Typography>
                        <Typography
                          className="items-start pt-[1px] strok text-[13.5px]"
                          style={{ ["--strok" as any]: "0.1px" }}
                          variant="title"
                        >
                          {cheapestPrice.calculated_price.split(".")[1] || "00"}
                        </Typography>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Divider orientation="horizontal" />
              {product.variants && product.variants.length > 1 && (
                <div className="w-full h-fit justify-start items-start gap-[15px] flex flex-col">
                  <Typography
                    className="opacity-[55%] py-[1px]"
                    variant="subtitle1"
                  >
                    Variatens
                  </Typography>
                  <div className="flex flex-row gap-[8px] w-full h-[150px]">
                    {product.variants.slice(0, 3).map((variant) => (
                      <div
                        key={variant.id}
                        className="flex rounded-[7px] p-[12px] bg-[#F7F7F7] flex-col justify-end w-full"
                      >
                        <div className="flex flex-row w-full h-fit">
                          <Typography variant="subtitle2">
                            {variant.title}
                          </Typography>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-[10px] bg-white rounded-[10px] px-[11.5px] py-[12px] h-fit">
            <Typography className="opacity-[55%] py-[2px]" variant="subtitle1">
              Description
            </Typography>
            <Divider orientation="horizontal" />

            <div className="flex flex-col gap-[4px] py-[2px]">
              {product.description
                ?.split("\n")
                .map((line: string, index: number) => {
                  const isBullet = line.trim().startsWith("-")
                  return (
                    <Typography
                      key={index}
                      className="opacity-[55%]"
                      variant="body"
                    >
                      {isBullet && <span className="mr-1">•</span>}
                      {isBullet ? line.trim().substring(1).trim() : line}
                    </Typography>
                  )
                })}
            </div>
          </div>
          <div className="flex flex-col gap-[10px] bg-white rounded-[10px] px-[11.5px] py-[12px] h-fit">
            <Typography className="opacity-[55%] py-[2px]" variant="subtitle1">
              This Release
            </Typography>
            <div className="flex flex-col gap-[8px] w-full">
              <div
                className={`h-[220px] flex rounded-[7px] p-[12px] flex-col justify-end w-full bg-cover bg-center ${
                  productRollout?.headliner_media_urls?.[0]
                    ? ""
                    : "bg-[#F7F7F7]"
                }`}
                style={{
                  backgroundImage: productRollout?.headliner_media_urls?.[0]
                    ? `url(${productRollout.headliner_media_urls[0]})`
                    : undefined,
                }}
              >
                <div className="flex flex-col w-full h-fit">
                  <Typography
                    className="text-white pb-[4px] opacity-[75%]"
                    variant="subtitle2"
                  >
                    Headliner
                  </Typography>
                  <Typography className="text-white" variant="subtitle1">
                    {productRollout.headliner || "No headliner"}
                  </Typography>
                </div>
              </div>
              <div className="h-[220px] relative flex rounded-[7px] p-[12px] bg-[#F7F7F7] flex-col justify-end w-full overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-[170px] h-[170px]">
                    {features[0] && (
                      <div className="absolute top-1/2 left-1/2 w-[64px] h-[64px] -translate-x-1/2 -translate-y-1/2">
                        <div
                          className="w-full h-full rounded-full overflow-hidden bg-cover bg-center bg-[#E5E5E5] border border-white shadow-sm"
                          style={{
                            backgroundImage: features[0].photo_file_id
                              ? `url(${
                                  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
                                  "http://localhost:9000"
                                }/files/${features[0].photo_file_id})`
                              : undefined,
                          }}
                        />
                      </div>
                    )}

                    {features.slice(1).map((feature: any, index: number) => {
                      const total = features.slice(1).length
                      const angle = (360 / total) * index
                      const radius = 58

                      return (
                        <div
                          key={feature.id}
                          className="absolute top-1/2 left-1/2 w-[52px] h-[52px] -translate-x-1/2 -translate-y-1/2"
                          style={{
                            transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px)`,
                          }}
                        >
                          <div
                            className="w-full h-full rounded-full overflow-hidden bg-cover bg-center bg-[#E5E5E5] border border-white shadow-sm"
                            style={{
                              backgroundImage: feature.photo_file_id
                                ? `url(${
                                    process.env
                                      .NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
                                    "http://localhost:9000"
                                  }/files/${feature.photo_file_id})`
                                : undefined,
                            }}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>

                <Typography
                  className="text-black absolute bottom-[12px] left-[12px]"
                  variant="subtitle2"
                >
                  Features
                </Typography>
              </div>
            </div>
          </div>
          <Button variant="backdrop" className="flex w-fit" size="small">
            Production
          </Button>
          <div className="grid grid-cols-2 gap-[12px]  w-full aspect-square">
            <div className="bg-white rounded-[10px] gap-[10px] flex flex-col p-[11px] w-full aspect-square">
              <Typography
                className="text-black text-[12px] tracking-[-1.5%]  pt-[6px] pb-[6px] opacity-[100%]"
                variant="subtitle2"
              >
                Printed on premium photo paper
              </Typography>
              <Typography
                className="opacity-[55%] text-[11.4px] pb-[4px]"
                variant="subtitle1"
              >
                Heavyweight, acid-free photo paper ensures sharp, durable prints
                with professional quality
              </Typography>
              <img
                src="/production/image-1.jpg"
                alt="Production 1"
                className="bg-white rounded-[7px] w-full aspect-square object-cover"
              />
            </div>
            <div className="bg-white rounded-[10px] gap-[10px] flex flex-col p-[11px] w-full aspect-square">
              <Typography
                className="text-black text-[12px] tracking-[-1.5%]  pt-[6px] pb-[6px] opacity-[100%]"
                variant="subtitle2"
              >
                Premium Matte Finish
              </Typography>
              <Typography
                className="opacity-[55%] text-[11.4px] pb-[4px]"
                variant="subtitle1"
              >
                Non-reflective matte coating reduces glare while adding a soft,
                premium feel
              </Typography>
              <img
                src="/production/image-2.jpg"
                alt="Production 1"
                className="bg-white rounded-[7px] w-full aspect-square object-cover"
              />
            </div>
            <div className="bg-white rounded-[10px] gap-[10px] flex flex-col p-[11px] w-full aspect-square">
              <Typography
                className="text-black text-[12px] tracking-[-1.5%]  pt-[6px] pb-[6px] opacity-[100%]"
                variant="subtitle2"
              >
                Maximum color brilliance
              </Typography>
              <Typography
                className="opacity-[55%] text-[11.4px] pb-[4px]"
                variant="subtitle1"
              >
                High saturation inks produce vivid, true-to-life colors that
                stand out in any light
              </Typography>
              <img
                src="/production/image-3.jpg"
                alt="Production 1"
                className="bg-white rounded-[7px] w-full aspect-square object-cover"
              />
            </div>

            <div className="bg-white rounded-[10px] gap-[10px] flex flex-col p-[11px] w-full aspect-square">
              <Typography
                className="text-black text-[12px] tracking-[-1.5%]  pt-[6px] pb-[6px] opacity-[100%]"
                variant="subtitle2"
              >
                High UV resistance
              </Typography>
              <Typography
                className="opacity-[55%] text-[11.4px] pb-[4px]"
                variant="subtitle1"
              >
                UV-resistant coating prevents fading, keeping colors vibrant for
                years
              </Typography>
              <img
                src="/production/image-4.jpg"
                alt="Production 1"
                className="bg-white rounded-[7px] w-full aspect-square object-cover"
              />
            </div>
          </div>

          <FrequentlyAskedRow />
        </div>
      </div>
      <div className="flex flex-col w-full px-[12px] pb-[24px] gap-[12px]">
        <PaginatedProducts
          sortBy="created_at"
          page="1"
          countryCode={countryCode}
          categoryId={magazinesCategory?.id}
        />
      </div>
    </div>
  )
}

export default MagazineProductTemplate
