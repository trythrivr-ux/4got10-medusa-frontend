"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ProductActions from "@modules/products/components/product-actions"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@/components/ui"

type MagazineProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

export default function MagazineProductActions({
  product,
  region,
  countryCode,
}: MagazineProductActionsProps) {
  const router = useRouter()
  const [isBuying, setIsBuying] = useState(false)

  const handleBuyNow = async () => {
    setIsBuying(true)
    try {
      // Add to cart first, then navigate to checkout
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variant_id: product.variants?.[0]?.id,
          quantity: 1,
        }),
      })

      if (response.ok) {
        router.push(`/${countryCode}/checkout`)
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsBuying(false)
    }
  }

  return (
    <>
      <Button
        className="w-full h-full justify-between bg-white"
        variant="background"
        size="large"
        onClick={handleBuyNow}
        disabled={isBuying}
      >
        {isBuying ? "Processing..." : "Add To Cart"}
      </Button>
      <Button
        className="w-full h-full justify-between bg-white"
        variant="background"
        size="large"
        onClick={handleBuyNow}
        disabled={isBuying}
      >
        {isBuying ? "Processing..." : "Buy Now"}
      </Button>
    </>
  )
}
