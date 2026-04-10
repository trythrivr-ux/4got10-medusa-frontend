"use client"

import { Heart } from "@medusajs/icons"
import { useState } from "react"
import { addToWishlist, removeFromWishlist } from "@lib/data/wishlist"

type WishlistButtonProps = {
  productId: string
  variantId?: string
  isInWishlist?: boolean
}

export default function WishlistButton({ productId, variantId, isInWishlist = false }: WishlistButtonProps) {
  const [isInList, setIsInList] = useState(isInWishlist)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      if (isInList) {
        await removeFromWishlist(productId)
        setIsInList(false)
      } else {
        await addToWishlist(productId, variantId)
        setIsInList(true)
      }
    } catch (error) {
      console.error("Failed to toggle wishlist", error)
      // Could redirect to login here if unauthorized
    }
    setIsLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className="group h-[38px] w-[38px] flex items-center justify-center bg-[#ffffff] rounded-[11px] hover:bg-[#cbcbcb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title={isInList ? "Remove from wishlist" : "Add to wishlist"}
      data-testid="wishlist-button"
    >
      <Heart 
        className={`ml-[0px] mt-[5px] w- h-5 ${isInList ? "fill-[#4a4a4a] text-[#4a4a4a]" : "fill-[#969696] text-[#969696]"} group-hover:fill-white group-hover:text-white`}
      />
    </button>
  )
}
