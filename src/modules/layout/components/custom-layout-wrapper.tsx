"use client"

import { useCustomLayout } from "@/context/custom-layout-context"

export default function CustomLayoutWrapper({
  children,
  regions,
}: {
  children: React.ReactNode
  regions: any[]
}) {
  const { customLayout } = useCustomLayout()

  return (
    <div
      className={`relative flex flex-col ${
        customLayout ? "h-screen " : "w-full min-h-screen"
      }`}
    >
      <div className="border-white phone:border-[12px] border-[8px] fixed inset-0 z-10 pointer-events-none"></div>
      <div className="bg-gradient-to-t from-[#efefef] to-transparent h-[50px] w-full fixed bottom-0 z-10 pointer-events-none"></div>

      <div className="border-white phone:border-[12px] border-[8px] rounded-[22px] fixed inset-0 z-10 pointer-events-none"></div>
      <main className="relative bg-white">
        {!customLayout && <FourGotTenMenu1 regions={regions} />}

        <div className="bg-[#efefef]  pb-[12px] rounded-[12px]">
          <FourGotTenMenu regions={regions} cart={null} />
          {children}
          <div className="px-[12px] hidden pt-[12px]">
            <div className="flex rounded-[12px] bg-white h-[150px]"></div>
          </div>
        </div>
      </main>
    </div>
  )
}

import FourGotTenMenu1 from "@/modules/layout/components/top-menu"
import FourGotTenMenu from "@modules/layout/components/4got10-menu"
