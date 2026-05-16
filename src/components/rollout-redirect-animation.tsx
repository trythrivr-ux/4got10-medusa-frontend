"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import gsap from "gsap"
import Image from "next/image"

interface RolloutRedirectAnimationProps {
  shouldRedirect: boolean
  targetPath: string
}

export default function RolloutRedirectAnimation({
  shouldRedirect,
  targetPath,
}: RolloutRedirectAnimationProps) {
  const router = useRouter()
  const curtainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!shouldRedirect || !curtainRef.current) return

    const curtain = curtainRef.current
    const tl = gsap.timeline({
      onComplete: () => {
        router.push(targetPath)
      },
    })

    // Animate curtain down
    tl.to(curtain, {
      y: "0%",
      duration: 0.6,
      ease: "power3.inOut",
    })

    return () => {
      tl.kill()
    }
  }, [shouldRedirect, targetPath, router])

  if (!shouldRedirect) return null

  return (
    <div
      ref={curtainRef}
      className="fixed inset-0 z-[9999] bg-[#ffffff] flex items-center justify-center"
      style={{ transform: "translateY(-100%)" }}
    >
      <div className="flex items-center gap-[20px]">
        <Image
          src="/menu-icons/4got10-2/group-1.svg"
          alt=""
          width={100}
          height={100}
          className="w-fit max-h-[44px]"
        />
        <Image
          src="/menu-icons/4got10-2/group-2.svg"
          alt=""
          width={100}
          height={100}
          className="w-fit max-h-[44px]"
        />
      </div>
    </div>
  )
}
