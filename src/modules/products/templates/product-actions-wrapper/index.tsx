import { listProducts } from "@lib/data/products"
import { getActiveRollouts } from "@lib/data/rollouts"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  const product = await listProducts({
    queryParams: { id: [id] },
    regionId: region.id,
  }).then(({ response }) => response.products[0])

  if (!product) {
    return null
  }

  // Fetch rollouts to get rollout dates for this product
  const rolloutsData = await getActiveRollouts()
  const rollouts = (rolloutsData as any)?.rollouts || []

  // Find rollout for this product
  const productRollout = rollouts.find(
    (rollout: any) => rollout.product_ids && rollout.product_ids.includes(id)
  )

  const rolloutDates = productRollout
    ? {
        drop_date: productRollout.drop_date,
        sold_out_date: productRollout.sold_out_date,
        announcement_date: productRollout.announcement_date,
      }
    : undefined

  return (
    <ProductActions
      product={product}
      region={region}
      rolloutDates={rolloutDates}
    />
  )
}
