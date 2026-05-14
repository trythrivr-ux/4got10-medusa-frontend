import { Text } from "@medusajs/ui"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PreviewPrice from "./price"
import RolloutStatus from "./rollout-status"
import Magazine3DWrapper from "./magazine-3d-wrapper"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
  rolloutDates,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  rolloutDates?: {
    drop_date?: string
    sold_out_date?: string
    announcement_date?: string
  }
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const productRolloutDates = rolloutDates || {}

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div
        className="flex h-full phone:min-h-[500px] w-full flex-col rounded-[10px] bg-[#ffffff] p-[6px]"
        data-testid="product-wrapper"
      >
        <div className="relative flex phone:h-full h-[320px] w-full items-center justify-center rounded-[8px] bg-white">
          {/* top-left and top-right pills */}
          <div className="pointer-events-none absolute left-[8px] top-[8px] select-none">
            <div className="rounded-full bg-[#EFEFEF] px-[8px] py-[4px] text-[10px] leading-none">
              VOL
            </div>
          </div>
          <div className="pointer-events-none  opacity-0 absolute right-[8px] top-[8px] select-none">
            <div className="rounded-full bg-[#EFEFEF] px-[8px] py-[4px] text-[10px] leading-none">
              IV
            </div>
          </div>

          {/* 3D magazine scene */}
          <div className="absolute inset-0 rounded-[8px] overflow-hidden">
            <Magazine3DWrapper
              coverUrl={product.thumbnail || product.images?.[0]?.url}
              productImages={product.images?.map((img) => img.url)}
            />
          </div>
        </div>

        {/* bottom meta */}
        <div className="w-full flex flex-col px-[4px] pt-[10px]">
          <span className="text-[11px] text-black/60">
            {product.categories?.[0]?.name || "Magazine"}
          </span>
          <div className="w-full flex justify-between items-center">
            <Text className="text-[14px]" data-testid="product-title">
              {product.title}
            </Text>
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>

        {/* action/status row */}
        <div className="mt-[10px] flex items-center justify-between rounded-[8px] bg-[#EFEFEF] px-[10px] py-[8px]">
          <span className="text-[12px] font-medium">View</span>
          <div className="text-[10px] text-black/60">
            {productRolloutDates ? (
              <RolloutStatus
                productId={product.id!}
                productHandle={product.handle}
                dropDate={productRolloutDates.drop_date}
                soldOutDate={productRolloutDates.sold_out_date}
                announcementDate={productRolloutDates.announcement_date}
              />
            ) : null}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
