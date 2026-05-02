"use client"

import React from "react"
import clsx from "clsx"

type GradientBlurProps = {
  classes?: string
}

export default function GradientBlurOverlay({ classes }: GradientBlurProps) {
  const classList = clsx("gradient-blur", classes)

  return (
    <div className={classList} style={{ zIndex: 50 }}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}
