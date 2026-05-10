import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "@lib/util/storage-polyfill"
import "@lib/util/global-error-handler"
import "styles/fonts.css"
import "styles/globals.css"
import { listRegions } from "@lib/data/regions"
import { CustomLayoutProvider } from "@/context/custom-layout-context"
import CustomLayoutWrapper from "@/modules/layout/components/custom-layout-wrapper"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const regions = await listRegions().catch(() => [])

  return (
    <html lang="en" data-mode="light" className={plusJakartaSans.variable}>
      <body className="bg-[#ffffff] overflow-x-hidden">
        <CustomLayoutProvider>
          <CustomLayoutWrapper regions={regions}>
            {props.children}
          </CustomLayoutWrapper>
        </CustomLayoutProvider>
      </body>
    </html>
  )
}
