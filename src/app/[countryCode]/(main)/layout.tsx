import { Metadata } from "next"

import "@lib/util/storage-polyfill"
import "@lib/util/global-error-handler"
import ErrorBoundary from "@modules/common/components/error-boundary"
import { getBaseURL } from "@lib/util/env"
import { CustomLayoutProvider } from "@/context/custom-layout-context"
import { LoadingAnimation } from "@/components/loading-animation"
import { CookieBanner } from "@/components/cookie-banner"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  // SSR-safe layout - no server-side data fetching
  // All Medusa interactions will be client-side only

  return (
    <>
      <CustomLayoutProvider>
        <LoadingAnimation />
        <ErrorBoundary>
          <main className="w-full">{props.children}</main>
          <CookieBanner />
        </ErrorBoundary>
      </CustomLayoutProvider>
    </>
  )
}
