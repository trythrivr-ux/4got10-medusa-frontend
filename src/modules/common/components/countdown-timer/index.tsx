"use client"

import React, { useState, useEffect } from "react"

type CountdownTimerProps = {
  targetDate: string
  onComplete?: () => void
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  onComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isComplete, setIsComplete] = useState(false)
  const [isValidDate, setIsValidDate] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!targetDate) {
      console.error("No target date provided")
      setIsValidDate(false)
      setIsLoading(false)
      return
    }

    const target = new Date(targetDate).getTime()

    // Check if the date is valid
    if (isNaN(target)) {
      console.error("Invalid target date:", targetDate)
      setIsValidDate(false)
      setIsLoading(false)
      return
    }

    setIsValidDate(true)
    console.log(
      "CountdownTimer initialized with target:",
      new Date(target).toISOString()
    )

    // Initial calculation
    const now = new Date().getTime()
    const difference = target - now

    if (difference <= 0) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      setIsComplete(true)
      setIsLoading(false)
      onComplete?.()
      return
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    )
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((difference % (1000 * 60)) / 1000)

    setTimeLeft({ days, hours, minutes, seconds })
    setIsLoading(false)

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const difference = target - now

      console.log(
        "Countdown tick - difference:",
        difference,
        "seconds:",
        Math.floor(difference / 1000)
      )

      if (difference <= 0) {
        clearInterval(interval)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        setIsComplete(true)
        console.log("Countdown complete")
        onComplete?.()
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        )
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        )
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      }
    }, 1000)

    return () => {
      console.log("Cleaning up interval")
      clearInterval(interval)
    }
  }, [targetDate, onComplete])

  if (!isValidDate) {
    return <div className="text-sm text-ui-fg-subtle">Invalid date</div>
  }

  if (isLoading) {
    return (
      <div className="flex gap-2 items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-6 bg-ui-fg-subtle/20 animate-pulse rounded" />
          <div className="w-8 h-3 bg-ui-fg-subtle/20 animate-pulse rounded mt-1" />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-6 bg-ui-fg-subtle/20 animate-pulse rounded" />
          <div className="w-8 h-3 bg-ui-fg-subtle/20 animate-pulse rounded mt-1" />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-6 bg-ui-fg-subtle/20 animate-pulse rounded" />
          <div className="w-8 h-3 bg-ui-fg-subtle/20 animate-pulse rounded mt-1" />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-6 bg-ui-fg-subtle/20 animate-pulse rounded" />
          <div className="w-8 h-3 bg-ui-fg-subtle/20 animate-pulse rounded mt-1" />
        </div>
      </div>
    )
  }

  if (isComplete) {
    return null
  }

  return (
    <div className="flex gap-2 items-center justify-center">
      {timeLeft.days > 0 && (
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{timeLeft.days}</span>
          <span className="text-xs text-ui-fg-subtle">Days</span>
        </div>
      )}
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold">{timeLeft.hours}</span>
        <span className="text-xs text-ui-fg-subtle">Hours</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold">{timeLeft.minutes}</span>
        <span className="text-xs text-ui-fg-subtle">Minutes</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold">{timeLeft.seconds}</span>
        <span className="text-xs text-ui-fg-subtle">Seconds</span>
      </div>
    </div>
  )
}

export default CountdownTimer
