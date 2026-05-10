"use client"

import { createContext, useContext, MutableRefObject, ReactNode } from "react"
import { useRouter } from "next/navigation"
import gsap from "gsap"

interface TransitionContextType {
  navigate: (href: string) => void
}

const TransitionContext = createContext<TransitionContextType | undefined>(
  undefined
)

export function TransitionProvider({
  children,
  curtainRef,
}: {
  children: ReactNode
  curtainRef: MutableRefObject<HTMLDivElement | null>
}) {
  const router = useRouter()

  const navigate = (href: string) => {
    const curtain = curtainRef.current
    if (!curtain) {
      router.push(href)
      return
    }

    gsap.fromTo(
      curtain,
      { y: "-100%" },
      {
        y: "0%",
        duration: 0.3,
        ease: "power3.in",
        onComplete: () => {
          router.push(href)
        },
      }
    )
  }

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
    </TransitionContext.Provider>
  )
}

export function useTransition() {
  const context = useContext(TransitionContext)
  if (!context) {
    throw new Error("useTransition must be used within TransitionProvider")
  }
  return context
}
