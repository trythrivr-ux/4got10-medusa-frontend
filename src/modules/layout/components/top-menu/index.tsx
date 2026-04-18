"use client"

import Image from "next/image"
import type { ReactNode } from "react"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import gsap from "gsap"
import { HttpTypes } from "@medusajs/types"
import { useParams, usePathname } from "next/navigation"
import { updateRegion } from "@lib/data/cart"

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

export default function FourGotTenMenu1({
  regions,
}: {
  regions: HttpTypes.StoreRegion[]
}) {
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const stickyOuterRef = useRef<HTMLDivElement | null>(null)
  const stickyInnerRef = useRef<HTMLDivElement | null>(null)
  const accountNewsRef = useRef<HTMLDivElement | null>(null)
  const menuBoxRef = useRef<HTMLDivElement | null>(null)
  const cartBoxRef = useRef<HTMLDivElement | null>(null)
  const pillsContainerRef = useRef<HTMLDivElement | null>(null)
  const expandedPillsWidthRef = useRef<number | null>(null)
  const expandedMenuWidthRef = useRef<number | null>(null)
  const expandedCartWidthRef = useRef<number | null>(null)
  const expandedAccountNewsWidthRef = useRef<number | null>(null)
  const hasExpandedAnimatedRef = useRef(false)
  const prevIsMenuExpandedRef = useRef(false)
  const logoLeftRef = useRef<HTMLDivElement | null>(null)
  const logoRightRef = useRef<HTMLDivElement | null>(null)
  const headerLogoLeftRef = useRef<HTMLDivElement | null>(null)
  const headerLogoRightRef = useRef<HTMLDivElement | null>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  const [isStuck, setIsStuck] = useState(false)
  const [isMenuExpanded, setIsMenuExpanded] = useState(false)

  const { countryCode } = useParams<{ countryCode: string }>()
  const pathname = usePathname()
  const currentPath = pathname.split(`/${countryCode}`)[1] ?? ""

  const countryOptions = useMemo(() => {
    return regions
      .map((r) =>
        r.countries?.map((c) => ({
          country: c.iso_2,
          label: c.display_name,
          currency_code: r.currency_code,
        }))
      )
      .flat()
      .filter(Boolean)
      .sort((a, b) => (a?.label ?? "").localeCompare(b?.label ?? ""))
  }, [regions])

  const currentCountry = useMemo(() => {
    if (!countryCode) {
      return countryOptions?.[0]
    }

    return (
      countryOptions?.find((o) => o?.country === countryCode) ??
      countryOptions?.[0]
    )
  }, [countryCode, countryOptions])

  const currencyOptions = useMemo(() => {
    const map = new Map<string, HttpTypes.StoreRegion>()
    regions.forEach((r) => {
      if (r.currency_code && !map.has(r.currency_code)) {
        map.set(r.currency_code, r)
      }
    })
    return Array.from(map.entries())
      .map(([code, region]) => ({ code, region }))
      .sort((a, b) => a.code.localeCompare(b.code))
  }, [regions])

  const currentCurrency = useMemo(() => {
    return currentCountry?.currency_code ?? currencyOptions?.[0]?.code ?? ""
  }, [currentCountry, currencyOptions])

  const currencySymbol = useMemo(() => {
    const symbols: Record<string, string> = {
      dkk: "kr",
      eur: "€",
      usd: "$",
      gbp: "£",
      sek: "kr",
      nok: "kr",
      chf: "Fr",
      jpy: "¥",
      cad: "C$",
      aud: "A$",
    }

    return (
      symbols[currentCurrency.toLowerCase()] ?? currentCurrency.toUpperCase()
    )
  }, [currentCurrency])

  const flagUrl = useMemo(() => {
    const code = (countryCode ?? "").toLowerCase()
    if (!code) {
      return null
    }

    return `https://flagcdn.com/w40/${code}.png`
  }, [countryCode])

  const [isCountryOpen, setIsCountryOpen] = useState(false)
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false)

  const hoverCloseCountryTimeoutRef = useRef<number | null>(null)
  const hoverCloseCurrencyTimeoutRef = useRef<number | null>(null)

  const autoCloseCountryTimeoutRef = useRef<number | null>(null)
  const autoCloseCurrencyTimeoutRef = useRef<number | null>(null)

  const isCountryInteractingRef = useRef(false)
  const isCurrencyInteractingRef = useRef(false)

  const countryButtonRef = useRef<HTMLButtonElement | null>(null)
  const currencyButtonRef = useRef<HTMLButtonElement | null>(null)
  const [countryMenuPos, setCountryMenuPos] = useState<{
    top: number
    left: number
    width: number
  } | null>(null)
  const [currencyMenuPos, setCurrencyMenuPos] = useState<{
    top: number
    left: number
    width: number
  } | null>(null)

  useLayoutEffect(() => {
    if (!isCountryOpen || !countryButtonRef.current) {
      return
    }

    const rect = countryButtonRef.current.getBoundingClientRect()
    setCountryMenuPos({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    })
  }, [isCountryOpen])

  useLayoutEffect(() => {
    if (!isCurrencyOpen || !currencyButtonRef.current) {
      return
    }

    const rect = currencyButtonRef.current.getBoundingClientRect()
    setCurrencyMenuPos({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    })
  }, [isCurrencyOpen])

  useEffect(() => {
    return () => {
      if (hoverCloseCountryTimeoutRef.current !== null) {
        window.clearTimeout(hoverCloseCountryTimeoutRef.current)
      }
      if (hoverCloseCurrencyTimeoutRef.current !== null) {
        window.clearTimeout(hoverCloseCurrencyTimeoutRef.current)
      }

      if (autoCloseCountryTimeoutRef.current !== null) {
        window.clearTimeout(autoCloseCountryTimeoutRef.current)
      }
      if (autoCloseCurrencyTimeoutRef.current !== null) {
        window.clearTimeout(autoCloseCurrencyTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isCountryOpen) {
      if (autoCloseCountryTimeoutRef.current !== null) {
        window.clearTimeout(autoCloseCountryTimeoutRef.current)
        autoCloseCountryTimeoutRef.current = null
      }
      return
    }

    if (autoCloseCountryTimeoutRef.current !== null) {
      window.clearTimeout(autoCloseCountryTimeoutRef.current)
    }

    autoCloseCountryTimeoutRef.current = window.setTimeout(() => {
      if (!isCountryInteractingRef.current) {
        setIsCountryOpen(false)
      }
    }, 1000)

    return () => {
      if (autoCloseCountryTimeoutRef.current !== null) {
        window.clearTimeout(autoCloseCountryTimeoutRef.current)
        autoCloseCountryTimeoutRef.current = null
      }
    }
  }, [isCountryOpen])

  useEffect(() => {
    if (!isCurrencyOpen) {
      if (autoCloseCurrencyTimeoutRef.current !== null) {
        window.clearTimeout(autoCloseCurrencyTimeoutRef.current)
        autoCloseCurrencyTimeoutRef.current = null
      }
      return
    }

    if (autoCloseCurrencyTimeoutRef.current !== null) {
      window.clearTimeout(autoCloseCurrencyTimeoutRef.current)
    }

    autoCloseCurrencyTimeoutRef.current = window.setTimeout(() => {
      if (!isCurrencyInteractingRef.current) {
        setIsCurrencyOpen(false)
      }
    }, 1000)

    return () => {
      if (autoCloseCurrencyTimeoutRef.current !== null) {
        window.clearTimeout(autoCloseCurrencyTimeoutRef.current)
        autoCloseCurrencyTimeoutRef.current = null
      }
    }
  }, [isCurrencyOpen])

  useLayoutEffect(() => {
    // Set initial state (off-screen, hidden)
    gsap.set(headerLogoLeftRef.current, { x: -100, opacity: 0 })
    gsap.set(headerLogoRightRef.current, { x: 100, opacity: 0 })

    // Animate in on mount
    const tl = gsap.timeline()
    tl.to(
      headerLogoLeftRef.current,
      {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.inOut",
      },
      0
    )
    tl.to(
      headerLogoRightRef.current,
      {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.inOut",
      },
      0
    )

    // Animate out when scrolling
    const handleScroll = () => {
      if (window.scrollY > 50) {
        gsap.to(headerLogoLeftRef.current, {
          x: -100,
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
        })
        gsap.to(headerLogoRightRef.current, {
          x: 100,
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
        })
      } else {
        gsap.to(headerLogoLeftRef.current, {
          x: 0,
          opacity: 1,
          duration: 0.3,
          ease: "power2.inOut",
        })
        gsap.to(headerLogoRightRef.current, {
          x: 0,
          opacity: 1,
          duration: 0.3,
          ease: "power2.inOut",
        })
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      tl.kill()
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <>
      <header className="px-[0px]  pb-[12px] overflow-hidden pt-[12px] relative">
        <div className="flex pb-[12px] items-start justify-between">
          <div ref={headerLogoLeftRef} className="flex items-center h-[34px]">
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
          <div ref={headerLogoRightRef} className="flex items-center h-[34px]">
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

        <div className="mt-[8px] flex items-center gap-[8px]">
          <div className="h-[26px] rounded-full bg-[#F1F1F1] px-[15px] text-[10px] tracking-[0.01em] text-black/70 flex items-center gap-[8px]">
            <span>05d</span>
            <span className="h-[8px] w-[1px] bg-black/20" />
            <span className="text-black">12h</span>
            <span className="h-[8px] w-[1px] bg-black/20" />
            <span className="text-black">30s</span>
          </div>

          <div className="flex flex-row gap-[8px] w-full justify-end">
            <div
              className="relative"
              onMouseEnter={() => {
                isCountryInteractingRef.current = true
                if (hoverCloseCountryTimeoutRef.current !== null) {
                  window.clearTimeout(hoverCloseCountryTimeoutRef.current)
                  hoverCloseCountryTimeoutRef.current = null
                }
                setIsCountryOpen(true)
              }}
              onMouseLeave={() => {
                isCountryInteractingRef.current = false
                if (hoverCloseCountryTimeoutRef.current !== null) {
                  window.clearTimeout(hoverCloseCountryTimeoutRef.current)
                }
                hoverCloseCountryTimeoutRef.current = window.setTimeout(() => {
                  setIsCountryOpen(false)
                }, 120)
              }}
              onFocusCapture={() => {
                isCountryInteractingRef.current = true
                setIsCountryOpen(true)
              }}
              onBlurCapture={() => {
                isCountryInteractingRef.current = false
              }}
            >
              <button
                ref={countryButtonRef}
                onClick={() => setIsCountryOpen((v) => !v)}
                className="h-[26px] rounded-full bg-[#F1F1F1] px-[15px] text-[10px] tracking-[0.01em] text-black/70 flex items-center gap-[8px]"
                type="button"
              >
                <span className="text-black">
                  {currentCountry?.label ?? ""}
                </span>
                <span className="h-[8px] w-[1px] bg-black/20" />
                <span className="text-black">
                  {(countryCode ?? "").toUpperCase()}
                </span>
                {flagUrl && (
                  <img
                    src={flagUrl}
                    alt=""
                    className="w-[17px] h-[10px] rounded-[2px] object-cover ml-[2px]"
                  />
                )}
              </button>

              {isCountryOpen && countryMenuPos && (
                <>
                  <div
                    className="fixed inset-0 z-[90]"
                    onClick={() => setIsCountryOpen(false)}
                  />
                  <div
                    className="fixed bg-white border border-[#E5E5E5] rounded-[10px] shadow-lg z-[110] py-[6px] max-h-[300px] overflow-auto"
                    onMouseEnter={() => {
                      isCountryInteractingRef.current = true
                      if (hoverCloseCountryTimeoutRef.current !== null) {
                        window.clearTimeout(hoverCloseCountryTimeoutRef.current)
                        hoverCloseCountryTimeoutRef.current = null
                      }
                    }}
                    onMouseLeave={() => {
                      isCountryInteractingRef.current = false
                      if (hoverCloseCountryTimeoutRef.current !== null) {
                        window.clearTimeout(hoverCloseCountryTimeoutRef.current)
                      }
                      hoverCloseCountryTimeoutRef.current = window.setTimeout(
                        () => {
                          setIsCountryOpen(false)
                        },
                        120
                      )
                    }}
                    onFocusCapture={() => {
                      isCountryInteractingRef.current = true
                    }}
                    onBlurCapture={() => {
                      isCountryInteractingRef.current = false
                    }}
                    style={{
                      top: countryMenuPos.top,
                      left: countryMenuPos.left,
                      minWidth: Math.max(countryMenuPos.width, 220),
                    }}
                  >
                    {countryOptions.map((o) => (
                      <button
                        key={o?.country}
                        className="w-full text-left px-[12px] py-[8px] text-[11px] hover:bg-[#F5F5F5]"
                        onClick={() => {
                          if (!o?.country) {
                            return
                          }
                          setIsCountryOpen(false)
                          updateRegion(o.country, currentPath)
                        }}
                        type="button"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-black">{o?.label}</span>
                          <span className="text-black/60">
                            {(o?.country ?? "").toUpperCase()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div
              className="relative"
              onMouseEnter={() => {
                isCurrencyInteractingRef.current = true
                if (hoverCloseCurrencyTimeoutRef.current !== null) {
                  window.clearTimeout(hoverCloseCurrencyTimeoutRef.current)
                  hoverCloseCurrencyTimeoutRef.current = null
                }
                setIsCurrencyOpen(true)
              }}
              onMouseLeave={() => {
                isCurrencyInteractingRef.current = false
                if (hoverCloseCurrencyTimeoutRef.current !== null) {
                  window.clearTimeout(hoverCloseCurrencyTimeoutRef.current)
                }
                hoverCloseCurrencyTimeoutRef.current = window.setTimeout(() => {
                  setIsCurrencyOpen(false)
                }, 120)
              }}
              onFocusCapture={() => {
                isCurrencyInteractingRef.current = true
                setIsCurrencyOpen(true)
              }}
              onBlurCapture={() => {
                isCurrencyInteractingRef.current = false
              }}
            >
              <button
                ref={currencyButtonRef}
                onClick={() => setIsCurrencyOpen((v) => !v)}
                className="h-[26px] rounded-full bg-[#F1F1F1] px-[15px] text-[10px] tracking-[0.01em] text-black/70 flex items-center gap-[8px]"
                type="button"
              >
                <span className="text-black">
                  {currentCurrency.toUpperCase()}
                </span>
                <span className="h-[8px] w-[1px] bg-black/20" />
                <span className="text-black">{currencySymbol}</span>
              </button>

              {isCurrencyOpen && currencyMenuPos && (
                <>
                  <div
                    className="fixed inset-0 z-[90]"
                    onClick={() => setIsCurrencyOpen(false)}
                  />
                  <div
                    className="fixed bg-white border border-[#E5E5E5] rounded-[10px] shadow-lg z-[110] py-[6px] max-h-[240px] overflow-auto"
                    onMouseEnter={() => {
                      isCurrencyInteractingRef.current = true
                      if (hoverCloseCurrencyTimeoutRef.current !== null) {
                        window.clearTimeout(
                          hoverCloseCurrencyTimeoutRef.current
                        )
                        hoverCloseCurrencyTimeoutRef.current = null
                      }
                    }}
                    onMouseLeave={() => {
                      isCurrencyInteractingRef.current = false
                      if (hoverCloseCurrencyTimeoutRef.current !== null) {
                        window.clearTimeout(
                          hoverCloseCurrencyTimeoutRef.current
                        )
                      }
                      hoverCloseCurrencyTimeoutRef.current = window.setTimeout(
                        () => {
                          setIsCurrencyOpen(false)
                        },
                        120
                      )
                    }}
                    onFocusCapture={() => {
                      isCurrencyInteractingRef.current = true
                    }}
                    onBlurCapture={() => {
                      isCurrencyInteractingRef.current = false
                    }}
                    style={{
                      top: currencyMenuPos.top,
                      left: currencyMenuPos.left,
                      minWidth: Math.max(currencyMenuPos.width, 140),
                    }}
                  >
                    {currencyOptions.map((c) => (
                      <button
                        key={c.code}
                        className="w-full text-left px-[12px] py-[8px] text-[11px] hover:bg-[#F5F5F5]"
                        onClick={() => {
                          const nextCountry = c.region.countries?.[0]?.iso_2
                          if (!nextCountry) {
                            return
                          }
                          setIsCurrencyOpen(false)
                          updateRegion(nextCountry, currentPath)
                        }}
                        type="button"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-black">
                            {c.code.toUpperCase()}
                          </span>
                          <span className="text-black/60">
                            {(() => {
                              const symbols: Record<string, string> = {
                                dkk: "kr",
                                eur: "€",
                                usd: "$",
                                gbp: "£",
                                sek: "kr",
                                nok: "kr",
                                chf: "Fr",
                                jpy: "¥",
                                cad: "C$",
                                aud: "A$",
                              }
                              return (
                                symbols[c.code.toLowerCase()] ??
                                c.code.toUpperCase()
                              )
                            })()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div></div>
      </header>
    </>
  )
}
