"use client"

import { useEffect, useState } from "react"

type CountdownTimerProps = {
  targetDate: Date
  onComplete?: () => void
}

export default function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())

  function getTimeLeft() {
    const now = new Date()
    const diff = targetDate.getTime() - now.getTime()
    
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
    }
    
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      total: diff,
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeLeft()
      setTimeLeft(remaining)
      
      if (remaining.total <= 0) {
        clearInterval(interval)
        onComplete?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  if (timeLeft.total <= 0) {
    return null
  }

  // Format with leading zeros
  const format = (n: number) => n.toString().padStart(2, "0")

  // If more than a day, show days
  if (timeLeft.days > 0) {
    return (
      <span className="countdown">
        {timeLeft.days}d {format(timeLeft.hours)}:{format(timeLeft.minutes)}:{format(timeLeft.seconds)}
      </span>
    )
  }

  return (
    <span className="countdown">
      {format(timeLeft.hours)}:{format(timeLeft.minutes)}:{format(timeLeft.seconds)}
    </span>
  )
}
