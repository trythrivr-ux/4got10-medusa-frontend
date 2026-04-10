"use client"

import { useState, useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import { addToCart } from "@lib/data/cart"
import { useParams } from "next/navigation"
import WishlistButton from "@modules/products/components/wishlist-button"
import { useSelectedVariant } from "@modules/products/context/selected-variant-context"
import { ProductMeta } from "@lib/data/products"

type UniversalAddToCartProps = {
  product: HttpTypes.StoreProduct
  productMeta?: ProductMeta | null
}

export default function UniversalAddToCart({ product, productMeta }: UniversalAddToCartProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isDropped, setIsDropped] = useState(true)
  const [isSoldOut, setIsSoldOut] = useState(false)
  const countryCode = useParams().countryCode as string
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const soldOutIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const { selectedVariant } = useSelectedVariant()

  const dropDateRef = useRef<Date | null>(null)
  const soldOutDateRef = useRef<Date | null>(null)
  
  useEffect(() => {
    dropDateRef.current = productMeta?.drop_date ? new Date(productMeta.drop_date) : null
    soldOutDateRef.current = productMeta?.sold_out_date ? new Date(productMeta.sold_out_date) : null
    
    // Initialize states based on dates
    const now = new Date()
    if (dropDateRef.current) {
      setIsDropped(dropDateRef.current <= now)
    } else {
      setIsDropped(true)
    }
    if (soldOutDateRef.current) {
      setIsSoldOut(soldOutDateRef.current <= now)
    } else {
      setIsSoldOut(false)
    }
  }, [productMeta?.drop_date, productMeta?.sold_out_date])

  useEffect(() => {
    const updateCountdown = () => {
      const dropDate = dropDateRef.current
      if (!dropDate) {
        setIsDropped(true)
        return
      }

      const now = new Date()
      const diff = dropDate.getTime() - now.getTime()
      
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        setIsDropped(true)
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current)
          countdownIntervalRef.current = null
        }
        return
      }
      
      setIsDropped(false)
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setCountdown({ days, hours, minutes, seconds })
    }
    
    updateCountdown()
    countdownIntervalRef.current = setInterval(updateCountdown, 1000)
    
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const checkSoldOut = () => {
      const soldOutDate = soldOutDateRef.current
      if (!soldOutDate) {
        setIsSoldOut(false)
        return
      }
      setIsSoldOut(soldOutDate <= new Date())
    }
    
    checkSoldOut()
    soldOutIntervalRef.current = setInterval(checkSoldOut, 1000)
    
    return () => {
      if (soldOutIntervalRef.current) {
        clearInterval(soldOutIntervalRef.current)
        soldOutIntervalRef.current = null
      }
    }
  }, [])

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return

    setIsAdding(true)
    await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode,
    })
    setIsAdding(false)
  }

  const inStock = selectedVariant && (!selectedVariant.manage_inventory || (selectedVariant.inventory_quantity || 0) > 0 || selectedVariant.allow_backorder)

  const formatCountdown = () => {
    const pad = (n: number) => String(n).padStart(2, '0')
    if (countdown.days > 0) {
      return `${countdown.days}d ${pad(countdown.hours)}:${pad(countdown.minutes)}:${pad(countdown.seconds)}`
    }
    return `${pad(countdown.hours)}:${pad(countdown.minutes)}:${pad(countdown.seconds)}`
  }

  return (
    <div className="rounded-[14px] items-center p-[8px] flex flex-row gap-[7px] bg-[#D1D1D133] backdrop-blur-lg w-fit h-fit">
      <WishlistButton productId={product.id} variantId={selectedVariant?.id} />
      <div className="flex flex-row w-[1.8px] h-[15px] bg-[#d8d8d8]"></div>
      
      {!isDropped && dropDateRef.current ? (
        <div className="button-large px-6 h-[38px] flex items-center justify-center gap-[6px] text-black text-[11px] bg-white">
          <p>{formatCountdown()}</p>
        </div>
      ) : isSoldOut ? (
        <button
          disabled
          className="button-large h-[38px] px-6 opacity-50 cursor-not-allowed"
        >
          Sold Out
        </button>
      ) : (
        <button
          onClick={handleAddToCart}
          disabled={!inStock || !selectedVariant || isAdding}
          className="button-large h-[38px] px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="add-product-button"
        >
          {isAdding ? (
            <span className="animate-pulse">Adding...</span>
          ) : !selectedVariant ? (
            "Select variant"
          ) : !inStock ? (
            "Out of stock"
          ) : selectedVariant.options?.[0]?.value ? (
            `Add "${selectedVariant.options[0].value}" to cart`
          ) : (
            "Add to cart"
          )}
        </button>
      )}
    </div>
  )
}
