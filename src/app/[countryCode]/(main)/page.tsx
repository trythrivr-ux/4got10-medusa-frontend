"use client"

import { useRef, useState, useEffect } from "react"
import FourGotTenMenu from "@/modules/layout/components/4got10-menu"
import { listRegions } from "@lib/data/regions"
import { getActiveRollouts } from "@lib/data/rollouts"
import { HttpTypes } from "@medusajs/types"
import CountdownTimer from "@/modules/products/components/countdown-timer"
import Image from "next/image"
import gsap from "gsap"
import DeskScene from "@/modules/desk/components/desk-scene"
import SimpleDeskScene from "@modules/desk/components/simple-desk-scene"

export default function HomePage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [regions, setRegions] = useState<HttpTypes.StoreRegion[]>([])
  const [activeRollout, setActiveRollout] = useState<any>(null)
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null)
  const edgeFadeMask =
    "radial-gradient(circle at 50% 50%, black 40%, transparent 72%)"
  const oImageRef = useRef<HTMLDivElement>(null)
  const gImageRef = useRef<HTMLDivElement>(null)
  const oTopRef = useRef<SVGLineElement>(null)
  const oBottomRef = useRef<SVGLineElement>(null)
  const leftRowRef = useRef<HTMLDivElement>(null)
  const rightRowRef = useRef<HTMLDivElement>(null)
  const [itemsPerSide] = useState(3)

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
    getActiveRollouts().then((data: any) => {
      console.log("Rollouts data:", data)
      const rollouts = data.rollouts || []
      console.log("Number of rollouts:", rollouts.length)
      // Find the first active rollout with a future drop date
      const now = new Date()
      const active = rollouts.find((r: any) => {
        const dropDate = new Date(r.drop_date)
        console.log(
          "Rollout:",
          r,
          "Drop date:",
          dropDate,
          "Is future:",
          dropDate > now
        )
        return dropDate > now
      })
      console.log("Active rollout:", active)
      setActiveRollout(active || null)
    })
  }, [])

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
      className="h-h-[calc(100vh-12px)] w-full max-w-screen  bg-white overflow-hidden snap-y snap-mandatory no-scrollbar"
    >
      {/* Snap 1: top menu */}
      <div className="relative h-[calc(100vh-8px)] phone:h-[calc(100vh-18px)] pb-[8px] phone:pb-[18px] w-full snap-start flex items-center justify-center bg-white">
        {/* Snap 1:
        <div className=" h-full bg-[#f2feff] flex rounded-[12px] w-full items-center flex-col snap-start relative p-4">
          {activeRollout && (
            <div className="hidden mt-4">
              <CountdownTimer targetDate={new Date(activeRollout.drop_date)} />
            </div>
          )}
          <div className="absolute top-0 left-0 right-0 bottom-0 pt-4 pb-[12px] z-10 flex items-center justify-between w-full px-[12px]">
            <div className="flex items-center h-[34px]">
              <Image
                src="/menu-icons/4got10-2/4G.svg"
                alt=""
                width={100}
                height={100}
                className="w-fit max-h-[39px] pr-[6px]"
              />
              <Image
                src="/menu-icons/4got10-2/O.svg"
                alt=""
                width={100}
                height={100}
                className="w-fit max-h-[39px] pr-[6px]"
              />
              <Image
                src="/menu-icons/4got10-2/T10.svg"
                alt=""
                width={100}
                height={100}
                className="w-fit max-h-[39px] pr-[6px]"
              />
            </div>
            <div className="flex items-center h-[34px]">
              <Image
                src="/menu-icons/4got10-2/MA.svg"
                alt=""
                width={100}
                height={100}
                className="w-fit max-h-[39px] pr-[4px]"
              />
              <Image
                src="/menu-icons/4got10-2/G.svg"
                alt=""
                width={100}
                height={100}
                className="w-fit max-h-[39px] pr-[6px]"
              />
            </div>
          </div>
          <div className="flex-1 w-full flex items-center justify-center min-h-0">
            <div className="w-full z-0 h-full">
              <DeskScene />
            </div>
          </div>
        </div>
         */}
        {/* Animated Row */}

        <div className="w-full h-full rounded-[10px] p-[10px] flex flex-col bg-[#efefef] gap-[10px]">
          <div className="absolute bottom-[25px] justify-between right-[15px] left-[15px] z-10 flex items-end">
            <Image
              src="/menu-icons/4got10-3/1.svg"
              alt=""
              width={100}
              height={100}
              className="h-auto w-auto"
            />
            <Image
              src="/menu-icons/4got10-3/2.svg"
              alt=""
              width={100}
              height={100}
              className="h-auto w-auto"
            />
          </div>
          <div className="flex flex-row w-full h-2/3 gap-[10px]">
            <div className="flex flex-row w-full h-full rounded-[9px] bg-white"></div>
            <div className="flex flex-row w-full h-full rounded-[9px] bg-white overflow-hidden">
              <div className="h-full w-full rounded-[48px] overflow-hidden">
                <div
                  className="relative h-full w-full rounded-[48px] overflow-hidden"
                  style={{
                    WebkitMaskImage: edgeFadeMask,
                    maskImage: edgeFadeMask,
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskSize: "100% 100%",
                    maskSize: "100% 100%",
                    WebkitMaskPosition: "50% 50%",
                    maskPosition: "50% 50%",
                  }}
                >
                  <SimpleDeskScene />
                </div>
              </div>
            </div>
            <div className="flex flex-row w-full h-full rounded-[9px] bg-white"></div>
          </div>
          <div className="relative w-full h-1/3 flex items-center justify-center overflow-hidden">
            <div
              key={itemsPerSide}
              className="flex w-full h-full items-center  rounded-[10px]  gap-[10px]"
              id="animated-row"
            >
              {/* Left container */}
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
                      <div className="w-full bg-[#ffffff] rounded-[9px] h-full flex items-center justify-center text-white font-bold text-xl overflow-hidden whitespace-nowrap">
                        {index + 1}
                      </div>
                    </div>
                  )
                )}
              </div>
              {/* Right container */}
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
                    <div className="w-full bg-[#ffffff] rounded-[9px] h-full flex items-center justify-center text-white font-bold text-xl overflow-hidden whitespace-nowrap">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Snap 2: page content */}
      <div className="min-h-screen hidden bg-white w-full items-center  flex-col gap-[8px] phone:gap-[12px] bg-transparent snap-start relative">
        <div className="h-fit bg-[#efefef] pt-[70 px] rounded-[12px] w-full items-center flex flex-col snap-start relative">
          <FourGotTenMenu
            regions={regions}
            cart={cart}
            scrollContainerRef={scrollContainerRef}
            isHomePage={true}
          />

          <div className="px-[8px] rounded-[8px] phone:px-[12px] flex flex-col py-[8px] phone:py-[12px] items-center gap-[8px] phone:gap-[12px] justify-center h-fit w-full">
            <div className="rounded-[12px] bg-white w-full h-[300px]"></div>

            <div className="flex flex-row gap-[8px] phone:gap-[12px] w-full h-[800px]">
              <div className="rounded-[12px] bg-white w-full h-full"></div>
              <div className="rounded-[12px] bg-white w-full h-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
