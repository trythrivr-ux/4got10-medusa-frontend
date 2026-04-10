import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "@lib/util/storage-polyfill"
import "@lib/util/global-error-handler"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
