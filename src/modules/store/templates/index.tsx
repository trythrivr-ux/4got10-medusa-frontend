import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { listCategories } from "@lib/data/categories"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  // Get Magazines category by listing all categories and finding the right one
  const categories = await listCategories().catch(() => [])
  const magazinesCategory = categories.find((cat) =>
    cat.handle?.toLowerCase().includes("magazine")
  )

  return (
    <div className="flex flex-col w-full px-[12px] mt-[85px] small:flex-row small:items-start ">
      <div className="w-full p-[10px] bg-[#D8D8D8] rounded-[12px]">
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber.toString()}
            countryCode={countryCode}
            categoryId={magazinesCategory?.id}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
