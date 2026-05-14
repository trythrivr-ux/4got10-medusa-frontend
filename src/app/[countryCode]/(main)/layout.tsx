import { Metadata } from "next"

import "@lib/util/storage-polyfill"
import "@lib/util/global-error-handler"
import ErrorBoundary from "@modules/common/components/error-boundary"
import { getBaseURL } from "@lib/util/env"
import { CustomLayoutProvider } from "@/context/custom-layout-context"
import { CookieBanner } from "@/components/cookie-banner"
import WebsiteLockGuard from "@/components/website-lock-guard"
import PreviewUnlock from "@/components/preview-unlock"
import { RolloutProvider } from "@/context/rollout-context"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  process.env.MEDUSA_BACKEND_URL ||
  "http://localhost:9000"
const PK = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getBaseURL()

  const fallback: Metadata = {
    metadataBase: new URL(baseUrl),
    title: "4got10 Magazine",
    description:
      "A limited-edition culture magazine covering music, fashion, art, and the stories the world forgot.",
    openGraph: {
      title: "4got10 Magazine",
      description:
        "A limited-edition culture magazine covering music, fashion, art, and the stories the world forgot.",
      images: [
        {
          url: "/api/og/store",
          width: 1200,
          height: 630,
          alt: "4got10 Magazine",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "4got10 Magazine",
      description:
        "A limited-edition culture magazine covering music, fashion, art, and the stories the world forgot.",
      images: ["/api/og/store"],
    },
  }

  try {
    const res = await fetch(`${BACKEND_URL}/store/rollouts`, {
      headers: PK ? { "x-publishable-api-key": PK } : {},
      next: { revalidate: 300 },
    })
    if (!res.ok) return fallback

    const { rollouts } = await res.json()
    if (!rollouts?.length) return fallback

    const now = new Date()

    // Find the first rollout that has been announced
    const active = (rollouts as any[]).find((r) => {
      if (!r.announcement_date) return false
      return new Date(r.announcement_date) <= now
    })
    if (!active) return fallback

    const dropDate = active.drop_date ? new Date(active.drop_date) : null
    const soldOutDate = active.sold_out_date
      ? new Date(active.sold_out_date)
      : null

    // Pick OG image: first rollout media URL, else first product thumbnail
    const mediaImageUrl: string | null = active.media_urls?.[0] || null
    const productThumbnail: string | null =
      active.products?.[0]?.thumbnail ||
      active.products?.[0]?.images?.[0]?.url ||
      null
    const rawImageUrl = mediaImageUrl || productThumbnail

    const ogImageUrl = rawImageUrl
      ? `${baseUrl}/api/og/product?thumbnail=${encodeURIComponent(
          rawImageUrl
        )}&title=${encodeURIComponent(active.name ?? "")}`
      : `${baseUrl}/api/og/store`

    // Determine the product title
    const productTitle: string =
      active.products?.[0]?.title || active.name || "Magazine"

    // Determine rollout state and build copy
    let title: string
    let description: string

    if (soldOutDate && soldOutDate <= now) {
      title = `Sold out — ${productTitle}`
      description = `${productTitle} is sold out. Stay tuned for the next limited drop from 4got10 Magazine.`
    } else if (dropDate && dropDate <= now) {
      title = `Just dropped — ${productTitle}`
      description = `${productTitle} is now available. Grab your limited-edition copy from 4got10 Magazine before it sells out.`
    } else {
      title = `Releasing soon — ${productTitle}`
      description = `${productTitle} is dropping soon. Be first in line for the next limited-edition issue from 4got10 Magazine.`
    }

    return {
      metadataBase: new URL(baseUrl),
      title,
      description,
      openGraph: {
        title: `${title} | 4got10 Magazine`,
        description,
        images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | 4got10 Magazine`,
        description,
        images: [ogImageUrl],
      },
    }
  } catch {
    return fallback
  }
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  // SSR-safe layout - no server-side data fetching
  // All Medusa interactions will be client-side only

  return (
    <>
      <CustomLayoutProvider>
        <RolloutProvider>
          <WebsiteLockGuard>
            <ErrorBoundary>
              <main className="w-full">{props.children}</main>
              <CookieBanner />
            </ErrorBoundary>
          </WebsiteLockGuard>
          <PreviewUnlock />
        </RolloutProvider>
      </CustomLayoutProvider>
    </>
  )
}
