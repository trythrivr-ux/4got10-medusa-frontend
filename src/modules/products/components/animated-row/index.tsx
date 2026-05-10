"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"

type AnimatedRowProps = {
  itemsPerSide?: 3 | 4
}

const AnimatedRow = ({ itemsPerSide: fixedItemsPerSide }: AnimatedRowProps) => {
  const leftRowRef = useRef<HTMLDivElement>(null)
  const rightRowRef = useRef<HTMLDivElement>(null)
  const [itemsPerSide, setItemsPerSide] = useState(
    () =>
      fixedItemsPerSide ??
      (typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
        ? 4
        : 3)
  )

  useEffect(() => {
    if (fixedItemsPerSide) {
      setItemsPerSide(fixedItemsPerSide)
      return
    }

    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    const updateItemsPerSide = () => {
      setItemsPerSide(mediaQuery.matches ? 4 : 3)
    }

    updateItemsPerSide()
    mediaQuery.addEventListener("change", updateItemsPerSide)

    return () => {
      mediaQuery.removeEventListener("change", updateItemsPerSide)
    }
  }, [fixedItemsPerSide])

  useEffect(() => {
    const leftRow = leftRowRef.current
    const rightRow = rightRowRef.current
    if (!leftRow || !rightRow) return

    let interval: NodeJS.Timeout
    let isAnimating = false
    let activeTimeline: gsap.core.Timeline | null = null
    const itemBasis = `${100 / itemsPerSide}%`
    const itemPadding = 5

    const resetRows = () => {
      const leftItems = Array.from(
        leftRow.querySelectorAll("[data-side='left']")
      ) as HTMLElement[]
      const rightItems = Array.from(
        rightRow.querySelectorAll("[data-side='right']")
      ) as HTMLElement[]

      gsap.killTweensOf([...leftItems, ...rightItems])

      leftItems.forEach((div, i) => {
        if (i >= itemsPerSide) {
          div.remove()
          return
        }

        gsap.set(div, {
          flexBasis: itemBasis,
          width: "auto",
          paddingLeft: i === 0 ? 0 : itemPadding,
          paddingRight: i === itemsPerSide - 1 ? 0 : itemPadding,
        })
      })

      rightItems.forEach((div, i) => {
        if (i >= itemsPerSide) {
          div.remove()
          return
        }

        gsap.set(div, {
          flexBasis: itemBasis,
          width: "auto",
          paddingLeft: i === 0 ? 0 : itemPadding,
          paddingRight: i === itemsPerSide - 1 ? 0 : itemPadding,
        })
      })

      isAnimating = false
    }

    const setInitialOuterPadding = () => {
      const leftItems = leftRow.querySelectorAll("[data-side='left']")
      const rightItems = rightRow.querySelectorAll("[data-side='right']")
      const leftOuter = leftItems[0] as HTMLElement | undefined
      const rightOuter = rightItems[itemsPerSide - 1] as HTMLElement | undefined
      const leftStarterOutEdge = leftItems[itemsPerSide - 1] as
        | HTMLElement
        | undefined
      const rightStarterOutEdge = rightItems[0] as HTMLElement | undefined

      if (leftOuter) {
        gsap.set(leftOuter, { paddingLeft: 0 })
      }

      if (rightOuter) {
        gsap.set(rightOuter, { paddingRight: 0 })
      }

      if (leftStarterOutEdge) {
        gsap.set(leftStarterOutEdge, { paddingRight: 0 })
      }

      if (rightStarterOutEdge) {
        gsap.set(rightStarterOutEdge, { paddingLeft: 0 })
      }
    }

    setInitialOuterPadding()

    const runAnimation = () => {
      if (isAnimating) return

      const leftItems = leftRow.querySelectorAll("[data-side='left']")
      const rightItems = rightRow.querySelectorAll("[data-side='right']")
      if (
        leftItems.length !== itemsPerSide ||
        rightItems.length !== itemsPerSide
      )
        return

      const leftOut = leftItems[itemsPerSide - 1] as HTMLElement
      const rightOut = rightItems[0] as HTMLElement
      const leftMovingIn = leftItems[0] as HTMLElement
      const rightMovingIn = rightItems[itemsPerSide - 1] as HTMLElement
      const leftMovingOut = leftItems[itemsPerSide - 2] as HTMLElement
      const rightMovingOut = rightItems[1] as HTMLElement
      const newLeft = leftItems[0].cloneNode(true) as HTMLElement
      const newRight = rightItems[itemsPerSide - 1].cloneNode(
        true
      ) as HTMLElement

      gsap.set(newLeft, {
        flexBasis: 0,
        width: "auto",
        paddingLeft: 0,
        paddingRight: itemPadding,
      })
      gsap.set(newRight, {
        flexBasis: 0,
        width: "auto",
        paddingLeft: itemPadding,
        paddingRight: 0,
      })

      leftRow.insertBefore(newLeft, leftItems[0])
      rightRow.appendChild(newRight)

      isAnimating = true

      activeTimeline = gsap.timeline({
        defaults: {
          duration: 1,
          ease: "power2.inOut",
          overwrite: true,
        },
        onComplete: () => {
          leftOut.remove()
          rightOut.remove()
          activeTimeline = null
          isAnimating = false
        },
      })

      activeTimeline
        .to(leftOut, { flexBasis: 0, paddingLeft: 0, paddingRight: 0 }, 0)
        .to(newLeft, { flexBasis: itemBasis, paddingRight: itemPadding }, 0)
        .to(leftMovingIn, { paddingLeft: itemPadding }, 0)
        .to(leftMovingOut, { paddingRight: 0 }, 0)
        .to(rightOut, { flexBasis: 0, paddingLeft: 0, paddingRight: 0 }, 0)
        .to(newRight, { flexBasis: itemBasis, paddingLeft: itemPadding }, 0)
        .to(rightMovingIn, { paddingRight: itemPadding }, 0)
        .to(rightMovingOut, { paddingLeft: 0 }, 0)
    }

    const startInterval = () => {
      interval = setInterval(runAnimation, 4000)
    }

    startInterval()

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(interval)
        activeTimeline?.kill()
        activeTimeline = null
        resetRows()
      } else {
        resetRows()
        startInterval()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      clearInterval(interval)
      activeTimeline?.kill()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [itemsPerSide])

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div
        key={itemsPerSide}
        className="flex w-full h-full items-center rounded-[10px] gap-[10px]"
      >
        <div
          ref={leftRowRef}
          className="flex flex-1 h-full items-center overflow-hidden"
        >
          {Array.from({ length: itemsPerSide }, (_, index) => index).map(
            (index) => (
              <div
                key={`left-${index}`}
                className="h-full rounded-lg flex-shrink-0 px-[5px] overflow-hidden"
                style={{
                  flexBasis: `${100 / itemsPerSide}%`,
                  width: "auto",
                  minWidth: 0,
                }}
                data-side="left"
              >
                <div className="w-full bg-white rounded-[9px] h-full flex items-center justify-center text-white font-bold text-xl overflow-hidden whitespace-nowrap">
                  {index + 1}
                </div>
              </div>
            )
          )}
        </div>
        <div
          ref={rightRowRef}
          className="flex flex-1 h-full items-center overflow-hidden"
        >
          {Array.from(
            { length: itemsPerSide },
            (_, index) => index + itemsPerSide
          ).map((index) => (
            <div
              key={`right-${index}`}
              className="h-full rounded-lg flex-shrink-0 px-[5px] overflow-hidden"
              style={{
                flexBasis: `${100 / itemsPerSide}%`,
                width: "auto",
                minWidth: 0,
              }}
              data-side="right"
            >
              <div className="w-full bg-white rounded-[9px] h-full flex items-center justify-center text-white font-bold text-xl overflow-hidden whitespace-nowrap">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AnimatedRow
