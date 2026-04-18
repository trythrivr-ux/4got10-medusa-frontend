import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import { Suspense } from "react"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import ProductActionsWrapper from "@modules/products/templates/product-actions-wrapper"
import DeskScene from "@modules/desk/components/desk-scene"

type Props = {
  params: Promise<{ countryCode: string; id: string }>
  searchParams: Promise<{ v_id?: string }>
}

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
) {
  if (!selectedVariantId || !product.variants) {
    return product.images || []
  }

  const variant = product.variants.find((v) => v.id === selectedVariantId)

  if (!variant || !variant.images || !variant.images.length) {
    return product.images || []
  }

  const imageIdsMap = new Map(variant.images.map((i) => [i.id, true]))
  return (product.images || []).filter((i) => imageIdsMap.has(i.id))
}

export default async function ProductByIdPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams

  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const isLikelyProductId = params.id.startsWith("prod_")

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: isLikelyProductId
      ? { id: [params.id] }
      : { handle: params.id },
  }).then(({ response }) => response.products[0])

  if (!product || !product.id) {
    notFound()
  }

  const images = getImagesForVariant(product, searchParams.v_id)

  return (
    <div className="px-[12px]">
      <div className="w-full overflow-hidden pt-[200px] max-h-[1200px] flex flex-col ">
        <div className="w-full h-[900px] flex flex-col ">
          <DeskScene />
        </div>
      </div>
      <div className="flex w-full h-[500px] bg-white rounded-[12px]"></div>
      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={params.countryCode} />
        </Suspense>
      </div>
    </div>
  )
}
