import { Text } from "@medusajs/ui"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import RolloutStatus from "./rollout-status"

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
      <div data-testid="product-wrapper">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <div className="flex txt-compact-medium mt-4 justify-between">
          <Text className="text-ui-fg-subtle" data-testid="product-title">
            {product.title}
          </Text>
          <div className="flex items-center gap-x-2">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
        {productRolloutDates && (
          <div className="mt-3">
            <RolloutStatus
              productId={product.id!}
              productHandle={product.handle}
              dropDate={productRolloutDates.drop_date}
              soldOutDate={productRolloutDates.sold_out_date}
              announcementDate={productRolloutDates.announcement_date}
            />
          </div>
        )}
      </div>
    </LocalizedClientLink>
  )
}
