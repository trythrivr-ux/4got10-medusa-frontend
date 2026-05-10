import React from "react"

import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { getActiveRollouts } from "@lib/data/rollouts"
import SimpleDeskScene from "@modules/desk/components/simple-desk-scene"
import MagazineProductActions from "../magazine-product-actions"
import { Button, Divider, Typography } from "@/components/ui"
import AnimatedRow from "@modules/products/components/animated-row"

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
      <div className="flex flex-row w-full items-start">
        {/* 2/3 sticky parent */}
        <div className="w-[66.666%] flex flex-row items-end justify-end h-[calc(100vh-20px)] sticky top-0">
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

          <div className="absolute h-fit w-full right-0 left-0 bottom-0 z-10 pl-[12px] pb-[12px]">
            <div className="flex flex-row gap-[10px] bg-[#F9F9F980] h-[62px] p-[8px] rounded-[12px]">
              <MagazineProductActions
                product={product}
                region={region}
                countryCode={countryCode}
              />
            </div>
          </div>
        </div>

        {/* 1/3 normal scrolling column */}
        <div className="w-[33.333%] relative pt-[75px] flex flex-col gap-[10px] p-[12px] z-10">
          <Button variant="backdrop" className="w-fit" size="small">
            <Typography className="opacity-[55%]" variant="subtitle2">
              Overview
            </Typography>
          </Button>
          <div className="flex flex-col gap-[10px] bg-white rounded-[10px] px-[11.5px] py-[12px] min-h-[220px]">
            <div className="w-full gap-[17px] flex flex-col h-fit">
              <div className="flex flex-col gap-[7px] w-full h-fit">
                <div className="w-full h-fit justify-between items-center flex flex-row">
                  <Typography className="opacity-[55%]" variant="subtitle1">
                    Magazine
                  </Typography>
                  <Typography className="opacity-[55%]" variant="subtitle1">
                    Volume II
                  </Typography>
                </div>
                <div className="w-full h-fit justify-between items-center flex flex-row">
                  <Typography
                    className="strok"
                    style={{ ["--strok" as any]: "0.02px" }}
                    variant="title"
                  >
                    Vice City
                  </Typography>
                  <div className="flex flex-row gap-[2px]">
                    <Typography
                      className="items-start pt-[1px] strok text-[13.5px]"
                      style={{ ["--strok" as any]: "0.1px" }}
                      variant="title"
                    >
                      $
                    </Typography>
                    <Typography
                      className="strok"
                      style={{ ["--strok" as any]: "0.02px" }}
                      variant="title"
                    >
                      19.
                    </Typography>
                    <Typography
                      className="items-start pt-[1px] strok text-[13.5px]"
                      style={{ ["--strok" as any]: "0.1px" }}
                      variant="title"
                    >
                      95
                    </Typography>
                  </div>
                </div>
              </div>
              <Divider orientation="horizontal" />
              <div className="w-full h-fit justify-start items-start gap-[15px] flex flex-col">
                <Typography
                  className="opacity-[55%] py-[1px]"
                  variant="subtitle1"
                >
                  Variatens
                </Typography>
                <div className="flex flex-row gap-[8px] w-full h-[150px]">
                  <div className="flex rounded-[7px] p-[12px] bg-[#F7F7F7] flex-col justify-end w-full">
                    <div className="flex flex-row w-full h-fit">
                      <Typography variant="subtitle2">Black</Typography>
                    </div>
                  </div>
                  <div className="flex rounded-[7px] p-[12px] border-[#7B7B7B25] border-[1px] flex-col justify-end w-full">
                    <div className="flex flex-row w-full h-fit">
                      <Typography variant="subtitle2">Black</Typography>
                    </div>
                  </div>
                  <div className="flex rounded-[7px] p-[12px] border-[#7B7B7B25] border-[1px] flex-col justify-end w-full">
                    <div className="flex flex-row w-full h-fit">
                      <Typography variant="subtitle2">Black</Typography>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[10px] bg-white rounded-[10px] px-[11.5px] py-[12px] h-fit">
            <Typography className="opacity-[55%] py-[2px]" variant="subtitle1">
              This Release
            </Typography>
            <div className="flex flex-col gap-[8px] w-full">
              <div className="h-[163px] flex rounded-[7px] p-[12px] bg-[#F7F7F7] flex-col justify-end w-full">
                <div className="flex flex-row w-full h-fit">
                  <Typography variant="subtitle2">Black</Typography>
                </div>
              </div>
              <div className="h-[163px] flex rounded-[7px] p-[12px] bg-[#F7F7F7] flex-col justify-end w-full">
                <div className="flex flex-row w-full h-fit">
                  <Typography variant="subtitle2">Black</Typography>
                </div>
              </div>
              <div className="h-[163px] flex rounded-[7px] p-[12px] bg-[#F7F7F7] flex-col justify-end w-full">
                <div className="flex flex-row w-full h-fit">
                  <Typography variant="subtitle2">Black</Typography>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-[10px] bg-white rounded-[10px] px-[11.5px] py-[12px] h-fit">
            <Typography className="opacity-[55%] py-[2px]" variant="subtitle1">
              Frequently Asked
            </Typography>
          </div>
          <Button variant="backdrop" className="w-fit" size="small">
            Production
          </Button>
          <div className="grid grid-cols-2 gap-[12px] w-full aspect-square">
            <div className="bg-white rounded-[10px] px-[12px] py-[15px] w-full aspect-square"></div>
            <div className="bg-white rounded-[10px] px-[12px] py-[15px] w-full aspect-square"></div>
            <div className="bg-white rounded-[10px] px-[12px] py-[15px] w-full aspect-square"></div>
            <div className="bg-white rounded-[10px] px-[12px] py-[15px] w-full aspect-square"></div>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full h-fit px-[12px] pb-[12px] gap-[12px]">
        <div className="flex flex-row w-full h-[calc(100vw/6-24px)]">
          <AnimatedRow itemsPerSide={3} />
        </div>
        <div className="h-[500px] flex rounded-[7px] p-[12px] bg-[#F7F7F7] flex-col justify-end w-full">
          <div className="flex flex-row w-full h-fit">
            <Typography variant="subtitle2">Black</Typography>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MagazineProductTemplate
