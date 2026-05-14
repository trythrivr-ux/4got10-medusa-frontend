import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse the full collection of 4got10 limited-edition magazines. Each issue tells the stories the world forgot.",
  openGraph: {
    title: "Shop | 4got10 Magazine",
    description:
      "Browse the full collection of 4got10 limited-edition magazines.",
    images: [
      {
        url: "/api/og/store",
        width: 1200,
        height: 630,
        alt: "4got10 Magazine — Shop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop | 4got10 Magazine",
    description:
      "Browse the full collection of 4got10 limited-edition magazines.",
    images: ["/api/og/store"],
  },
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { sortBy, page } = searchParams

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
    />
  )
}
