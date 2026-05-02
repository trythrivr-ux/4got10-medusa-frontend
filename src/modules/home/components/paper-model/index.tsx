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
  setScrollProgress: (progress: number) => void
  setBendAmount: (bend: number) => void
  setOnSceneReady?: (callback: () => void) => void
}

interface PaperSceneProps {
  frontCover?: string
  backCover?: string
}

const PaperScene = forwardRef<PaperSceneRef, PaperSceneProps>(
  ({ frontCover, backCover }, ref) => {
    const [cameraPosition, setCameraPosition] = useState(CAMERA_POSITION)
    const [scrollProgress, setScrollProgress] = useState(0)
    const [bendAmount, setBendAmount] = useState(0)
    const [onSceneReady, setOnSceneReady] = useState<(() => void) | undefined>()

    useImperativeHandle(
      ref,
      () => ({
        setScrollProgress: (progress: number) => {
          setScrollProgress(Math.max(0, Math.min(1, progress)))
        },
        setBendAmount: (bend: number) => {
          setBendAmount(bend)
        },
        setOnSceneReady: (callback: () => void) => {
          setOnSceneReady(() => callback)
        },
      }),
      []
    )

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
          style={{
            width: "100%",
            height: "100%",
            touchAction: "none",
            pointerEvents: "none",
          }}
          // Completely disable React Three Fiber event system
          eventSource={undefined}
          events={undefined}
          // Disable all default interactions
          onCreated={({ gl }) => {
            // Disable wheel events
            gl.domElement.addEventListener("wheel", (e) => e.preventDefault(), {
              passive: false,
            })
            gl.domElement.addEventListener(
              "touchstart",
              (e) => e.preventDefault(),
              { passive: false }
            )
            gl.domElement.addEventListener(
              "touchmove",
              (e) => e.preventDefault(),
              { passive: false }
            )
            gl.domElement.addEventListener(
              "touchend",
              (e) => e.preventDefault(),
              { passive: false }
            )
            gl.domElement.addEventListener(
              "mousedown",
              (e) => e.preventDefault(),
              { passive: false }
            )
            gl.domElement.addEventListener(
              "mousemove",
              (e) => e.preventDefault(),
              { passive: false }
            )
            gl.domElement.addEventListener(
              "mouseup",
              (e) => e.preventDefault(),
              { passive: false }
            )
            gl.domElement.addEventListener(
              "contextmenu",
              (e) => e.preventDefault(),
              { passive: false }
            )
            gl.domElement.addEventListener(
              "dblclick",
              (e) => e.preventDefault(),
              { passive: false }
            )
            // Disable zoom and pinch
            gl.domElement.addEventListener(
              "gesturestart",
              (e) => e.preventDefault(),
              { passive: false }
            )
            gl.domElement.addEventListener(
              "gesturechange",
              (e) => e.preventDefault(),
              { passive: false }
            )
            gl.domElement.addEventListener(
              "gestureend",
              (e) => e.preventDefault(),
              { passive: false }
            )
          }}
          // Override default event handling
          onPointerMissed={() => {}}
          onPointerDown={() => {}}
          onPointerUp={() => {}}
          onPointerMove={() => {}}
          onPointerOver={() => {}}
          onPointerOut={() => {}}
          onClick={() => {}}
          onDoubleClick={() => {}}
          onContextMenu={() => {}}
          onWheel={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
        >
          <group position-y={0}>
            <Suspense fallback={null}>
              <Experience
                currentState={0}
                scrollProgress={scrollProgress}
                bendAmount={bendAmount}
                frontCover={frontCover}
                backCover={backCover}
                onSceneReady={onSceneReady}
              />
            </Suspense>
          </group>
        </Canvas>
      </div>
    )
  }
)

export default PaperScene
