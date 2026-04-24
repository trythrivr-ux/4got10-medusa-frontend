"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@medusajs/ui"
import CountdownTimer from "@modules/common/components/countdown-timer"
import { useRouter } from "next/navigation"

type RolloutStatusProps = {
  productId: string
  productHandle: string
  dropDate?: string
  soldOutDate?: string
  announcementDate?: string
  onAddToCart?: () => void
}

const RolloutStatus: React.FC<RolloutStatusProps> = ({
  productId,
  productHandle,
  dropDate,
  soldOutDate,
  announcementDate,
  onAddToCart,
}) => {
  const router = useRouter()
  const [status, setStatus] = useState<
    "countdown" | "available" | "sold-out" | "coming-soon"
  >("available")

  useEffect(() => {
    console.log("RolloutStatus props:", {
      dropDate,
      soldOutDate,
      announcementDate,
    })

    const checkStatus = () => {
      const currentTime = new Date()

      const announcementDateObj = announcementDate
        ? new Date(announcementDate)
        : null
      const dropDateObj = dropDate ? new Date(dropDate) : null
      const soldOutDateObj = soldOutDate ? new Date(soldOutDate) : null

      console.log("Date objects:", {
        announcementDateObj,
        dropDateObj,
        soldOutDateObj,
        currentTime,
      })

      // Check if sold out
      if (soldOutDateObj && soldOutDateObj <= currentTime) {
        setStatus("sold-out")
      }
      // Check if not yet announced
      else if (announcementDateObj && announcementDateObj > currentTime) {
        setStatus("coming-soon")
      }
      // Check if in countdown phase (announced but not dropped)
      else if (dropDateObj && dropDateObj > currentTime) {
        setStatus("countdown")
      }
      // Otherwise available
      else {
        setStatus("available")
      }
    }

    checkStatus()
    // Only check status once on mount, let CountdownTimer handle the countdown
  }, [dropDate, soldOutDate, announcementDate])

  const handleCountdownComplete = () => {
    setStatus("available")
  }

  const handleAddToCartClick = () => {
    if (onAddToCart) {
      onAddToCart()
    } else {
      router.push(`/products/${productHandle}`)
    }
  }

  if (status === "sold-out") {
    return (
      <Button disabled className="w-full" variant="secondary">
        Sold Out
      </Button>
    )
  }

  if (status === "coming-soon" && announcementDate) {
    return (
      <div className="w-full p-4 bg-ui-fg-subtle/10 rounded-lg">
        <p className="text-small-regular text-ui-fg-subtle mb-2 text-center">
          Coming Soon
        </p>
        <CountdownTimer
          key={`announcement-${announcementDate}`}
          targetDate={announcementDate}
          onComplete={handleCountdownComplete}
        />
      </div>
    )
  }

  if (status === "countdown" && dropDate) {
    return (
      <div className="w-full p-4 bg-ui-fg-subtle/10 rounded-lg">
        <p className="text-small-regular text-ui-fg-subtle mb-2 text-center">
          Drops in:
        </p>
        <CountdownTimer
          key={`drop-${dropDate}`}
          targetDate={dropDate}
          onComplete={handleCountdownComplete}
        />
      </div>
    )
  }

  return (
    <Button onClick={handleAddToCartClick} className="w-full" variant="primary">
      Add to Cart
    </Button>
  )
}

export default RolloutStatus
