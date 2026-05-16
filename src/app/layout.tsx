import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "@lib/util/storage-polyfill"
import "@lib/util/global-error-handler"
import "styles/fonts.css"
import "styles/globals.css"
import { listRegions } from "@lib/data/regions"
import { CustomLayoutProvider } from "@/context/custom-layout-context"
import { RolloutProvider } from "@/context/rollout-context"
import CustomLayoutWrapper from "@/modules/layout/components/custom-layout-wrapper"
import GeolocationRedirect from "@/components/geolocation-redirect"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  title: {
    default: "4got10 Magazine",
    template: "%s | 4got10 Magazine",
  },
  description:
    "4got10 is a limited-edition culture magazine covering music, fashion, art, and the stories the world forgot.",
  keywords: [
    "4got10",
    "magazine",
    "culture",
    "music",
    "fashion",
    "art",
    "limited edition",
  ],
  authors: [{ name: "4got10" }],
  creator: "4got10",
  publisher: "4got10",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    siteName: "4got10 Magazine",
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
    site: "@4got10mag",
    title: "4got10 Magazine",
    description:
      "A limited-edition culture magazine covering music, fashion, art, and the stories the world forgot.",
    images: ["/api/og/store"],
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const regions = await listRegions().catch(() => [])

  return (
    <html lang="en" data-mode="light" className={plusJakartaSans.variable}>
      <body className="bg-[#ffffff] overflow-x-hidden">
        <RolloutProvider>
          <CustomLayoutProvider>
            <CustomLayoutWrapper regions={regions}>
              <GeolocationRedirect />
              {props.children}
            </CustomLayoutWrapper>
          </CustomLayoutProvider>
        </RolloutProvider>
      </body>
    </html>
  )
}
