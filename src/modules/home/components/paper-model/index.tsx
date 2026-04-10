"use client"

import { Canvas } from "@react-three/fiber"
import { Loader, OrbitControls } from "@react-three/drei"
import { Suspense, useState, useImperativeHandle, forwardRef } from "react"
import { Experience } from "./Experience"
import * as THREE from "three"

// Camera settings - easily adjust position and angle
const CAMERA_POSITION: [number, number, number] = [0.0, 0.0, 3.2]
const CAMERA_FOV = 50
const CAMERA_UP: [number, number, number] = [0, 1, 0]

// Navigation settings
const ENABLE_NAVIGATION = false // Set to false to disable mouse controls

export interface PaperSceneRef {
  setScrollProgress: (progress: number) => void;
  setBendAmount: (bend: number) => void;
}

interface PaperSceneProps {
  frontCover?: string;
  backCover?: string;
}

const PaperScene = forwardRef<PaperSceneRef, PaperSceneProps>(({ frontCover, backCover }, ref) => {
  const [cameraPosition, setCameraPosition] = useState(CAMERA_POSITION)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [bendAmount, setBendAmount] = useState(0)

  useImperativeHandle(ref, () => ({
    setScrollProgress: (progress: number) => {
      setScrollProgress(Math.max(0, Math.min(1, progress)))
    },
    setBendAmount: (bend: number) => {
      setBendAmount(bend)
    }
  }), [])

  return (
    <div className="relative w-full h-full">
      <Loader />
    
      <Canvas
        shadows="soft"
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1,
          outputColorSpace: THREE.SRGBColorSpace,
          powerPreference: "high-performance",
          alpha: true, // Enable transparency
        }}
        camera={{
          position: CAMERA_POSITION,
          fov: CAMERA_FOV,
          up: CAMERA_UP,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <group position-y={0}>
          <Suspense fallback={null}>
            <Experience currentState={0} scrollProgress={scrollProgress} bendAmount={bendAmount} frontCover={frontCover} backCover={backCover} />
          </Suspense>
        </group>
      
      </Canvas>
    </div>
  )
})

export default PaperScene
