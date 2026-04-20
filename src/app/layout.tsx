import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "@lib/util/storage-polyfill"
import "@lib/util/global-error-handler"
import "styles/globals.css"
import FourGotTenMenu from "@modules/layout/components/4got10-menu"
import FourGotTenMenu1 from "@/modules/layout/components/top-menu"
import { listRegions } from "@lib/data/regions"
import { retrieveCart } from "@lib/data/cart"
import Footer from "@/modules/layout/templates/footer"
import { CustomLayoutProvider } from "@/context/custom-layout-context"
import CustomLayoutWrapper from "@/modules/layout/components/custom-layout-wrapper"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const regions = await listRegions().catch(() => [])
  const cart = await retrieveCart().catch(() => null)

  return (
    <html lang="en" data-mode="light">
      <body className="bg-white">
        <CustomLayoutProvider>
          <div className="p-[8px] phone:p-[12px]">
            <CustomLayoutWrapper regions={regions}>
              {props.children}
            </CustomLayoutWrapper>
          </div>
        </CustomLayoutProvider>
      </body>
    </html>
  )
}
