"use client"

import Image from "next/image"
import type { ReactNode } from "react"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import gsap from "gsap"
import { HttpTypes } from "@medusajs/types"
import { useParams, usePathname, useRouter } from "next/navigation"
import { updateRegion, updateLineItem, deleteLineItem } from "@lib/data/cart"
import HoverModal, { ModalB } from "@modules/common/components/hover-modal"
import { MOBILE_MAX_WIDTH } from "@lib/breakpoints"
import Link from "next/link"

const Pill = ({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) => {
  return (
    <div
      className={`fourgot10-pill inline-flex rounded-full bg-[#f3f3f3] px-[12px] h-[25px] text-[11px] tracking-[0.01em] text-black items-center ${className}`}
    >
      {children}
    </div>
  )
}

export default function FourGotTenMenu({
  regions,
  cart,
}: {
  regions: HttpTypes.StoreRegion[]
  cart: HttpTypes.StoreCart | null
}) {
  const router = useRouter()

  const toMenuHref = (label: string) =>
    `/${label
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")}`

  const toStoreCategoryHref = (label: string) =>
    `/store?category=${encodeURIComponent(
      label
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "")
    )}`
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const stickyOuterRef = useRef<HTMLDivElement | null>(null)
  const stickyInnerRef = useRef<HTMLDivElement | null>(null)
  const accountNewsRef = useRef<HTMLDivElement | null>(null)
  const accountBoxRef = useRef<HTMLDivElement | null>(null)
  const menuBoxRef = useRef<HTMLDivElement | null>(null)
  const cartBoxRef = useRef<HTMLDivElement | null>(null)
  const expandedMenuContentRef = useRef<HTMLDivElement | null>(null)
  const pillsContainerRef = useRef<HTMLDivElement | null>(null)
  const expandedPillsWidthRef = useRef<number | null>(null)
  const expandedMenuWidthRef = useRef<number | null>(null)
  const expandedCartWidthRef = useRef<number | null>(null)
  const expandedAccountNewsWidthRef = useRef<number | null>(null)
  const hasExpandedAnimatedRef = useRef(false)
  const prevIsMenuExpandedRef = useRef(false)
  const logoLeftRef = useRef<HTMLDivElement | null>(null)
  const logoRightRef = useRef<HTMLDivElement | null>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  const [isStuck, setIsStuck] = useState(false)
  const [isMenuExpanded, setIsMenuExpanded] = useState(false)
  const [isCartScrolling, setIsCartScrolling] = useState(false)
  const cartScrollRef = useRef<HTMLDivElement | null>(null)
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  useLayoutEffect(() => {
    if (!isMenuExpanded || !expandedMenuContentRef.current) {
      return
    }

    const ctx = gsap.context(() => {
      const container = expandedMenuContentRef.current
      if (!container) return

      const topRow = container.querySelector<HTMLElement>(
        ".expanded-menu-top-row"
      )
      const bottomRow = container.querySelector<HTMLElement>(
        ".expanded-menu-bottom-row"
      )
      const items = container.querySelectorAll<HTMLElement>(".menu-item")
      const cards = container.querySelectorAll<HTMLElement>(
        ".expanded-menu-card"
      )

      gsap.killTweensOf([container, topRow, bottomRow, items, cards])

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      tl.fromTo(
        container,
        { opacity: 0, y: -8, filter: "blur(2px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.34,
          overwrite: true,
        },
        0
      )

      if (topRow) {
        tl.fromTo(
          topRow,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, overwrite: true },
          0.04
        )
      }

      if (items.length) {
        tl.fromTo(
          items,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.28,
            stagger: 0.03,
            overwrite: true,
          },
          0.1
        )
      }

      if (bottomRow) {
        tl.fromTo(
          bottomRow,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.34, overwrite: true },
          0.18
        )
      }

      if (cards.length) {
        tl.fromTo(
          cards,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.34,
            stagger: 0.05,
            overwrite: true,
          },
          0.2
        )
      }
    }, expandedMenuContentRef)

    return () => ctx.revert()
  }, [isMenuExpanded])

  useEffect(() => {
    const handleScroll = () => {
      if (!triggerRef.current) {
        return
      }

      const stuckNow = triggerRef.current.getBoundingClientRect().top <= 0
      setIsStuck((prev) => (prev !== stuckNow ? stuckNow : prev))
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`)
    const update = () => setIsSmallScreen(mq.matches)

    update()
    mq.addEventListener("change", update)

    return () => mq.removeEventListener("change", update)
  }, [])

  useLayoutEffect(() => {
    if (!stickyInnerRef.current || !stickyOuterRef.current) {
      return
    }

    const ctx = gsap.context(() => {
      gsap.set(stickyOuterRef.current, {
        backgroundColor: "transparent",
        paddingTop: 8,
      })

      gsap.set(stickyInnerRef.current, {
        backgroundColor: "transparent",
        paddingTop: 0,
        paddingBottom: 0,
      })

      gsap.set(stickyInnerRef.current, {
        height: 52,
      })

      gsap.set(stickyInnerRef.current, {
        width: "100%",
      })

      if (logoLeftRef.current) {
        gsap.set(logoLeftRef.current, { opacity: 0, x: -60 })
      }

      if (logoRightRef.current) {
        gsap.set(logoRightRef.current, { opacity: 0, x: 60 })
      }
    }, stickyOuterRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!stickyInnerRef.current || !stickyOuterRef.current) {
      return
    }

    const inner = stickyInnerRef.current
    const outer = stickyOuterRef.current

    const pills = inner.querySelectorAll<HTMLElement>(".fourgot10-pill")
    const nonPillButtons = inner.querySelectorAll<HTMLElement>(
      "[data-fourgot10-nonpill='true']"
    )

    const logoEls = [logoLeftRef.current, logoRightRef.current].filter(
      Boolean
    ) as HTMLElement[]

    const stuckWidth = 675
    const stuckButtonWidth = 110

    if (expandedMenuWidthRef.current === null && menuBoxRef.current) {
      expandedMenuWidthRef.current = Math.round(
        menuBoxRef.current.getBoundingClientRect().width
      )
    }

    if (expandedCartWidthRef.current === null && cartBoxRef.current) {
      expandedCartWidthRef.current = Math.round(
        cartBoxRef.current.getBoundingClientRect().width
      )
    }

    if (
      expandedAccountNewsWidthRef.current === null &&
      accountNewsRef.current
    ) {
      expandedAccountNewsWidthRef.current = Math.round(
        accountNewsRef.current.getBoundingClientRect().width
      )
    }

    if (tlRef.current) {
      tlRef.current.kill()
      tlRef.current = null
    }

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } })
    tlRef.current = tl

    if (isMenuExpanded) {
      if (isSmallScreen) {
        if (logoEls.length) {
          tl.set(
            logoEls,
            {
              opacity: 0,
            },
            0
          )
        }
      }

      tl.to(
        inner,
        {
          backgroundColor: "#FFFFFF",
          height: "auto",
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 12,
          paddingRight: 12,
          width: "100%",
          duration: 0.2,
        },
        0
      )

      tl.to(
        outer,
        {
          paddingTop: 12,
          duration: 0.2,
        },
        0
      )

      // Only set up account/news if they're currently hidden (e.g., from state 2)
      if (
        accountNewsRef.current &&
        getComputedStyle(accountNewsRef.current).display === "none"
      ) {
        tl.set(
          accountNewsRef.current,
          {
            display: "flex",
            overflow: "hidden",
            whiteSpace: "nowrap",
            width: 0,
            opacity: 0,
          },
          0
        )
      }

      prevIsMenuExpandedRef.current = isMenuExpanded

      const currentMenuWidth = menuBoxRef.current
        ? Math.round(menuBoxRef.current.getBoundingClientRect().width)
        : 100
      const innerWidth = stickyInnerRef.current
        ? Math.round(stickyInnerRef.current.getBoundingClientRect().width)
        : 0
      const cartWidth = expandedCartWidthRef.current ?? 142

      // Use stored expanded width since current width is 0 at animation start
      const accountNewsWidth = expandedAccountNewsWidthRef.current ?? 0

      // Simplified calculation - only subtract cart width and padding, let flex handle the rest
      const availableWidth = innerWidth - cartWidth - 24
      const scaleX = availableWidth / currentMenuWidth

      tl.set(
        inner,
        {
          overflow: "hidden",
        },
        0
      )

      tl.set(
        menuBoxRef.current,
        {
          clearProps: "width,flex",
        },
        0
      )

      tl.to(
        cartBoxRef.current,
        {
          width: expandedCartWidthRef.current ?? 142,
          duration: 0.25,
          clearProps: "width",
        },
        0
      )

      tl.to(
        logoEls,
        {
          opacity: 0,
          x: (i) => (i === 0 ? -60 : 60),
          duration: 0.18,
        },
        0
      )

      tl.to(
        inner,
        {
          width: "100%",
          duration: 0.35,
        },
        0
      )

      tl.to(
        accountNewsRef.current,
        {
          width: expandedAccountNewsWidthRef.current ?? "auto",
          opacity: 1,
          duration: 0.22,
          pointerEvents: "auto",
          clearProps: "width",
        },
        0.1
      )

      if (pillsContainerRef.current) {
        tl.set(pillsContainerRef.current, {
          width: Math.round(
            pillsContainerRef.current.getBoundingClientRect().width
          ),
          overflow: "hidden",
          whiteSpace: "nowrap",
        })
      }

      tl.to(
        pillsContainerRef.current,
        {
          width: 0,
          opacity: 0,
          duration: 0.22,
          pointerEvents: "none",
        },
        0
      )

      tl.set(
        pillsContainerRef.current,
        {
          display: "none",
        },
        0.22
      )

      tl.to(
        nonPillButtons,
        {
          backgroundColor: "#efefef",
          duration: 0.25,
        },
        0
      )

      tl.set(
        accountNewsRef.current,
        {
          clearProps: "overflow,whiteSpace",
        },
        0.4
      )
    } else if (isStuck && !isMenuExpanded) {
      if (isSmallScreen) {
        if (logoEls.length) {
          tl.set(
            logoEls,
            {
              opacity: 0,
            },
            0
          )
        }
      }

      tl.to(
        inner,
        {
          backgroundColor: isSmallScreen ? "transparent" : "#FFFFFF",
          paddingTop: isSmallScreen ? 0 : 8,
          paddingBottom: isSmallScreen ? 0 : 8,
          paddingLeft: isSmallScreen ? 0 : 8,
          paddingRight: isSmallScreen ? 0 : 8,
          duration: 0.25,
        },
        0
      )

      tl.set(
        inner,
        {
          height: "auto",
        },
        0
      )

      tl.fromTo(
        outer,
        {
          paddingTop: 8,
        },
        {
          paddingTop: isSmallScreen ? 16 : 22,
          duration: 0.25,
        },
        0
      )

      if (menuBoxRef.current) {
        tl.set(menuBoxRef.current, {
          width: Math.round(menuBoxRef.current.getBoundingClientRect().width),
        })
      }

      if (cartBoxRef.current) {
        tl.set(cartBoxRef.current, {
          width: Math.round(cartBoxRef.current.getBoundingClientRect().width),
        })
      }

      if (!isSmallScreen) {
        tl.to(
          menuBoxRef.current,
          {
            width: 142,
            flex: "0 0 142px",
            duration: 0.32,
          },
          0
        )

        tl.to(
          cartBoxRef.current,
          {
            width: expandedCartWidthRef.current ?? 142,
            duration: 0.32,
            clearProps: "width",
          },
          0
        )
      } else {
        tl.set(
          [menuBoxRef.current, cartBoxRef.current],
          {
            clearProps: "width",
          },
          0
        )

        tl.to(
          [menuBoxRef.current, cartBoxRef.current],
          {
            flex: 1,
            duration: 0.2,
          },
          0
        )
      }

      tl.set(
        pillsContainerRef.current,
        {
          display: "flex",
          overflow: "hidden",
          whiteSpace: "nowrap",
          width: 0,
          opacity: 0,
        },
        0
      )

      tl.to(
        pillsContainerRef.current,
        {
          width: expandedPillsWidthRef.current ?? "auto",
          opacity: 1,
          duration: 0.22,
          pointerEvents: "auto",
          clearProps: "width",
        },
        0.1
      )

      if (!isMenuExpanded && accountNewsRef.current) {
        tl.set(accountNewsRef.current, {
          width: Math.round(
            accountNewsRef.current.getBoundingClientRect().width
          ),
          overflow: "hidden",
          whiteSpace: "nowrap",
        })
      }

      if (!isMenuExpanded) {
        tl.to(
          accountNewsRef.current,
          {
            width: 0,
            opacity: 0,
            duration: 0.22,
            pointerEvents: "none",
          },
          0
        )

        tl.set(
          accountNewsRef.current,
          {
            display: "none",
          },
          0.22
        )
      }

      tl.to(
        inner,
        {
          width: isSmallScreen ? "100%" : stuckWidth,
          duration: 0.42,
        },
        0
      )

      tl.to(
        pills,
        {
          backgroundColor: "#FFFFFF",
          duration: 0.35,
        },
        0
      )

      tl.to(
        nonPillButtons,
        {
          backgroundColor: isSmallScreen ? "#FFFFFF" : "#EFEFEF",
          duration: 0.35,
        },
        0
      )

      if (!isSmallScreen) {
        if (logoEls.length) {
          tl.to(
            logoEls,
            {
              opacity: 1,
              x: 0,
              duration: 0.28,
            },
            0.34
          )
        }
      }
    } else {
      tl.to(
        inner,
        {
          backgroundColor: "transparent",
          height: "auto",
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
          duration: 0.2,
          clearProps: "height",
        },
        0
      )

      tl.set(
        menuBoxRef.current,
        {
          clearProps: "flex,width",
        },
        0
      )

      tl.set(
        logoEls,
        {
          clearProps: "opacity",
        },
        0
      )

      tl.to(
        outer,
        {
          paddingTop: 0,
          duration: 0.2,
        },
        0
      )

      tl.set(
        pillsContainerRef.current,
        {
          display: "flex",
          overflow: "hidden",
          whiteSpace: "nowrap",
          width: 0,
          opacity: 0,
        },
        0
      )

      tl.to(
        pillsContainerRef.current,
        {
          width: expandedPillsWidthRef.current ?? "auto",
          opacity: 1,
          duration: 0.22,
          pointerEvents: "auto",
          clearProps: "width",
        },
        0.1
      )

      tl.set(
        accountNewsRef.current,
        {
          display: "flex",
          overflow: "hidden",
          whiteSpace: "nowrap",
          width: 0,
          opacity: 0,
        },
        0
      )

      tl.to(
        menuBoxRef.current,
        {
          width: expandedMenuWidthRef.current ?? "auto",
          duration: 0.25,
          clearProps: "width",
        },
        0
      )

      tl.to(
        cartBoxRef.current,
        {
          width: expandedCartWidthRef.current ?? 142,
          duration: 0.25,
          clearProps: "width",
        },
        0
      )

      if (logoEls.length) {
        tl.to(
          logoEls,
          {
            opacity: 0,
            x: (i) => (i === 0 ? -60 : 60),
            duration: 0.18,
          },
          0
        )
      }

      tl.to(
        inner,
        {
          width: "100%",
          duration: 0.35,
        },
        0
      )

      tl.to(
        accountNewsRef.current,
        {
          width: expandedAccountNewsWidthRef.current ?? "auto",
          opacity: 1,
          duration: 0.22,
          pointerEvents: "auto",
          clearProps: "width",
        },
        0.1
      )

      tl.to(
        pills,
        {
          backgroundColor: "#f3f3f3",
          duration: 0.25,
        },
        0
      )

      tl.to(
        nonPillButtons,
        {
          backgroundColor: "#FFFFFF",
          duration: 0.25,
        },
        0
      )

      tl.set(
        accountNewsRef.current,
        {
          clearProps: "overflow,whiteSpace",
        },
        0.4
      )
    }

    return () => {
      if (tlRef.current === tl) {
        tl.kill()
        tlRef.current = null
      }
    }
  }, [isStuck, isMenuExpanded])

  return (
    <>
      <div ref={triggerRef} className="h-[1px] overflow-hidden  w-full" />

      <div
        ref={stickyOuterRef}
        className={`sticky rounded-[12px] items-center z-50 pt-[22px] ${
          isMenuExpanded
            ? "top-[12px] px-[8px] phone:px-[12px] w-full"
            : "top-0 px-[9.5px] phone:px-[12px] mt-[9.5px] phone:mt-[12px] w-full"
        }`}
      >
        <div
          className={`bg-gradient-to-b from-[#efefef] to-transaprent rounded-[12.5px] absolute left-0 right-0 top-[12px] h-[100px] ${
            isMenuExpanded ? "hidden" : ""
          }`}
        ></div>
        {!isSmallScreen && (
          <div
            ref={logoLeftRef}
            className="pointer-events-none  pt-[10px] select-none absolute left-[12px] top-[50%] -translate-y-1/2 z-10 flex items-center h-[34px]"
          >
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
        )}

        {!isSmallScreen && (
          <div
            ref={logoRightRef}
            className="pointer-events-none pt-[10px] select-none absolute right-[5px] top-[50%] -translate-y-1/2 z-10 flex items-center h-[34px]"
          >
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
        )}

        <div
          ref={stickyInnerRef}
          className={`relative rounded-[12px] py-[0px] px-[0px] flex flex-col mx-auto will-change-[width] ${
            isStuck || isMenuExpanded
              ? isSmallScreen && isStuck && !isMenuExpanded
                ? ""
                : "shadow-[0_0_30px_rgba(239,239,239)]"
              : ""
          }`}
        >
          <div
            className={`flex flex-row gap-[8px] items-center ${
              isMenuExpanded ? "h-[52px]" : isStuck ? "h-[46px]" : "h-[52px]"
            }`}
          >
            <div
              ref={menuBoxRef}
              data-fourgot10-nonpill="true"
              onClick={() => setIsMenuExpanded((v) => !v)}
              className={`flex-1 h-full rounded-[10px] bg-[#FFFFFF]  px-[9px] py-[9px] flex items-center justify-between cursor-pointer transition-all duration-250 ease-out fourgot10-full-width-on-small ${
                isSmallScreen && isStuck && !isMenuExpanded
                  ? "shadow-[0_0_30px_rgba(239,239,239)]"
                  : ""
              }`}
            >
              <div className="text-[12.5px] tracking-[0.01em]">Menu</div>
              <div className="flex items-center gap-[6px]">
                <div className="h-[10px] w-[1px] bg-black/15" />
              </div>
            </div>
            <div
              ref={pillsContainerRef}
              data-fourgot10-nonpill="true"
              className="flex-[2] rounded-[10px] bg-[#FFFFFF] px-[9px] py-[9px] h-full flex items-center gap-[6px] fourgot10-hide-on-small"
            >
              <Pill>Shop</Pill>
              <Pill>Magazine</Pill>
              <Pill>Categories</Pill>
              <Pill>Sale</Pill>
              <Pill>Blog</Pill>
              <Pill className="gap-[6px]">
                <span>Search</span>
                <Image
                  src="/menu-icons/search.png"
                  alt=""
                  width={12}
                  height={12}
                />
              </Pill>
            </div>
            <div
              ref={accountNewsRef}
              className="flex h-full items-center gap-[6px] fourgot10-hide-on-small"
            >
              <div
                data-fourgot10-nonpill="true"
                className="rounded-[10px] bg-[#FFFFFF] px-[12px] py-[9px] h-full flex items-center gap-[10px] w-[142px] justify-between"
              >
                <span className="text-[12.5px] tracking-[0.01em]">News</span>
                <span className="text-[12.5px] tracking-[0.01em]">0</span>
              </div>
              <div
                ref={accountBoxRef}
                data-fourgot10-nonpill="true"
                className="rounded-[10px] bg-[#FFFFFF] px-[12px] py-[9px] h-full flex items-center gap-[10px] w-[142px] justify-between"
              >
                <span className="text-[12.5px] tracking-[0.01em]">Account</span>
                <span className="h-[18px] aspect-square rounded-[6px] bg-[#EFEFEF]" />
              </div>
            </div>
            <div
              ref={cartBoxRef}
              data-fourgot10-nonpill="true"
              className={`rounded-[10px] bg-[#FFFFFF] px-[12px] py-[9px] h-full flex items-center gap-[10px] justify-between fourgot10-full-width-on-small ${
                isSmallScreen && isStuck && !isMenuExpanded
                  ? "shadow-[0_0_30px_rgba(239,239,239)]"
                  : ""
              }`}
            >
              <span className="text-[12.5px] tracking-[0.01em]">Cart</span>
              <span className="text-[12.5px] tracking-[0.01em]">
                {cart?.items?.reduce((acc, item) => acc + item.quantity, 0) ||
                  0}
              </span>
            </div>
          </div>

          <HoverModal
            triggerRef={accountBoxRef}
            isMenuExpanded={isMenuExpanded}
            isStuck={isStuck}
            modalContent={
              <div className="flex flex-col gap-[8px] overflow-visible">
                <ModalB isMenuExpanded={isMenuExpanded} isStuck={isStuck}>
                  <div className="flex gap-[6px] px-[12px] py-[14px] flex-col">
                    <div className="flex pb-[6px] flex-row justify-start">
                      <span
                        className="font-medium pb-[0px] text-[12.25px] tracking-[0.25px]"
                        style={{
                          fontFamily: "Plus Jakarta Sans, sans-serif",
                        }}
                      >
                        Sebastian
                      </span>
                    </div>
                  </div>
                </ModalB>
                <ModalB isMenuExpanded={isMenuExpanded} isStuck={isStuck}>
                  <div className="flex gap-[6px] px-[12px] py-[14px] flex-col">
                    <div className="flex pb-[6px] flex-row justify-start">
                      <span
                        className="font-medium pb-[0px] text-[12.25px] tracking-[0.25px]"
                        style={{
                          fontFamily: "Plus Jakarta Sans, sans-serif",
                        }}
                      >
                        Recent Orders
                      </span>
                    </div>
                    <div className="flex flex-col w-full gap-[8px]">
                      <div className="flex w-full flex-row gap-[12px]">
                        <div className="relative w-[80px] flex gap-[6.5px] flex-wrap h-[80px] rounded-[7px] overflow-hidden  shrink-0">
                          <div
                            className={`${
                              isMenuExpanded ? "bg-[#ffffff]" : "bg-[#EFEFEF]"
                            } rounded-[9px] h-[35px] aspect-square`}
                          ></div>
                          <div
                            className={`${
                              isMenuExpanded ? "bg-[#ffffff]" : "bg-[#EFEFEF]"
                            } rounded-[9px] h-[35px] aspect-square`}
                          ></div>
                          <div
                            className={`${
                              isMenuExpanded ? "bg-[#ffffff]" : "bg-[#EFEFEF]"
                            } rounded-[9px] h-[35px] aspect-square`}
                          ></div>
                          <div
                            className={`${
                              isMenuExpanded ? "bg-[#ffffff]" : "bg-[#EFEFEF]"
                            } rounded-[9px] h-[35px] aspect-square`}
                          ></div>
                        </div>

                        <div className="flex w-full flex-col justify-center items-start gap-[6px]">
                          <div className="flex flex-row items-center justify-center gap-[7px]">
                            <span
                              className="text-[12.5px] font-medium truncate"
                              style={{
                                fontFamily: "Plus Jakarta Sans, sans-serif",
                              }}
                            >
                              Order #1
                            </span>
                            <div className="flex h-[12.5px] bg-[#00000030] w-[1.25px]"></div>
                            <span
                              className="text-[12px] font-medium truncate"
                              style={{
                                fontFamily: "Plus Jakarta Sans, sans-serif",
                              }}
                            >
                              #34343
                            </span>
                          </div>
                          <div className="flex flex-row items-center overflow-hidden gap-[7px]">
                            <span
                              className="text-[11.5px] text-nowrap truncate text-[#00000070] font-medium"
                              style={{
                                fontFamily: "Plus Jakarta Sans, sans-serif",
                                maxWidth: "200px",
                              }}
                            >
                              Magazine - Vice City, Magazine, Risky Business
                            </span>
                          </div>

                          <button
                            className={`${
                              isMenuExpanded ? "bg-[#ffffff]" : "bg-[#EFEFEF]"
                            }  tracking-[0px] mt-[8px] w-full flex flex-row items-center justify-center rounded-full px-[11px] h-[24px]`}
                          >
                            <p
                              className="text-[10.5px] font-medium"
                              style={{
                                fontFamily: "Plus Jakarta Sans, sans-serif",
                              }}
                            >
                              Track Order
                            </p>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </ModalB>
                <ModalB isMenuExpanded={isMenuExpanded} isStuck={isStuck}>
                  <div className="flex gap-[6px] px-[12px] py-[14px] flex-col">
                    <div className="flex flex-row gap-[10px]">
                      <Link
                        href="/account"
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                        className=" font-medium text-white flex items-center justify-center text-[11.5px] tracking-[0.15px] rounded-[10px] px-[12px] h-[42px] bg-[#484848] w-full"
                      >
                        Account
                      </Link>
                      <Link
                        href="/account/#orders"
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                        className={`${
                          isMenuExpanded ? "bg-[#ffffff]" : "bg-[#EFEFEF]"
                        }  font-medium  text-[11.5px] flex items-center justify-center tracking-[0.15px] rounded-[10px] px-[12px] h-[42px] w-full`}
                      >
                        All Orders
                      </Link>
                    </div>
                  </div>
                </ModalB>
              </div>
            }
          />

          <HoverModal
            triggerRef={cartBoxRef}
            isMenuExpanded={isMenuExpanded}
            isStuck={isStuck}
            modalContent={
              <div className="flex flex-col gap-[8px] overflow-visible">
                <ModalB isMenuExpanded={isMenuExpanded} isStuck={isStuck}>
                  <div className="flex px-[12px] py-[14px] flex-col">
                    <div className="flex pb-[4px] flex-row justify-between">
                      <span
                        className="font-medium pb-[0px] text-[12.25px] tracking-[0.25px]"
                        style={{
                          fontFamily: "Plus Jakarta Sans, sans-serif",
                        }}
                      >
                        Cart
                      </span>
                      <span
                        className="font-medium pb-[0px] text-[12.25px] tracking-[0.25px]"
                        style={{
                          fontFamily: "Plus Jakarta Sans, sans-serif",
                        }}
                      >
                        {cart?.items?.reduce(
                          (acc, item) => acc + item.quantity,
                          0
                        ) || 0}{" "}
                        Items
                      </span>
                    </div>
                    {/* Cart Items*/}
                    <div className="flex flex-col gap-[8px] mt-[8px] relative">
                      <div
                        ref={cartScrollRef}
                        className="flex flex-col pb-[35px] gap-[8px] max-h-[500px] overflow-y-auto no-scrollbar"
                        onScroll={() => {
                          if (cartScrollRef.current) {
                            setIsCartScrolling(
                              cartScrollRef.current.scrollTop > 0
                            )
                          }
                        }}
                      >
                        {cart?.items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-row gap-[12px]"
                          >
                            {(item.thumbnail ||
                              item.product?.thumbnail ||
                              item.product?.images?.[0]?.url ||
                              item.variant?.product?.images?.[0]?.url) && (
                              <div
                                className="relative w-[85px] h-[85px] border-[#efefef] border-[1.5px] rounded-[9px] overflow-hidden bg-[#efefef] shrink-0 cursor-pointer"
                                onClick={() => {
                                  if (item.product?.handle) {
                                    router.push(
                                      `/products/${item.product.handle}`
                                    )
                                  }
                                }}
                              >
                                <Image
                                  src={
                                    item.thumbnail ||
                                    item.product?.thumbnail ||
                                    item.product?.images?.[0]?.url ||
                                    item.variant?.product?.images?.[0]?.url ||
                                    ""
                                  }
                                  alt={item.title || ""}
                                  fill
                                  sizes="85px"
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="flex flex-col justify-center items-start gap-[6px]">
                              <div className="flex flex-row items-center justify-center gap-[7px]">
                                <span
                                  className="text-[12.5px] font-medium truncate cursor-pointer"
                                  style={{
                                    fontFamily: "Plus Jakarta Sans, sans-serif",
                                  }}
                                  onClick={() => {
                                    if (item.product?.handle) {
                                      router.push(
                                        `/products/${item.product.handle}`
                                      )
                                    }
                                  }}
                                >
                                  {item.title}
                                </span>
                                <div className="flex h-[12.5px] bg-[#00000030] w-[1.25px]"></div>
                                <span
                                  className="text-[12px] font-medium truncate"
                                  style={{
                                    fontFamily: "Plus Jakarta Sans, sans-serif",
                                  }}
                                >
                                  {item.variant?.title ||
                                    (item as any)?.variant_title ||
                                    ""}
                                </span>
                              </div>
                              <div className="flex flex-row items-center justify-center gap-[7px]">
                                <span
                                  className="text-[11.5px] text-[#00000070] font-medium truncate"
                                  style={{
                                    fontFamily: "Plus Jakarta Sans, sans-serif",
                                  }}
                                >
                                  {item.variant?.title ||
                                    (item as any)?.variant_title ||
                                    ""}
                                </span>
                                <div className="flex h-[12.5px] bg-[#00000030] w-[1.25px]"></div>
                                <span
                                  className="text-[11.5px] text-[#00000070] font-medium truncate"
                                  style={{
                                    fontFamily: "Plus Jakarta Sans, sans-serif",
                                  }}
                                >
                                  {new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency:
                                      cart?.region?.currency_code || "USD",
                                  }).format(item.unit_price / 100)}
                                </span>
                              </div>

                              <div className="flex pt-[7px] flex-row gap-[7px]">
                                <div
                                  className={`${
                                    isMenuExpanded
                                      ? "bg-[#ffffff]"
                                      : "bg-[#EFEFEF]"
                                  }  tracking-[0px] flex gap-[6px]  flex-row items-center justify-center rounded-full px-[11px] h-[24px]`}
                                >
                                  <button
                                    onClick={() =>
                                      updateLineItem({
                                        lineId: item.id,
                                        quantity: item.quantity + 1,
                                      })
                                    }
                                    className={`rounded-[4px] mr-[2px] w-[10px] h-[10px] items-center flex justify-center text-[14px]`}
                                  >
                                    <Image
                                      alt=""
                                      src={"/icons/plus.svg"}
                                      className="w-[8.5px] opacity-[50%]"
                                      height={50}
                                      width={50}
                                    />
                                  </button>
                                  <p
                                    className="text-[10.5px] font-medium"
                                    style={{
                                      fontFamily:
                                        "Plus Jakarta Sans, sans-serif",
                                    }}
                                  >
                                    {item.quantity}
                                  </p>
                                  <button
                                    onClick={() =>
                                      updateLineItem({
                                        lineId: item.id,
                                        quantity: item.quantity + 1,
                                      })
                                    }
                                    className={`rounded-[4px] w-[10px] h-[10px] items-center flex justify-center text-[14px]`}
                                  >
                                    <Image
                                      alt=""
                                      src={"/icons/minus.svg"}
                                      className="w-[8px] opacity-[50%]"
                                      height={50}
                                      width={50}
                                    />
                                  </button>
                                </div>
                                <button
                                  onClick={() => deleteLineItem(item.id)}
                                  className={`${
                                    isMenuExpanded
                                      ? "bg-[#ffffff]"
                                      : "bg-[#EFEFEF]"
                                  }  tracking-[0px] flex flex-row items-center justify-center rounded-full px-[11px] h-[24px]`}
                                >
                                  <p
                                    className="text-[10.5px] font-medium"
                                    style={{
                                      fontFamily:
                                        "Plus Jakarta Sans, sans-serif",
                                    }}
                                  >
                                    Remove
                                  </p>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div
                        className={`absolute top-0 left-0 right-0 h-[55px] pointer-events-none bg-gradient-to-b ${
                          isMenuExpanded ? "from-[#EFEFEF]" : "from-[#ffffff]"
                        } to-transparent ${
                          isCartScrolling ? "opacity-100" : "opacity-0"
                        }`}
                      />

                      <div
                        className={`absolute bottom-0 left-0 right-0 h-[55px] pointer-events-none bg-gradient-to-t transition-opacity duration-300 ${
                          isMenuExpanded ? "from-[#EFEFEF]" : "from-[#ffffff]"
                        } to-transparent `}
                      />
                    </div>
                  </div>
                </ModalB>
                <ModalB isMenuExpanded={isMenuExpanded} isStuck={isStuck}>
                  <div className="flex gap-[6px] px-[12px] py-[14px] flex-col">
                    <div className="flex flex-row justify-between">
                      <span
                        className="font-medium pb-[0px] text-[12.25px] tracking-[0.25px]"
                        style={{
                          fontFamily: "Plus Jakarta Sans, sans-serif",
                        }}
                      >
                        Items
                      </span>
                      <div className="bg-[#EFEFEF] tracking-[0px] flex flex-row items-center justify-center  rounded-full px-[10px] h-[22.5px]">
                        <p
                          className="text-[10.25px] font-medium"
                          style={{
                            fontFamily: "Plus Jakarta Sans, sans-serif",
                          }}
                        >
                          x{" "}
                          {cart?.items?.reduce(
                            (acc, item) => acc + item.quantity,
                            0
                          ) || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex pt-[6px] flex-row justify-between">
                      <span
                        className="font-medium pb-[0px] text-[12.25px] tracking-[0.25px]"
                        style={{
                          fontFamily: "Plus Jakarta Sans, sans-serif",
                        }}
                      >
                        Amount
                      </span>
                      <div className="bg-[#EFEFEF] tracking-[0px] flex flex-row items-center justify-center  rounded-full px-[10px] h-[22.5px]">
                        <p
                          className="text-[10.25px] font-medium"
                          style={{
                            fontFamily: "Plus Jakarta Sans, sans-serif",
                          }}
                        >
                          {cart?.subtotal
                            ? `$${(cart.subtotal / 100).toFixed(2)}`
                            : "$0.00"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-row gap-[10px]">
                      <button
                        data-hovermodal-close="true"
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                        className={`${
                          isMenuExpanded ? "bg-[#ffffff]" : "bg-[#EFEFEF]"
                        } mt-[12px]  items-center justify-center flex font-medium  text-[11.5px] tracking-[0.15px] rounded-[10px] px-[12px] h-[42px] w-full`}
                      >
                        Keep Shopping
                      </button>
                      <Link
                        href={"/checkout"}
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                        className="mt-[12px] font-medium text-white flex items-center justify-center text-[11.5px] tracking-[0.15px] rounded-[10px] px-[12px] h-[42px] bg-[#484848] w-full"
                      >
                        Checkout
                      </Link>
                    </div>
                  </div>
                </ModalB>
              </div>
            }
          />

          {/* Menu content will go here */}
          {isMenuExpanded && (
            <div
              ref={expandedMenuContentRef}
              className="flex flex-col w-full h-fit"
              onClickCapture={(e) => {
                const target = e.target
                if (target instanceof Element && target.closest("a")) {
                  setIsMenuExpanded(false)
                }
              }}
            >
              <div className="expanded-menu-top-row flex flex-row gap-[25px] px-[2px] py-[22px] h-fit w-full">
                <div className="flex flex-col w-full gap-[12px] h-fit">
                  <span
                    className="font-medium pb-[0px] opacity-[50%] text-[12.25px] tracking-[0.25px]"
                    style={{
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    Shop
                  </span>
                  <style>{`
                    .menu-item:hover .menu-line {
                      width: 12px !important;
                      margin-right: 10px !important;
                      opacity: 0.6 !important;
                    }
                  `}</style>
                  <div className="flex flex-row gap-[10px]">
                    <Link
                      href={toMenuHref("Shop All")}
                      className="flex flex-row items-center menu-item"
                    >
                      {isMenuExpanded && (
                        <div className="menu-line h-[1.5px] w-0 mr-0 rounded-full bg-black opacity-0 transition-all duration-200"></div>
                      )}
                      <span
                        className="font-medium text-[15.25px] tracking-[0.15px]"
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                      >
                        Shop All
                      </span>
                    </Link>
                    <div className="border-[#00000025] tracking-[0px] flex flex-row items-center justify-center border-[1px] rounded-full px-[10px] h-[22.5px]">
                      <p
                        className="text-[9.8px] font-medium"
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                      >
                        New Items
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row gap-[10px] max-h-[24px]">
                    <Link
                      href={toMenuHref("Latest Magazine")}
                      className="flex flex-row items-center menu-item"
                    >
                      {isMenuExpanded && (
                        <div className="menu-line h-[1.5px] w-0 mr-0 rounded-full bg-black opacity-0 transition-all duration-200"></div>
                      )}
                      <span
                        className="font-medium text-[15.25px] tracking-[0.15px]"
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                      >
                        Latest Magazine
                      </span>
                    </Link>
                  </div>
                  <div className="flex flex-row gap-[10px] max-h-[24px]">
                    <Link
                      href={toMenuHref("Blog")}
                      className="flex flex-row items-center menu-item"
                    >
                      {isMenuExpanded && (
                        <div className="menu-line h-[1.5px] w-0 mr-0 rounded-full bg-black opacity-0 transition-all duration-200"></div>
                      )}
                      <span
                        className="font-medium text-[15.25px] tracking-[0.15px]"
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                      >
                        Blog
                      </span>
                    </Link>
                  </div>
                  <div className="flex flex-row gap-[10px] max-h-[24px]">
                    <Link
                      href={toMenuHref("Features")}
                      className="relative flex flex-row items-center menu-item"
                    >
                      {isMenuExpanded && (
                        <div className="menu-line h-[1.5px] w-0 mr-0 rounded-full bg-black opacity-0 transition-all duration-200"></div>
                      )}
                      <span
                        className="font-medium text-[15.25px] tracking-[0.15px]"
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                      >
                        Features
                      </span>
                    </Link>
                    <div className="border-[#00000025] tracking-[0px] flex flex-row items-center justify-center border-[1px] rounded-full px-[10px] h-[22.5px]">
                      <p
                        className="text-[9.8px] font-medium"
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                      >
                        New Features
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col w-full gap-[12px] h-fit">
                  <span
                    className="font-medium pb-[0px] opacity-[50%] text-[12.25px] tracking-[0.25px]"
                    style={{
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    Categories
                  </span>
                  <div className="flex flex-row gap-[10px]">
                    <Link
                      href={toStoreCategoryHref("Magazines")}
                      className="flex flex-row items-center menu-item"
                    >
                      {isMenuExpanded && (
                        <div className="menu-line h-[1.5px] w-0 mr-0 rounded-full bg-black opacity-0 transition-all duration-200"></div>
                      )}
                      <span
                        className="font-medium text-[15.25px] tracking-[0.15px]"
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                      >
                        Magazines
                      </span>
                    </Link>
                    <div className="border-[#00000025] tracking-[0px] flex flex-row items-center justify-center border-[1px] rounded-full px-[10px] h-[22.5px]">
                      <p
                        className="text-[9.8px] font-medium"
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                      >
                        Just Dropped
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row gap-[10px] max-h-[24px]">
                    <Link
                      href={toStoreCategoryHref("Clothes")}
                      className="flex flex-row items-center menu-item"
                    >
                      {isMenuExpanded && (
                        <div className="menu-line h-[1.5px] w-0 mr-0 rounded-full bg-black opacity-0 transition-all duration-200"></div>
                      )}
                      <span
                        className="font-medium text-[15.25px] tracking-[0.15px]"
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                      >
                        Clothes
                      </span>
                    </Link>
                  </div>
                  <div className="flex flex-row gap-[10px] max-h-[24px]">
                    <Link
                      href={toStoreCategoryHref("Posters")}
                      className="flex flex-row items-center menu-item"
                    >
                      {isMenuExpanded && (
                        <div className="menu-line h-[1.5px] w-0 mr-0 rounded-full bg-black opacity-0 transition-all duration-200"></div>
                      )}
                      <span
                        className="font-medium text-[15.25px] tracking-[0.15px]"
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                      >
                        Posters
                      </span>
                    </Link>
                  </div>
                  <div className="flex flex-row gap-[10px] max-h-[24px]">
                    <Link
                      href={toStoreCategoryHref("Jewelry")}
                      className="flex flex-row items-center menu-item"
                    >
                      {isMenuExpanded && (
                        <div className="menu-line h-[1.5px] w-0 mr-0 rounded-full bg-black opacity-0 transition-all duration-200"></div>
                      )}
                      <span
                        className="font-medium text-[15.25px] tracking-[0.15px]"
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                      >
                        Jewelry
                      </span>
                    </Link>
                  </div>
                  <div className="flex flex-row gap-[10px] max-h-[24px]">
                    <Link
                      href={toStoreCategoryHref("Bundles")}
                      className="flex flex-row items-center menu-item"
                    >
                      {isMenuExpanded && (
                        <div className="menu-line h-[1.5px] w-0 mr-0 rounded-full bg-black opacity-0 transition-all duration-200"></div>
                      )}
                      <span
                        className="font-medium text-[15.25px] tracking-[0.15px]"
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                      >
                        Bundles
                      </span>
                    </Link>
                  </div>
                </div>
                <div className="flex flex-col w-full gap-[12px] h-fit">
                  <span
                    className="font-medium pb-[0px] opacity-[50%] text-[12.25px] tracking-[0.25px]"
                    style={{
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    Others
                  </span>
                  <div className="flex flex-row gap-[10px] max-h-[24px]">
                    <Link
                      href={toMenuHref("Sign Up")}
                      className="flex flex-row items-center menu-item"
                    >
                      {isMenuExpanded && (
                        <div className="menu-line h-[1.5px] w-0 mr-0 rounded-full bg-black opacity-0 transition-all duration-200"></div>
                      )}
                      <span
                        className="font-medium text-[15.25px] tracking-[0.15px]"
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                      >
                        Sign Up
                      </span>
                    </Link>
                  </div>
                  <div className="flex flex-row gap-[10px] max-h-[24px]">
                    <Link
                      href={toMenuHref("Our Story")}
                      className="flex flex-row items-center menu-item"
                    >
                      {isMenuExpanded && (
                        <div className="menu-line h-[1.5px] w-0 mr-0 rounded-full bg-black opacity-0 transition-all duration-200"></div>
                      )}
                      <span
                        className="font-medium text-[15.25px] tracking-[0.15px]"
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                      >
                        Our Story
                      </span>
                    </Link>
                  </div>
                  <div className="flex flex-row gap-[10px] max-h-[24px]">
                    <Link
                      href={toMenuHref("Become Affiliate")}
                      className="flex flex-row items-center menu-item"
                    >
                      {isMenuExpanded && (
                        <div className="menu-line h-[1.5px] w-0 mr-0 rounded-full bg-black opacity-0 transition-all duration-200"></div>
                      )}
                      <span
                        className="font-medium text-[15.25px] tracking-[0.15px]"
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                      >
                        Become Affiliate
                      </span>
                    </Link>
                  </div>
                  <div className="flex flex-row gap-[10px] max-h-[24px]">
                    <Link
                      href={toMenuHref("Contact")}
                      className="flex flex-row items-center menu-item"
                    >
                      {isMenuExpanded && (
                        <div className="menu-line h-[1.5px] w-0 mr-0 rounded-full bg-black opacity-0 transition-all duration-200"></div>
                      )}
                      <span
                        className="font-medium text-[15.25px] tracking-[0.15px]"
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                      >
                        Contact
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="expanded-menu-bottom-row flex flex-row gap-[8px] h-[320px]">
                <div className="expanded-menu-card flex flex-col gap-[6px] px-[12px] py-[15px] bg-[#EFEFEF] items-start justify-end w-full h-full rounded-[10px]">
                  <span
                    className="font-medium pb-[0px] opacity-[50%] text-[12.25px] tracking-[0.25px]"
                    style={{
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    Blog
                  </span>
                  <span
                    className="font-medium text-[15.25px] tracking-[0.15px]"
                    style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                  >
                    Marlee World’s “Dont Judge Me”
                  </span>
                  <button
                    style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                    className="mt-[12px] font-medium opacity-[65%] text-[11.5px] tracking-[0.15px] rounded-[10px] px-[12px] h-[42px] bg-white w-full"
                  >
                    Read More
                  </button>
                </div>
                <div className="expanded-menu-card flex flex-col gap-[6px] px-[12px] py-[15px] bg-[#EFEFEF] items-start justify-end w-full h-full rounded-[10px]">
                  <span
                    className="font-medium pb-[0px] opacity-[50%] text-[12.25px] tracking-[0.25px]"
                    style={{
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    Shop
                  </span>
                  <div className="flex flex-row justify-between w-full">
                    <span
                      className="font-medium text-[15.25px] tracking-[0.15px]"
                      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                    >
                      Explore Bundles
                    </span>
                    <div className="border-[#00000025] tracking-[0px] flex flex-row items-center justify-center border-[1px] rounded-full px-[10px] h-[22.5px]">
                      <p
                        className="text-[9.8px] font-medium"
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                      >
                        15% Off
                      </p>
                    </div>
                  </div>
                </div>
                <div className="expanded-menu-card flex flex-col gap-[6px] px-[12px] py-[15px] bg-[#EFEFEF] items-start justify-end w-full h-full rounded-[10px]">
                  <span
                    className="font-medium pb-[0px] opacity-[50%] text-[12.25px] tracking-[0.25px]"
                    style={{
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    Blog
                  </span>
                  <span
                    className="font-medium text-[15.25px] tracking-[0.15px]"
                    style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                  >
                    How It Came Together
                  </span>
                  <button
                    style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                    className="mt-[12px] font-medium opacity-[65%] text-[11.5px] tracking-[0.15px] rounded-[10px] px-[12px] h-[42px] bg-white w-full"
                  >
                    Read All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
