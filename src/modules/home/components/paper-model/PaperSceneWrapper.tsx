"use client"

import dynamic from "next/dynamic"
import { forwardRef, type ForwardedRef } from "react"
import type { PaperSceneRef } from "./index"

interface PaperSceneWrapperProps {
  frontCover?: string;
  backCover?: string;
}

const PaperScene = dynamic(() => import("./index"), {
  ssr: false,
})

const PaperSceneWrapper = forwardRef<PaperSceneRef, PaperSceneWrapperProps>(({ frontCover, backCover }, ref) => {
  return <PaperScene ref={ref} frontCover={frontCover} backCover={backCover} />
})

export default PaperSceneWrapper
