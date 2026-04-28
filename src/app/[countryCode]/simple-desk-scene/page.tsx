import { Metadata } from "next"
import SimpleDeskScene from "@modules/desk/components/simple-desk-scene"

export const metadata: Metadata = {
  title: "Simple Desk",
  description: "Simplified 3D desk view with magazine",
}

export default async function SimpleDeskPage() {
  return (
    <div className="w-full h-screen bg-transparent">
      <SimpleDeskScene />
    </div>
  )
}
