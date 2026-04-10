import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

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
  // Data fetching completely disabled to prevent localStorage SSR errors
  // Return empty state until SSR-safe implementation is ready

  return (
    <div className="w-full py-12">
      <div className="text-center text-gray-500">
        <p>Product loading temporarily disabled to prevent server errors.</p>
        <p className="text-sm mt-2">
          This will be restored with SSR-safe implementation.
        </p>
      </div>
    </div>
  )
}
