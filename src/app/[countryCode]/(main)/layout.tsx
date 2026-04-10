import { Metadata } from "next"

import "@lib/util/storage-polyfill"
import "@lib/util/global-error-handler"
import ErrorBoundary from "@modules/common/components/error-boundary"
import { getBaseURL } from "@lib/util/env"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  // SSR-safe layout - no server-side data fetching
  // All Medusa interactions will be client-side only

  return (
    <>
      <ErrorBoundary>
        <div className="min-h-screen bg-white">
          <header className="bg-black text-white p-4">
            <h1 className="text-2xl font-bold">4got10</h1>
          </header>
          <main className="container mx-auto px-4 py-8">{props.children}</main>
        </div>
      </ErrorBoundary>
    </>
  )
}
