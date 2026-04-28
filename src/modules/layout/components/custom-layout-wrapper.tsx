"use client"

import { useCustomLayout } from "@/context/custom-layout-context"
import { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { usePathname } from "next/navigation"

export default function CustomLayoutWrapper({
  children,
  regions,
  showBackButton,
}: {
  children: React.ReactNode
  regions: any[]
  showBackButton?: boolean
}) {
  const { customLayout } = useCustomLayout()
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null)
  const pathname = usePathname()

  // Check if we're on the home page (e.g., "/us" or "/dk")
  const isHomePage = pathname?.match(/^\/[a-z]{2}$/) !== null

  // Check if we're on a product detail page
  const isProductPage =
    pathname?.match(/^\/[a-z]{2}\/products\/[^/]+$/) !== null

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
    } else if (isHomePage) {
      // Prevent body scroll on home page since we have our own scroll container
      document.body.style.overflow = "hidden"
      document.documentElement.style.overflow = "hidden"
    } else {
      document.body.style.overscrollBehavior = ""
      document.body.style.touchAction = ""
      document.documentElement.style.overscrollBehavior = ""
      document.documentElement.style.touchAction = ""
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
    }

    return () => {
      document.body.style.overscrollBehavior = ""
      document.body.style.touchAction = ""
      document.documentElement.style.overscrollBehavior = ""
      document.documentElement.style.touchAction = ""
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
    }
  }, [customLayout, isHomePage])

  return (
    <div
      className={` flex flex-col ${
        customLayout
          ? "h-screen w-screen fixed top-0 left-0 overflow-hidden touch-action-none overscroll-behavior-none"
          : isHomePage
          ? "h-screen w-full overflow-hidden"
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
        {!customLayout && !isHomePage && <FourGotTenMenu1 regions={regions} />}

        <div
          className={` ${
            customLayout ? "px-[8px] pt-[8px]" : ""
          } bg-[#efefef] pb-[12px] rounded-[12px]`}
        >
          {!isHomePage && (
            <FourGotTenMenu
              regions={regions}
              cart={cart}
              showBackButton={showBackButton || isProductPage}
            />
          )}
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
