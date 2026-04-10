"use client"

import { usePathname } from "next/navigation"
import { useProduct } from "@modules/products/context/product-context"
import UniversalAddToCart from "../universal-add-to-cart"
import { useState, useEffect } from "react"

export default function BottomNavbar() {
  const pathname = usePathname()
  const { product, productMeta } = useProduct()
  const [isVisible, setIsVisible] = useState(false)
  
  // Check if we're on a product page
  const isProductPage = pathname.includes('/products/')
  
  // Show bottom navbar when scrolled past 50% of viewport
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const viewportHeight = window.innerHeight
      setIsVisible(scrollY > viewportHeight * 0.5)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  if (!isProductPage || !product) {
    return null
  }
  
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 py-3 flex items-center justify-center gap-[8px]">
        <UniversalAddToCart product={product} productMeta={productMeta} />
      </div>
    </div>
  )
}
