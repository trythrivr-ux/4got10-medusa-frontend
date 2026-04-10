import { Metadata } from "next"
import LandingPageClient from "./LandingPageClient"

export const metadata: Metadata = {
  title: "Landing Page - 3D Model",
  description: "Interactive 3D paper model experience",
}

export default async function LandingPage() {
  return <LandingPageClient />
}
