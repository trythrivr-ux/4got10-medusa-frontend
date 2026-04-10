import { Metadata } from "next"
import DeskScene from "@modules/desk/components/desk-scene"

export const metadata: Metadata = {
  title: "Desk",
  description: "3D desk view with magazine",
}

export default async function DeskPage() {
  return (
    <div className="w-full h-screen bg-[#e8e8e8]">
      <DeskScene />
    </div>
  )
}
