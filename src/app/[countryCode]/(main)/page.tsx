"use client"

import { useRef, useState, useEffect } from "react"
import FourGotTenMenu from "@/modules/layout/components/4got10-menu"
import { listRegions } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import CountdownTimer from "@/modules/products/components/countdown-timer"
import Image from "next/image"
import gsap from "gsap"
import DeskScene from "@/modules/desk/components/desk-scene"
import SimpleDeskScene from "@modules/desk/components/simple-desk-scene"
import { Button, Typography } from "@/components/ui"
import { useRollout } from "@/context/rollout-context"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [regions, setRegions] = useState<HttpTypes.StoreRegion[]>([])
  const { rollout, status, loading: rolloutLoading } = useRollout()
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null)
  const [isDropped, setIsDropped] = useState(false)
  const edgeFadeMask =
    "radial-gradient(circle at 50% 50%, black 40%, transparent 72%)"
  const oImageRef = useRef<HTMLDivElement>(null)
  const gImageRef = useRef<HTMLDivElement>(null)
  const oTopRef = useRef<SVGLineElement>(null)
  const oBottomRef = useRef<SVGLineElement>(null)
  const leftRowRef = useRef<HTMLDivElement>(null)
  const rightRowRef = useRef<HTMLDivElement>(null)
  const [itemsPerSide] = useState(3)
  const prototypeImageRef = useRef<HTMLDivElement>(null)
  const newImageRef = useRef<HTMLDivElement>(null)
  const releaseButtonRef = useRef<HTMLDivElement>(null)
  const buyButtonRef = useRef<HTMLDivElement>(null)
  const volumeInfoRef = useRef<HTMLDivElement>(null)

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
        .to(
          leftOut,
          {
            flexBasis: 0,
            paddingLeft: 0,
            paddingRight: 0,
          },
          0
        )
        .to(
          newLeft,
          {
            flexBasis: itemBasis,
            paddingRight: itemPadding,
          },
          0
        )
        .to(
          leftMovingIn,
          {
            paddingLeft: itemPadding,
          },
          0
        )
        .to(
          leftMovingOut,
          {
            paddingRight: 0,
          },
          0
        )
        .to(
          rightOut,
          {
            flexBasis: 0,
            paddingLeft: 0,
            paddingRight: 0,
          },
          0
        )
        .to(
          newRight,
          {
            flexBasis: itemBasis,
            paddingLeft: itemPadding,
          },
          0
        )
        .to(
          rightMovingIn,
          {
            paddingRight: itemPadding,
          },
          0
        )
        .to(
          rightMovingOut,
          {
            paddingLeft: 0,
          },
          0
        )
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

  useEffect(() => {
    listRegions().then(setRegions)

    const fetchCart = async () => {
      try {
        const response = await fetch("/api/cart")
        const data = await response.json()
        setCart(data.cart || null)
      } catch {
        setCart(null)
      }
    }

    fetchCart()

    const handleCartUpdate = () => {
      fetchCart()
    }

    window.addEventListener("cart-updated", handleCartUpdate)

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate)
    }
  }, [])

  useEffect(() => {
    console.log(
      "Animation useEffect - rollout:",
      rollout,
      "isDropped:",
      isDropped
    )
    if (!rollout || !rollout.drop_date) return

    const checkDrop = () => {
      const now = Date.now()
      const dropTime = rollout.drop_date
        ? new Date(rollout.drop_date).getTime()
        : null
      if (!dropTime) return
      const timeUntil = dropTime - now
      console.log(
        "checkDrop - now:",
        now,
        "dropTime:",
        dropTime,
        "timeUntil:",
        timeUntil
      )

      if (now >= dropTime && !isDropped) {
        console.log("Drop detected, delaying animations by 3 seconds...")
        setIsDropped(true)

        // Delay animations by 3 seconds to let the page load
        setTimeout(() => {
          console.log("Triggering animations!")
          const tl = gsap.timeline()

          // Animate prototype image from h-full to h-0
          if (prototypeImageRef.current) {
            tl.to(prototypeImageRef.current, {
              height: "0px",
              duration: 0.5,
              ease: "power2.inOut",
            })
          }

          // Animate new image from h-0 to h-full
          if (newImageRef.current) {
            tl.fromTo(
              newImageRef.current,
              { height: "0px" },
              { height: "100%", duration: 0.5, ease: "power2.inOut" },
              "<"
            )
          }

          // Animate release button from current width to 0
          if (releaseButtonRef.current) {
            tl.to(
              releaseButtonRef.current,
              {
                width: "0px",
                opacity: 0,
                duration: 0.3,
                ease: "power2.inOut",
              },
              "<"
            )
          }

          // Animate volume info from 0 width to full
          if (volumeInfoRef.current) {
            tl.fromTo(
              volumeInfoRef.current,
              { width: "0px", opacity: 0 },
              {
                width: "100%",
                opacity: 1,
                duration: 0.3,
                ease: "power2.inOut",
              },
              "<0.1"
            )
          }

          // Animate buy button from 0 width to full
          if (buyButtonRef.current) {
            tl.fromTo(
              buyButtonRef.current,
              { width: "0px", opacity: 0 },
              {
                width: "100%",
                opacity: 1,
                duration: 0.3,
                ease: "power2.inOut",
              },
              "<0.1"
            )
          }
        }, 3000)
      }
    }

    checkDrop()
    const interval = setInterval(checkDrop, 1000)

    return () => clearInterval(interval)
  }, [rollout, isDropped])

  useEffect(() => {
    if (!oImageRef.current || !gImageRef.current) {
      return undefined
    }

    const oEl = oImageRef.current
    const gEl = gImageRef.current

    const oWidth = oEl.scrollWidth
    const gWidth = gEl.scrollWidth

    gsap.set(oEl, { width: oWidth })
    gsap.set(gEl, { width: gWidth })

    const tl = gsap.timeline({ repeat: -1, yoyo: true })

    tl.to(
      oEl,
      {
        width: oWidth * 1.3,
        duration: 1.5,
        ease: "power1.inOut",
      },
      0
    ).to(
      gEl,
      {
        width: gWidth * 0.7,
        duration: 1.5,
        ease: "power1.inOut",
      },
      0
    )

    return () => {
      tl.kill()
    }
  }, [])

  useEffect(() => {
    if (!oTopRef.current || !oBottomRef.current || !gImageRef.current) {
      return undefined
    }

    const gEl = gImageRef.current

    const tl = gsap.timeline({ repeat: -1, yoyo: true })

    tl.to(
      oTopRef.current,
      {
        attr: { x2: 80 },
        duration: 1.5,
        ease: "power1.inOut",
      },
      0
    )
      .to(
        oBottomRef.current,
        {
          attr: { x2: 80 },
          duration: 1.5,
          ease: "power1.inOut",
        },
        0
      )
      .to(
        gEl,
        {
          scaleX: 0.6,
          transformOrigin: "center center",
          duration: 1.5,
          ease: "power1.inOut",
        },
        0
      )

    return () => {
      tl.kill()
    }
  }, [])

  return (
    <div
      ref={scrollContainerRef}
      className="h-[calc(100vh-12px)] w-full max-w-screen  bg-white overflow-hidden snap-y snap-mandatory no-scrollbar"
    >
      <div
        ref={prototypeImageRef}
        className="absolute inset-0 h-full overflow-hidden"
      >
        <Image
          src="/prototype/image-4.jpg"
          alt=""
          fill
          className="object-cover"
        />
      </div>
      <div ref={newImageRef} className="absolute inset-0 h-0 overflow-hidden">
        <Image
          src="/production/image-7.jpg"
          alt=""
          fill
          className="object-cover"
        />
      </div>
      <div className="absolute p-[12px] bottom-0 flex flex-row justify-between left-0 right-0 w-full h-fit">
        <Image
          src="/menu-icons/4got10-3/frame1.svg"
          alt=""
          width={100}
          height={100}
          className="w-[150px] phone:w-[280px]"
        />
        <Image
          src="/menu-icons/4got10-3/frame2.svg"
          alt=""
          width={100}
          height={100}
          className="w-[150px] phone:w-[280px]"
        />
      </div>
      {rollout && rollout.drop_date && (
        <div className="absolute top-1/2 left-1/2 w-full px-[12px] -translate-x-1/2 -translate-y-1/2 z-10">
          <div ref={releaseButtonRef} className="overflow-hidden">
            <Button
              className="px-[16px] justify-between w-full bg-[#ffffff55]"
              size="small"
            >
              <Typography className="text-[12px]" variant="body">
                Releasing
              </Typography>
              <Typography className="text-[12px]" variant="body">
                May
              </Typography>
              <Typography className="text-[12px]" variant="body">
                16th
              </Typography>
            </Button>
          </div>
          <div
            ref={volumeInfoRef}
            className="justify-between pb-[10px] flex-row flex w-0 overflow-hidden"
          >
            <Typography className="text-[22px] text-white " variant="title">
              VOL 12*
            </Typography>

            <Typography className="text-[22px] text-white " variant="title">
              2026
            </Typography>
          </div>
          <div ref={buyButtonRef} className="overflow-hidden w-0">
            {rollout?.products && rollout.products.length > 0 && (
              <Link href={`/products/${rollout.products[0].handle}`}>
                <Button
                  className="px-[16px] justify-center w-full bg-[#ffffffa1]"
                  size="small"
                >
                  <Typography className="text-[12px]" variant="subtitle2">
                    Buy Now
                  </Typography>
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
