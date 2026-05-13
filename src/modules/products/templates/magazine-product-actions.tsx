"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@/components/ui"
import CountdownTimer from "@modules/common/components/countdown-timer"

type MagazineProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  rolloutDates?: {
    drop_date?: string
    sold_out_date?: string
    announcement_date?: string
  }
}

export default function MagazineProductActions({
  product,
  countryCode,
  rolloutDates,
}: MagazineProductActionsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAdding, setIsAdding] = useState(false)
  const [isBuying, setIsBuying] = useState(false)
  const [status, setStatus] = useState<"countdown" | "available" | "sold-out">(
    "available"
  )

  const selectedVariantId = searchParams.get("v_id")
  const selectedVariant =
    product.variants?.find((variant) => variant.id === selectedVariantId) ||
    product.variants?.[0]
  const hasPrice = !!selectedVariant?.calculated_price
  const inStock =
    !!selectedVariant &&
    hasPrice &&
    (!selectedVariant.manage_inventory ||
      selectedVariant.allow_backorder ||
      (selectedVariant.inventory_quantity || 0) > 0)

  useEffect(() => {
    const checkStatus = () => {
      const currentTime = new Date()
      const dropDateObj = rolloutDates?.drop_date
        ? new Date(rolloutDates.drop_date)
        : null
      const soldOutDateObj = rolloutDates?.sold_out_date
        ? new Date(rolloutDates.sold_out_date)
        : null

      // Check if sold out
      if (soldOutDateObj && soldOutDateObj <= currentTime) {
        setStatus("sold-out")
      }
      // Check if in countdown phase
      else if (dropDateObj && dropDateObj > currentTime) {
        setStatus("countdown")
      }
      // Otherwise available
      else {
        setStatus("available")
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 1000)
    return () => clearInterval(interval)
  }, [rolloutDates])

  const handleCountdownComplete = () => {
    setStatus("available")
  }

  const handleAddToCart = async (redirectToCheckout = false) => {
    const variantId = selectedVariant?.id

    if (!variantId || !inStock || !hasPrice) {
      return
    }

    if (redirectToCheckout) {
      setIsBuying(true)
    } else {
      setIsAdding(true)
    }

    try {
      console.info("Magazine add to cart", {
        productId: product.id,
        productHandle: product.handle,
        variantId,
        calculatedPrice: selectedVariant.calculated_price,
        manageInventory: selectedVariant.manage_inventory,
        allowBackorder: selectedVariant.allow_backorder,
        inventoryQuantity: selectedVariant.inventory_quantity,
      })

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variant_id: variantId,
          quantity: 1,
          countryCode,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || "Failed to add item to cart")
      }

      window.dispatchEvent(new Event("cart-updated"))
      router.refresh()

      if (redirectToCheckout) {
        router.push(`/${countryCode}/cart`)
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsAdding(false)
      setIsBuying(false)
    }
  }

  if (status === "sold-out") {
    return (
      <Button
        className="w-full h-full justify-between bg-white"
        variant="background"
        size="large"
        disabled
      >
        Sold Out
      </Button>
    )
  }

  if (status === "countdown" && rolloutDates?.drop_date) {
    return (
      <Button
        className="w-full h-full justify-between bg-white"
        variant="background"
        size="large"
        disabled
      >
        <CountdownTimer
          targetDate={rolloutDates.drop_date}
          onComplete={handleCountdownComplete}
        />
      </Button>
    )
  }

  return (
    <>
      <Button
        className="w-full h-full justify-between bg-white"
        variant="background"
        size="large"
        onClick={() => handleAddToCart(false)}
        disabled={isAdding || isBuying || !selectedVariant?.id || !inStock}
      >
        {isAdding
          ? "Adding..."
          : !hasPrice
          ? "Unavailable"
          : !inStock
          ? "Out of stock"
          : "Add To Cart"}
      </Button>
      <Button
        className="w-full h-full justify-between bg-white"
        variant="background"
        size="large"
        onClick={() => handleAddToCart(true)}
        disabled={isAdding || isBuying || !selectedVariant?.id || !inStock}
      >
        {isBuying
          ? "Processing..."
          : !hasPrice
          ? "Unavailable"
          : !inStock
          ? "Out of stock"
          : "Buy Now"}
      </Button>
    </>
  )
}
