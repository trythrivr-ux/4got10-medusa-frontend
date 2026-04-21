"use client"

import { useCustomLayout } from "@/context/custom-layout-context"
import { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"

export default function CustomLayoutWrapper({
  children,
  regions,
}: {
  children: React.ReactNode
  regions: any[]
}) {
  const { customLayout } = useCustomLayout()
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null)

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch("/api/cart")
        const data = await response.json()
        setCart(data.cart || null)
      } catch {
        setCart(null)
      }
    }

    fetchCart()

    const handleCartUpdate = () => {
      fetchCart()
    }

    window.addEventListener("cart-updated", handleCartUpdate)

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate)
    }
  }, [])

  useEffect(() => {
    if (customLayout) {
      document.body.style.overscrollBehavior = "none"
      document.body.style.touchAction = "none"
      document.documentElement.style.overscrollBehavior = "none"
      document.documentElement.style.touchAction = "none"
    } else {
      document.body.style.overscrollBehavior = ""
      document.body.style.touchAction = ""
      document.documentElement.style.overscrollBehavior = ""
      document.documentElement.style.touchAction = ""
    }

    return () => {
      document.body.style.overscrollBehavior = ""
      document.body.style.touchAction = ""
      document.documentElement.style.overscrollBehavior = ""
      document.documentElement.style.touchAction = ""
    }
  }, [customLayout])

  return (
    <div
      className={` flex flex-col ${
        customLayout
          ? "h-screen w-screen fixed top-0 left-0 overflow-hidden touch-action-none overscroll-behavior-none"
          : "relative w-full min-h-screen"
      }`}
    >
      <div className="border-white phone:border-[12px] border-[8px] fixed inset-0 z-10 pointer-events-none pb-[env(safe-area-inset-bottom)]"></div>
      <div className="border-white phone:border-[12px] border-[8px] rounded-[22px] fixed inset-0 z-10 pointer-events-none pb-[env(safe-area-inset-bottom)]"></div>
      <div className="border-white phone:border-[12px] border-[8px] rounded-[14px] fixed inset-0 z-10 pointer-events-none pb-[env(safe-area-inset-bottom)]"></div>
      <div className="bg-gradient-to-t from-[#efefef] to-transparent h-[50px] w-full fixed bottom-0 z-10 pointer-events-none pb-[env(safe-area-inset-bottom)]"></div>

      <main
        className={`relative bg-white ${
          customLayout ? "pt-[env(safe-area-inset-top)]" : ""
        }`}
      >
        {!customLayout && <FourGotTenMenu1 regions={regions} />}

        <div
          className={` ${
            customLayout ? "px-[8px] pt-[8px]" : ""
          } bg-[#efefef] pb-[12px] rounded-[12px]`}
        >
          <FourGotTenMenu regions={regions} cart={cart} />
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
import { retrieveCart } from "@lib/data/cart"
