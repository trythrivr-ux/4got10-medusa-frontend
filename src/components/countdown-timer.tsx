"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
  dropDate: Date
  className?: string
}

export function CountdownTimer({
  dropDate,
  className = "",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const dropTime = dropDate.getTime()
      const difference = dropTime - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        )
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        )
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [dropDate])

  const formatTime = (value: number) => value.toString().padStart(2, "0")

  return (
    <div
      className={`fourgot10-pill w-fit flex-row flex justify-center rounded-full bg-[#f3f3f3] px-[12px] h-[25px] text-[11px] tracking-[0.01em] text-black items-center gap-[6px] ${className}`}
    >
      {timeLeft.days > 0 && (
        <>
          <span>{formatTime(timeLeft.days)}d</span>
          <div className="h-[10px] w-[1px] bg-black/15" />
        </>
      )}
      <span>{formatTime(timeLeft.hours)}h</span>
      <div className="h-[10px] w-[1px] bg-black/15" />
      <span>{formatTime(timeLeft.minutes)}m</span>
      <div className="h-[10px] w-[1px] bg-black/15" />
      <span>{formatTime(timeLeft.seconds)}s</span>
    </div>
  )
}
