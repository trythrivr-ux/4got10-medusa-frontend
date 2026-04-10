"use client"

import { useEffect, useState, useRef } from "react"
import { HttpTypes } from "@medusajs/types"

type CountdownButtonProps = {
  product: HttpTypes.StoreProduct | null
  dropDate: Date | null
}

export default function CountdownButton({
  product,
  dropDate,
}: CountdownButtonProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!dropDate) return

    const updateCountdown = () => {
      const now = new Date()
      const diff = dropDate.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      )
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    updateCountdown()
    intervalRef.current = setInterval(updateCountdown, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [dropDate])

  if (!product || !dropDate) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-[8px]">
        <p className="text-black text-lg font-bold">Open</p>
      </div>
    )
  }

  const pad = (n: number) => String(n).padStart(2, "0")

  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-[8px] gap-[8px]">
      <p className="text-black/60 text-xs font-medium uppercase tracking-wide">
        {product.title}
      </p>
      <div className="flex flex-row items-center gap-[4px]">
        <div className="flex flex-col items-center">
          <span className="text-black text-lg font-bold">{timeLeft.days}</span>
          <span className="text-black/40 text-[10px] uppercase">d</span>
        </div>
        <span className="text-black/30 text-lg">:</span>
        <div className="flex flex-col items-center">
          <span className="text-black text-lg font-bold">
            {pad(timeLeft.hours)}
          </span>
          <span className="text-black/40 text-[10px] uppercase">h</span>
        </div>
        <span className="text-black/30 text-lg">:</span>
        <div className="flex flex-col items-center">
          <span className="text-black text-lg font-bold">
            {pad(timeLeft.minutes)}
          </span>
          <span className="text-black/40 text-[10px] uppercase">m</span>
        </div>
        <span className="text-black/30 text-lg">:</span>
        <div className="flex flex-col items-center">
          <span className="text-black text-lg font-bold">
            {pad(timeLeft.seconds)}
          </span>
          <span className="text-black/40 text-[10px] uppercase">s</span>
        </div>
      </div>
    </div>
  )
}
