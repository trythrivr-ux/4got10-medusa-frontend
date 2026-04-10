"use client"

import { Canvas } from "@react-three/fiber"
import { Suspense, useRef, useMemo, useEffect } from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"

const PAGE_WIDTH = 1.28
const PAGE_HEIGHT = 1.71
const PAGE_DEPTH = 0.003
const PAGE_SEGMENTS = 30
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS
const NUM_PAGES = 20

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

  geometry.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(skinIndexes, 4))
  geometry.setAttribute("skinWeight", new THREE.Float32BufferAttribute(skinWeights, 4))

  return geometry
}

interface MagazinePagesProps {
  frontCover?: string
  backCover?: string
}

const MagazinePages = ({ frontCover, backCover }: MagazinePagesProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const pagesRef = useRef<THREE.Group[]>([])
  const dampedBendRef = useRef(0)

  // Create pages with textures
  const pages = useMemo(() => {
    return Array.from({ length: NUM_PAGES }, (_, i) => {
      let texturePath: string
      if (i === 0) {
        texturePath = frontCover || '/textures/left-page.jpg'
      } else if (i === NUM_PAGES - 1) {
        texturePath = backCover || '/textures/right-page.jpg'
      } else {
        texturePath = `/textures/page-${i + 1}.jpg`
      }

      const material = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        roughness: 0.8,
        metalness: 0.0,
        envMapIntensity: 0.1,
      })

      // Use proxy for external URLs
      const proxyUrl = texturePath.startsWith('http')
        ? `/api/image-proxy?url=${encodeURIComponent(texturePath)}`
        : texturePath

      const loader = new THREE.TextureLoader()
      const texture = loader.load(proxyUrl, () => {
        texture.colorSpace = THREE.SRGBColorSpace
        material.map = texture
        material.needsUpdate = true
      })

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
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.frustumCulled = false
      mesh.add(skeleton.bones[0])
      mesh.bind(skeleton)

      return { mesh, skeleton }
    })
  }, [frontCover, backCover])

  // Animation frame - only rotation, fixed bend and flip state
  useFrame((state) => {
    if (!groupRef.current) return

    const elapsed = state.clock.elapsedTime
    
    // Slow rotation only
    groupRef.current.rotation.y = elapsed * 0.3
    
    // Slight tilt on vertical axis
    groupRef.current.rotation.x = -0.15
    
    // Fixed bend amount - magazine stays bent open
    const bend = 0.5
    dampedBendRef.current = bend

    // Fixed page flip progress - slightly open
    const flipProgress = 0.005

    // Per-page window size
    const pageWindowSize = (idx: number) => {
      const center = (NUM_PAGES - 1) / 2
      const dist = Math.abs(idx - center) / center
      return 1.5 + dist * 2.5
    }

    let totalWeight = 0
    for (let i = 0; i < NUM_PAGES; i++) totalWeight += pageWindowSize(i)

    pages.forEach((page, index) => {
      const group = pagesRef.current[index]
      if (!group) return

      // Sequential flip timing
      let pageStart = 0
      for (let i = 0; i < index; i++) pageStart += pageWindowSize(i) / totalWeight
      const pageRange = pageWindowSize(index) / totalWeight

      const rawT = Math.max(0, Math.min(1, (flipProgress - pageStart) / pageRange))
      const pageT = 0.5 * (1 - Math.cos(Math.PI * rawT))

      // Rotation
      group.rotation.y = -pageT * Math.PI

      // Z-stacking
      const gap = PAGE_DEPTH * 0.5
      const unflippedZ = (NUM_PAGES - 1 - index) * gap
      const flippedZ = index * gap
      group.position.z = THREE.MathUtils.lerp(unflippedZ, flippedZ, pageT)

      // Bone bending - fixed curl
      const bones = page.skeleton.bones
      const midFlip = Math.sin(pageT * Math.PI)
      const bendIntensity = midFlip * 0.05

      for (let i = 0; i < PAGE_SEGMENTS; i++) {
        const segmentProgress = i / PAGE_SEGMENTS
        const curlY = Math.sin(segmentProgress * Math.PI * 0.7) * bendIntensity
        const droop = segmentProgress * segmentProgress * midFlip * 0.04
        const bendPerBone = dampedBendRef.current * 0.025

        bones[i].rotation.y = curlY + bendPerBone
        bones[i].rotation.z = droop
      }
    })
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
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

interface Magazine3DViewerProps {
  frontCover?: string
  backCover?: string
}

const Magazine3DViewer = ({ frontCover, backCover }: Magazine3DViewerProps) => {
  return (
    <div className="w-full h-full bg-[#0000000]">
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          outputColorSpace: THREE.SRGBColorSpace,
          alpha: true,
        }}
        camera={{
          position: [0, 0, 3.2],
          fov: 50,
          up: [0, 1, 0],
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <MagazinePages frontCover={frontCover} backCover={backCover} />
        </Suspense>
        
        {/* Dimmer lighting for softer look */}
        <ambientLight intensity={0.6} color="#ffffff" />
        <pointLight
          position={[0, 0, 4]}
          intensity={60}
          color="#ffffff"
          distance={10}
        />
        <pointLight
          position={[3, 0, 2]}
          intensity={30}
          color="#ffffff"
          distance={10}
        />
        <pointLight
          position={[-3, 0, 2]}
          intensity={30}
          color="#ffffff"
          distance={10}
        />
      </Canvas>
    </div>
  )
}

export default Magazine3DViewer
