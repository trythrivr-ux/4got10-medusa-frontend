"use client"

import { useRef, useState, useEffect } from "react"
import FourGotTenMenu1 from "@/modules/layout/components/top-menu"
import FourGotTenMenu from "@/modules/layout/components/4got10-menu"
import { listRegions } from "@lib/data/regions"
import { getActiveRollouts } from "@lib/data/rollouts"
import { HttpTypes } from "@medusajs/types"
import CountdownTimer from "@/modules/products/components/countdown-timer"
import Image from "next/image"
import gsap from "gsap"
import DeskScene from "@/modules/desk/components/desk-scene"

export default function HomePage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [regions, setRegions] = useState<HttpTypes.StoreRegion[]>([])
  const [activeRollout, setActiveRollout] = useState<any>(null)
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null)
  const oImageRef = useRef<HTMLDivElement>(null)
  const gImageRef = useRef<HTMLDivElement>(null)
  const oTopRef = useRef<SVGLineElement>(null)
  const oBottomRef = useRef<SVGLineElement>(null)

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
      className="h-screen w-full max-w-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar"
    >
      {/* Snap 1: top menu */}
      <div className="relative h-[calc(100vh-0px)] phone:h-[calc(100vh-18px)] pb-[8px] phone:pb-[12px] w-full snap-start flex items-center justify-center bg-white">
        <div className=" h-full bg-[#f2feff] rounded-[12px] w-full items-center flex flex-col snap-start relative p-4">
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
      </div>

      {/* Snap 2: page content */}
      <div className="min-h-screen bg-white w-full items-center flex flex-col gap-[8px] phone:gap-[12px] bg-transparent snap-start relative">
        <div className="h-fit bg-[#efefef] pt-[70 px] rounded-[12px] w-full items-center flex flex-col snap-start relative">
          <FourGotTenMenu
            regions={regions}
            cart={cart}
            scrollContainerRef={scrollContainerRef}
            isHomePage={true}
            isStuck={true}
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
