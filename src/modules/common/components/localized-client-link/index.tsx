"use client"

import { TransitionLink } from "@/components/transition-link"
import { useParams } from "next/navigation"
import React from "react"

/**
 * Use this component to create a Next.js `<Link />` that persists the current country code in the url,
 * without having to explicitly pass it as a prop.
 */
const LocalizedClientLink = ({
  children,
  href,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: () => void
  passHref?: true
  [x: string]: any
}) => {
  const { countryCode } = useParams()

  return (
    <TransitionLink href={`/${countryCode}${href}`} {...props}>
      {children}
    </TransitionLink>
  )
}

export default LocalizedClientLink
