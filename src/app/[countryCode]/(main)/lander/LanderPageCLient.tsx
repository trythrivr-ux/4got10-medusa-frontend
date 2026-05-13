"use client"

import { useEffect, useRef, useState } from "react"

const STEPS_PER_SECTION = 14

type LanderProduct = {
  id: string
  title?: string
  thumbnail?: string | null
  images?: Array<{ url?: string | null }> | null
}

type LandingPageClientProps = {
  products: LanderProduct[]
}

export default function LandingPageClient({
  products,
}: LandingPageClientProps) {
  const sections = products.length
    ? products.map((product, index) => product.title || `VOL ${index + 1}`)
    : ["VOL I", "VOL II", "VOL III", "VOL IV", "VOL V", "VOL VI"]
  const visibleProducts: LanderProduct[] = products.length
    ? products
    : sections.map((section, index) => ({
        id: `placeholder-${index}`,
        title: section,
      }))
  const [activeSection, setActiveSection] = useState(0)
  const [activeStep, setActiveStep] = useState(0)
  const [expandProgress, setExpandProgress] = useState(0)
  const [rowProgress, setRowProgress] = useState(0)
  const [rowWidth, setRowWidth] = useState(0)
  const productRowRef = useRef<HTMLDivElement>(null)
  const tileGap = 4
  const baseWidth = rowWidth > 0 ? (rowWidth - tileGap * 2) / 3 : 0
  const totalSteps = sections.length * STEPS_PER_SECTION
  const currentGlobalStep = activeSection * STEPS_PER_SECTION + activeStep
  const stepperWidth = 70
  const stepperProgress =
    totalSteps > 1 ? currentGlobalStep / (totalSteps - 1) : 0
  const stepperTranslate = 50 - stepperWidth * stepperProgress
  const rowEndTranslate =
    rowProgress *
    Math.max(0, visibleProducts.length - 1) *
    (baseWidth + tileGap)
  const expandedWidth = baseWidth + (rowWidth - baseWidth) * expandProgress
  const rowTranslate = rowEndTranslate

  useEffect(() => {
    const scrollContainer = document.querySelector<HTMLElement>(
      "[data-scroll-container]"
    )

    if (!scrollContainer) return

    const updateProgress = () => {
      const pinFlow = document.getElementById("lander-pin-flow")
      if (!pinFlow) return

      const flowTop = pinFlow.offsetTop
      const flowHeight = pinFlow.offsetHeight - scrollContainer.clientHeight
      const rawProgress =
        (scrollContainer.scrollTop - flowTop) / Math.max(1, flowHeight)
      const progress = Math.min(1, Math.max(0, rawProgress))
      const scrollPhaseProgress = Math.min(1, progress / 0.75)
      const expansionPhaseProgress = Math.min(
        1,
        Math.max(0, (progress - 0.75) / 0.25)
      )
      const sectionProgress = progress * sections.length
      const sectionIndex = Math.min(
        sections.length - 1,
        Math.floor(sectionProgress)
      )
      const progressInSection = sectionProgress - sectionIndex
      const stepIndex = Math.min(
        STEPS_PER_SECTION - 1,
        Math.floor(progressInSection * STEPS_PER_SECTION)
      )

      setActiveSection(sectionIndex)
      setActiveStep(stepIndex)
      setRowProgress(scrollPhaseProgress)
      setExpandProgress(expansionPhaseProgress)
    }

    updateProgress()
    scrollContainer.addEventListener("scroll", updateProgress, {
      passive: true,
    })
    window.addEventListener("resize", updateProgress)

    const resizeObserver = new ResizeObserver(([entry]) => {
      setRowWidth(entry.contentRect.width)
    })

    if (productRowRef.current) {
      resizeObserver.observe(productRowRef.current)
      setRowWidth(productRowRef.current.clientWidth)
    }

    return () => {
      resizeObserver.disconnect()
      scrollContainer.removeEventListener("scroll", updateProgress)
      window.removeEventListener("resize", updateProgress)
    }
  }, [sections.length])

  return (
    <main id="lander-scroll-flow" className="relative w-full bg-[#efefef]">
      <div
        id="lander-pin-flow"
        className="relative w-full p-[6px]"
        style={{ height: `${Math.max(2, sections.length + 1) * 100}vh` }}
      >
        <section
          id="lander-pinned-layout"
          className="sticky top-0 h-[calc(100vh-12px)] w-full"
        >
          <div className="grid h-full w-full grid-rows-[1fr_130px] gap-[4px] overflow-hidden">
            <div
              id="lander-product-row"
              ref={productRowRef}
              className="overflow-hidden rounded-[4px]"
            >
              <div
                className="flex h-full gap-[4px]"
                style={{
                  transform: `translateX(-${rowTranslate}px)`,
                }}
              >
                {visibleProducts.map((product, index) => {
                  const imageUrl = product.thumbnail || product.images?.[0]?.url
                  const isNewest = index === visibleProducts.length - 1

                  if (isNewest) {
                    return (
                      <div
                        key={product.id}
                        className="relative h-full shrink-0 overflow-hidden rounded-[4px] bg-white"
                        style={{
                          width: rowWidth > 0 ? `${rowWidth}px` : "100vw",
                        }}
                      >
                        <div
                          className="relative h-full overflow-hidden rounded-[4px] bg-white transition-[width] duration-100 ease-linear"
                          style={{
                            width:
                              rowWidth > 0 ? `${expandedWidth}px` : "33.333vw",
                          }}
                        >
                          {imageUrl && (
                            <img
                              src={imageUrl}
                              alt={product.title || ""}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={product.id}
                      className="relative h-full shrink-0 overflow-hidden rounded-[4px] bg-white transition-[width] duration-100 ease-linear max-small:w-[calc(100vw-100px)]"
                      style={{
                        width: rowWidth > 0 ? `${baseWidth}px` : "33.333vw",
                      }}
                    >
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={product.title || ""}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-[4px]">
              <div className="rounded-[4px] bg-white" />
              <div className="rounded-[4px] bg-white" />
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-[28px] left-0 z-20 w-screen overflow-hidden">
        <div
          className="flex w-[70vw] items-end justify-between"
          style={{ transform: `translateX(${stepperTranslate}vw)` }}
        >
          {sections.map((section, sectionIndex) => (
            <div
              key={section}
              className="flex flex-col items-center gap-[10px] pr-[14px]"
              style={{ width: `${100 / sections.length}%` }}
            >
              <p
                className={`text-[7px] font-light uppercase leading-none tracking-[0.08em] ${
                  activeSection === sectionIndex
                    ? "text-black"
                    : "text-[#B7B7B7]"
                }`}
              >
                {section}
              </p>
              <div className="flex w-full items-end justify-between">
                {Array.from({ length: STEPS_PER_SECTION }).map(
                  (_, stepIndex) => {
                    const isActive =
                      sectionIndex < activeSection ||
                      (sectionIndex === activeSection &&
                        stepIndex <= activeStep)

                    return (
                      <div
                        key={stepIndex}
                        className={`h-[15px] w-[1px] ${
                          isActive ? "bg-[#000000]" : "bg-[#E8E8E8]"
                        }`}
                      />
                    )
                  }
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
