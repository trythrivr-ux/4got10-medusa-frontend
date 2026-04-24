import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getActiveRollouts } from "@lib/data/rollouts"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page, 10) : 1
  const limit = 12
  const offset = (pageNumber - 1) * limit

  const region = await getRegion(countryCode)

  const { response, nextPage } = await listProducts({
    pageParam: pageNumber,
    queryParams: {
      limit,
      offset,
      collection_id: collectionId,
      category_id: categoryId,
      id: productsIds,
    },
    countryCode,
  }).catch(() => ({ response: { products: [], count: 0 }, nextPage: null }))

  const { products, count } = response
  const totalPages = Math.ceil(count / limit)

  // Fetch active rollouts to get rollout dates for products
  const rolloutsData = await getActiveRollouts()
  const rollouts = (rolloutsData as any)?.rollouts || []

  const now = new Date()

  // Create a map of product IDs to their rollout dates
  const productRolloutDates: Record<
    string,
    { drop_date?: string; sold_out_date?: string; announcement_date?: string }
  > = {}

  // Track products that are in rollouts but not yet announced
  const unannouncedProductIds = new Set<string>()

  for (const rollout of rollouts) {
    const productIds = rollout.product_ids || []
    const announcementDate = rollout.announcement_date
      ? new Date(rollout.announcement_date)
      : null

    for (const productId of productIds) {
      productRolloutDates[productId] = {
        drop_date: rollout.drop_date,
        sold_out_date: rollout.sold_out_date,
        announcement_date: rollout.announcement_date,
      }

      // If announcement date is in the future, mark as unannounced
      if (announcementDate && announcementDate > now) {
        unannouncedProductIds.add(productId)
      }
    }
  }

  // Filter out products that are in rollouts but not yet announced
  const visibleProducts = products.filter(
    (p) => !unannouncedProductIds.has(p.id!)
  )

  return (
    <>
      <ul
        className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="products-list"
      >
        {visibleProducts.map((p) => (
          <li key={p.id}>
            <ProductPreview
              product={p}
              region={region!}
              rolloutDates={productRolloutDates[p.id!]}
            />
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={pageNumber}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
