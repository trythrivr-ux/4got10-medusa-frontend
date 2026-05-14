"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Suspense, useRef, useMemo, useEffect, useState } from "react"
import * as THREE from "three"

const PAGE_WIDTH = 1.28
const PAGE_HEIGHT = 1.71
const PAGE_DEPTH = 0.003
const PAGE_SEGMENTS = 30
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS
const NUM_PAGES = 6

// Create page geometry with bones for page curl effect
const createPageGeometry = () => {
  const geometry = new THREE.BoxGeometry(
    PAGE_WIDTH,
    PAGE_HEIGHT,
    PAGE_DEPTH,
    PAGE_SEGMENTS,
    1,
    1
  )
  geometry.translate(PAGE_WIDTH / 2, 0, 0)

  const position = geometry.attributes.position
  const vertex = new THREE.Vector3()
  const skinIndexes: number[] = []
  const skinWeights: number[] = []

  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i)
    const x = vertex.x
    const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH))
    const skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH
    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0)
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0)
  }

  geometry.setAttribute(
    "skinIndex",
    new THREE.Uint16BufferAttribute(skinIndexes, 4)
  )
  geometry.setAttribute(
    "skinWeight",
    new THREE.Float32BufferAttribute(skinWeights, 4)
  )

  return geometry
}

interface Magazine3DProps {
  coverUrl?: string
  isHovered?: boolean
  productImages?: string[]
  coverBlobUrl?: string
  imageBlobUrls?: string[]
}

const Magazine3D = ({
  coverUrl,
  isHovered,
  productImages,
  coverBlobUrl,
  imageBlobUrls,
}: Magazine3DProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const pagesRef = useRef<THREE.Group[]>([])
  const rotationRef = useRef(0)

  // Create grain texture
  const grainTexture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext("2d")!

    ctx.fillStyle = "#808080"
    ctx.fillRect(0, 0, 512, 512)

    const imageData = ctx.getImageData(0, 0, 512, 512)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 30
      data[i] = Math.max(0, Math.min(255, data[i] + noise))
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
    }
    ctx.putImageData(imageData, 0, 0)

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 4)
    return texture
  }, [])

  // Create pages with textures
  const pages = useMemo(() => {
    return Array.from({ length: NUM_PAGES }, (_, i) => {
      let texturePath: string
      if (i === 0) {
        texturePath = coverBlobUrl || coverUrl || "/textures/left-page.jpg"
      } else if (i === NUM_PAGES - 1) {
        texturePath =
          imageBlobUrls?.[1] || productImages?.[1] || "/textures/right-page.jpg"
      } else {
        // Use product images for inner pages if available
        const imageIndex = i - 1
        texturePath =
          imageBlobUrls?.[imageIndex] ||
          productImages?.[imageIndex] ||
          `/textures/page-${i + 1}.jpg`
      }

      const material = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        roughness: 0.92,
        metalness: 0.0,
        envMapIntensity: 0.0,
        bumpMap: grainTexture,
        bumpScale: 0.012,
        color: new THREE.Color("#ffffff"),
      })

      const loader = new THREE.TextureLoader()
      if (
        texturePath.startsWith("http://") ||
        texturePath.startsWith("https://")
      ) {
        loader.setCrossOrigin("anonymous")
      }
      loader.load(
        texturePath,
        (loadedTexture) => {
          loadedTexture.colorSpace = THREE.SRGBColorSpace
          material.map = loadedTexture
          material.needsUpdate = true
        },
        undefined,
        (error) => {
          console.warn(`Failed to load texture: ${texturePath}`, error)
          const canvas = document.createElement("canvas")
          canvas.width = 512
          canvas.height = 512
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.fillStyle = "#ffffff"
            ctx.fillRect(0, 0, 512, 512)
            ctx.fillStyle = "#333333"
            ctx.font = "32px Arial"
            ctx.textAlign = "center"
            ctx.fillText("Cover Image", 256, 256)
          }
          const fallbackTexture = new THREE.CanvasTexture(canvas)
          fallbackTexture.colorSpace = THREE.SRGBColorSpace
          material.map = fallbackTexture
          material.needsUpdate = true
        }
      )

      const bones: THREE.Bone[] = []
      for (let j = 0; j <= PAGE_SEGMENTS; j++) {
        const bone = new THREE.Bone()
        bones.push(bone)
        if (j === 0) {
          bone.position.x = 0
        } else {
          bone.position.x = SEGMENT_WIDTH
        }
        if (j > 0) {
          bones[j - 1].add(bone)
        }
      }

      const skeleton = new THREE.Skeleton(bones)
      const geometry = createPageGeometry()

      const mesh = new THREE.SkinnedMesh(geometry, material)
      mesh.frustumCulled = false
      mesh.add(skeleton.bones[0])
      mesh.bind(skeleton)

      return { mesh, skeleton }
    })
  }, [coverUrl, grainTexture])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Rotate when hovered, otherwise animate back to 0
    if (isHovered) {
      rotationRef.current += delta * 0.5
      groupRef.current.rotation.y = rotationRef.current
    } else {
      rotationRef.current = THREE.MathUtils.damp(
        rotationRef.current,
        0,
        5,
        delta
      )
      groupRef.current.rotation.y = rotationRef.current
    }

    const bend = 0.15

    pages.forEach((page, index) => {
      const group = pagesRef.current[index]
      if (!group) return

      const bones = page.skeleton.bones
      const bendPerBone = bend * 0.025

      for (let i = 0; i < PAGE_SEGMENTS; i++) {
        bones[i].rotation.y = bendPerBone
      }
    })
  })

  return (
    <group
      ref={groupRef}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
      scale={[1.395, 1.395, 1.395]}
    >
      {pages.map((page, index) => {
        const gap = PAGE_DEPTH * 0.5
        const z = (NUM_PAGES - 1 - index) * gap
        return (
          <group
            key={index}
            ref={(el) => {
              if (el) pagesRef.current[index] = el
            }}
            position={[-PAGE_WIDTH / 2, 0, z]}
          >
            <primitive object={page.mesh} />
          </group>
        )
      })}
    </group>
  )
}

const Magazine3DPreview = ({
  coverUrl,
  isHovered,
  productImages,
  coverBlobUrl,
  imageBlobUrls,
}: Magazine3DProps) => {
  return (
    <div className="w-full h-full">
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.9,
          alpha: true,
        }}
        camera={{
          fov: 30,
          position: [0, 0, 6],
        }}
        style={{
          width: "100%",
          height: "100%",
          touchAction: "none",
          pointerEvents: "none",
        }}
      >
        <Suspense fallback={null}>
          <directionalLight
            position={[5, 5, 5]}
            intensity={2.5}
            color="#fff8f0"
          />
          <directionalLight
            position={[-4, 3, 2]}
            intensity={1.0}
            color="#e8f0ff"
          />
          <ambientLight intensity={2.0} color="#ffffff" />
          <Magazine3D
            coverUrl={coverUrl}
            isHovered={isHovered}
            productImages={productImages}
            coverBlobUrl={coverBlobUrl}
            imageBlobUrls={imageBlobUrls}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default Magazine3DPreview
