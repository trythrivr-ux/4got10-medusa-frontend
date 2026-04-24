"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import gsap from "gsap"
import type { ReactNode, RefObject } from "react"
import { MOBILE_MAX_WIDTH } from "@lib/breakpoints"

interface HoverModalProps {
  triggerRef: RefObject<HTMLElement>
  modalContent: ReactNode
  className?: string
  triggerType?: "hover" | "click"
  topOffset?: number
  isMenuExpanded?: boolean
  isStuck?: boolean
}

export const ModalB = ({
  children,
  className = "",
  isMenuExpanded = false,
  isStuck = false,
}: {
  children: ReactNode
  className?: string
  isMenuExpanded?: boolean
  isStuck?: boolean
}) => {
  return (
    <div
      className={`modal-b-wrapper rounded-[10px] ${className} ${
        isStuck || isMenuExpanded
          ? "shadow-[0_0_30px_rgba(239,239,239)] relative z-10"
          : ""
      }`}
      style={{
        backgroundColor: isMenuExpanded
          ? "rgba(239, 239, 239)"
          : "rgba(255, 255, 255)",
      }}
    >
      {children}
    </div>
  )
}

export default function HoverModal({
  triggerRef,
  modalContent,
  className = "",
  triggerType = "hover",
  topOffset = 8,
  isMenuExpanded = false,
  isStuck = false,
}: HoverModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const isOpenRef = useRef(false)
  const [isMobile, setIsMobile] = useState(false)
  const [position, setPosition] = useState<{
    top: number
    left: number
  } | null>(null)

  const modalRef = useRef<HTMLDivElement | null>(null)
  const closeTimeoutRef = useRef<number | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  const isOverTriggerRef = useRef(false)
  const isOverModalRef = useRef(false)

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`)
    const update = () => setIsMobile(mq.matches)

    update()
    mq.addEventListener("change", update)

    return () => mq.removeEventListener("change", update)
  }, [])

  const updatePosition = () => {
    if (!triggerRef.current) return

    if (isMobile) {
      setPosition({ top: 0, left: 0 })
      return
    }

    const rect = triggerRef.current.getBoundingClientRect()
    const modalWidth = 350
    const modalHeight = 200
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    const wouldGoOffScreenRight = rect.left + modalWidth > windowWidth
    const wouldGoOffScreenBottom =
      rect.bottom + topOffset + modalHeight > windowHeight

    setPosition({
      top: wouldGoOffScreenBottom
        ? rect.top - modalHeight - topOffset
        : rect.bottom + topOffset,
      left: wouldGoOffScreenRight
        ? Math.max(8, rect.right - modalWidth)
        : rect.left,
    })
  }

  const openModal = () => {
    clearCloseTimeout()
    updatePosition()
    setIsOpen(true)
  }

  const scheduleClose = () => {
    clearCloseTimeout()

    closeTimeoutRef.current = window.setTimeout(() => {
      if (!isOverTriggerRef.current && !isOverModalRef.current) {
        setIsOpen(false)
      }
      closeTimeoutRef.current = null
    }, 300)
  }

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
    }
  }, [isOpen])

  useEffect(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const resolvedTriggerType: "hover" | "click" = isMobile
      ? "click"
      : triggerType

    const onTriggerEnter = () => {
      if (resolvedTriggerType !== "hover") return
      isOverTriggerRef.current = true
      openModal()
    }

    const onTriggerLeave = (e: MouseEvent) => {
      if (resolvedTriggerType !== "hover") return

      isOverTriggerRef.current = false

      const nextTarget = e.relatedTarget as Node | null
      if (
        modalRef.current &&
        nextTarget &&
        modalRef.current.contains(nextTarget)
      ) {
        return
      }

      scheduleClose()
    }

    const onTriggerClick = () => {
      if (resolvedTriggerType !== "click") return
      updatePosition()
      setIsOpen((prev) => !prev)
    }

    if (resolvedTriggerType === "hover") {
      trigger.addEventListener("mouseenter", onTriggerEnter)
      trigger.addEventListener("mouseleave", onTriggerLeave)
    }

    if (resolvedTriggerType === "click") {
      trigger.addEventListener("click", onTriggerClick)
    }

    const handleScroll = () => {
      if (isOpen) updatePosition()
    }

    resizeObserverRef.current = new ResizeObserver(() => {
      if (isOpen) updatePosition()
    })
    resizeObserverRef.current.observe(trigger)

    window.addEventListener("scroll", handleScroll, true)
    window.addEventListener("resize", handleScroll)

    return () => {
      if (resolvedTriggerType === "hover") {
        trigger.removeEventListener("mouseenter", onTriggerEnter)
        trigger.removeEventListener("mouseleave", onTriggerLeave)
      }

      if (resolvedTriggerType === "click") {
        trigger.removeEventListener("click", onTriggerClick)
      }

      resizeObserverRef.current?.disconnect()
      resizeObserverRef.current = null

      window.removeEventListener("scroll", handleScroll, true)
      window.removeEventListener("resize", handleScroll)

      clearCloseTimeout()
    }
  }, [triggerRef, triggerType, isOpen, topOffset, isMobile])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (!modalRef.current) return

    gsap.killTweensOf(modalRef.current)

    if (isOpen) {
      gsap.fromTo(
        modalRef.current,
        {
          opacity: 0,
          y: -8,
          scale: 0.98,
          filter: "blur(2px)",
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.22,
          ease: "power2.out",
          overwrite: true,
        }
      )

      const blocks =
        modalRef.current.querySelectorAll<HTMLElement>(".modal-b-wrapper")
      if (blocks.length) {
        gsap.killTweensOf(blocks)
        gsap.fromTo(
          blocks,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.22,
            ease: "power2.out",
            stagger: 0.045,
            delay: 0.02,
            overwrite: true,
          }
        )
      }
    } else if (shouldRender) {
      gsap.to(modalRef.current, {
        opacity: 0,
        y: -8,
        scale: 0.98,
        filter: "blur(2px)",
        duration: 0.16,
        ease: "power2.in",
        overwrite: true,
        onComplete: () => {
          setShouldRender(false)
        },
      })
    }
  }, [isOpen, shouldRender])

  if (!shouldRender || !position) return null

  const handleModalMouseEnter = () => {
    if (isMobile) return
    if (triggerType !== "hover") return
    isOverModalRef.current = true
    clearCloseTimeout()
  }

  const handleModalMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return
    if (triggerType !== "hover") return

    isOverModalRef.current = false

    const nextTarget = e.relatedTarget as Node | null
    if (
      triggerRef.current &&
      nextTarget &&
      triggerRef.current.contains(nextTarget)
    ) {
      return
    }

    scheduleClose()
  }

  if (isMobile) {
    return createPortal(
      <div className="fixed inset-0 z-[9999]">
        <div
          className="absolute inset-0 bg-black/10"
          style={{ backdropFilter: "blur(8px)" }}
          onClick={() => setIsOpen(false)}
        />
        <div
          ref={modalRef}
          className={`absolute p-[10px] inset-0 w-full h-full overflow-auto ${className}`}
          onClickCapture={(e) => {
            const target = e.target
            if (
              target instanceof Element &&
              (target.closest("a") ||
                target.closest('[data-hovermodal-close="true"]'))
            ) {
              setIsOpen(false)
            }
          }}
        >
          {modalContent}
        </div>
      </div>,
      document.body
    )
  }

  return (
    <div
      ref={modalRef}
      className={`fixed z-50 w-[350px] rounded-[12px] overflow-visible  ${className}`}
      style={{
        top: position.top,
        left: position.left,
      }}
      onClickCapture={(e) => {
        const target = e.target
        if (
          target instanceof Element &&
          (target.closest("a") ||
            target.closest('[data-hovermodal-close="true"]'))
        ) {
          setIsOpen(false)
        }
      }}
      onMouseEnter={handleModalMouseEnter}
      onMouseLeave={handleModalMouseLeave}
    >
      {modalContent}
    </div>
  )
}
