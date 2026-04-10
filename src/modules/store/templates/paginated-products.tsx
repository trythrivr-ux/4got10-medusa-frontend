import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
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

  return (
    <>
      <ul
        className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="products-list"
      >
        {products.map((p) => (
          <li key={p.id}>
            <ProductPreview product={p} region={region!} />
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
