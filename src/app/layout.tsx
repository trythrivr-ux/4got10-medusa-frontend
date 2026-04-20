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

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const regions = await listRegions().catch(() => [])
  const cart = await retrieveCart().catch(() => null)

  return (
    <html lang="en" data-mode="light">
      <body className="bg-white">
        <div className="p-[8px] phone:p-[12px]">
          <div className="min-h-screen relative w-full flex flex-col">
            <div className="border-white phone:border-[12px] border-[8px] fixed inset-0 z-10 pointer-events-none"></div>
            <div className="bg-gradient-to-t from-[#efefef] to-transparent h-[50px] w-full fixed bottom-0 z-10 pointer-events-none"></div>

            <div className="border-white phone:border-[12px] border-[8px] rounded-[22px] fixed inset-0 z-10 pointer-events-none"></div>
            <main className="relative bg-white">
              <FourGotTenMenu1 regions={regions} />

              <div className="bg-[#efefef] pb-[12px] rounded-[12px]">
                <FourGotTenMenu regions={regions} cart={cart} />
                {props.children}
                <div className="px-[12px] hidden pt-[12px]">
                  <div className="flex rounded-[12px] bg-white h-[150px]"></div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
