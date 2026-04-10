import { Metadata } from "next"
import DeskScene1 from "@modules/desk/components/desk-scene-1"

export const metadata: Metadata = {
  title: "Desk 1",
  description: "3D desk view with magazine - backup",
}

export default async function Desk1Page() {
  return (
    <div className="w-full h-screen bg-[#f5f5f5]">
      <DeskScene1 />
    </div>
  )
}
