"use client"

import { useCustomLayout } from "@/context/custom-layout-context"
import { useEffect, useRef, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { usePathname } from "next/navigation"
import gsap from "gsap"
import { TransitionProvider } from "@/context/transition-context"
import FourGotTenMenu from "@modules/layout/components/4got10-menu"
import Image from "next/image"

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
  const curtainRef = useRef<HTMLDivElement>(null)
  const prevPathname = useRef(pathname)

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

  useEffect(() => {
    const curtain = curtainRef.current
    if (!curtain) return

    const tl = gsap.timeline()

    tl.to(curtain, {
      y: "100%",
      duration: 0.4,
      ease: "power3.out",
      delay: 1.5,
    })

    return () => {
      tl.kill()
    }
  }, [])

  useEffect(() => {
    if (prevPathname.current === pathname) return
    prevPathname.current = pathname

    const curtain = curtainRef.current
    if (!curtain) return

    const tl = gsap.timeline()

    tl.set(curtain, { y: "0%" }).to(curtain, {
      y: "100%",
      duration: 0.4,
      ease: "power3.out",
      delay: 1.5,
    })

    return () => {
      tl.kill()
    }
  }, [pathname])

  return (
    <TransitionProvider curtainRef={curtainRef}>
      <div
        className={` flex flex-col ${
          customLayout
            ? "fixed inset-0 w-full h-full p-[12px] overflow-hidden touch-action-none overscroll-behavior-none"
            : isHomePage
            ? "fixed inset-0 w-full h-full rounded-[12px] overflow-hidden p-[12px]"
            : "fixed inset-0 w-full h-full rounded-[12px] overflow-hidden p-[12px]"
        }`}
      >
        <div
          ref={curtainRef}
          className="fixed inset-0 z-[999] bg-[#ffffff] pointer-events-none flex items-center justify-center"
          style={{ transform: "translateY(0%)" }}
        >
          <div className="flex items-center gap-[20px]">
            <Image
              src="/menu-icons/4got10-2/group-1.svg"
              alt=""
              width={100}
              height={100}
              className="w-fit max-h-[44px]"
            />
            <Image
              src="/menu-icons/4got10-2/group-2.svg"
              alt=""
              width={100}
              height={100}
              className="w-fit max-h-[44px]"
            />
          </div>
        </div>
        <main
          className={`relative w-full bg-[#efefef] h-full rounded-[12px] overflow-hidden ${
            customLayout ? "pt-[env(safe-area-inset-top)]" : ""
          }`}
        >
          <div
            className="h-full rounded-[12px] overflow-y-auto no-scrollbar"
            data-scroll-container
          >
            {!isHomePage && (
              <FourGotTenMenu
                regions={regions}
                cart={cart}
                showBackButton={showBackButton || isProductPage}
              />
            )}
            {children}
          </div>
        </main>
      </div>
    </TransitionProvider>
  )
}
