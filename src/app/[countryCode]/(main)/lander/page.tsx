import { Metadata } from "next"
import LandingPageClient from "./LanderPageCLient"
import { listProducts } from "@lib/data/products"

export const metadata: Metadata = {
  title: "Magazine Lander",
  description: "Centered 3D magazine landing page",
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const { response } = await listProducts({
    countryCode,
    queryParams: {
      limit: 100,
      category_handle: ["magazines"],
      sort: "created_at",
      fields: "id,title,handle,thumbnail,created_at,*images,*images.url",
    },
  }).catch(() => ({ response: { products: [], count: 0 } }))

  const products = [...response.products].sort((a, b) => {
    const first = new Date(a.created_at || 0).getTime()
    const second = new Date(b.created_at || 0).getTime()
    return first - second
  })

  return <LandingPageClient products={products} />
}
