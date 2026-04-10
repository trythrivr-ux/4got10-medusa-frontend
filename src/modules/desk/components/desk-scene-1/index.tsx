"use client"

import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { Suspense, useRef, useMemo, useState, useEffect } from "react"
import * as THREE from "three"
import { OrbitControls } from "@react-three/drei"

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

interface DeskMagazineProps {
  frontCover?: string
  backCover?: string
}

const DeskMagazine = ({ frontCover, backCover }: DeskMagazineProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const pagesRef = useRef<THREE.Group[]>([])
  const dampedBendRef = useRef(0)

  // Create pages with textures
  const pages = useMemo(() => {
    return Array.from({ length: NUM_PAGES }, (_, i) => {
      let texturePath: string
      if (i === 0) {
        texturePath = frontCover || "/textures/left-page.jpg"
      } else if (i === NUM_PAGES - 1) {
        texturePath = backCover || "/textures/right-page.jpg"
      } else {
        texturePath = `/textures/page-${i + 1}.jpg`
      }

      const material = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        roughness: 0.8,
        metalness: 0.0,
        envMapIntensity: 0.1,
      })

      const loader = new THREE.TextureLoader()
      const texture = loader.load(texturePath, () => {
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

  // Animation - magazine laying flat with slight bend
  useFrame((state) => {
    if (!groupRef.current) return

    const elapsed = state.clock.elapsedTime

    // Fixed bend amount - magazine stays slightly bent open
    const bend = 0.3
    dampedBendRef.current = bend

    // Fixed page flip progress - slightly open
    const flipProgress = 0.003

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
      for (let i = 0; i < index; i++)
        pageStart += pageWindowSize(i) / totalWeight
      const pageRange = pageWindowSize(index) / totalWeight

      const rawT = Math.max(
        0,
        Math.min(1, (flipProgress - pageStart) / pageRange)
      )
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
    <group
      ref={groupRef}
      position={[0, 0.1, 0]}
      rotation={[-Math.PI / 2, 0, 0]} // Lay flat on desk
      scale={[1, 1, 1]}
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

// Interactive plane that responds to mouse
interface InteractivePlaneProps {
  initialPosition: [number, number, number]
  size: [number, number]
  color: string
  mousePosition: React.MutableRefObject<THREE.Vector3>
}

const InteractivePlane = ({
  initialPosition,
  size,
  color,
  mousePosition,
}: InteractivePlaneProps) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const velocityRef = useRef(new THREE.Vector3())
  const targetPositionRef = useRef(new THREE.Vector3(...initialPosition))

  useFrame(() => {
    if (!meshRef.current) return

    const mesh = meshRef.current
    const mousePos = mousePosition.current

    // Calculate distance to mouse
    const distance = mesh.position.distanceTo(mousePos)
    const pushRadius = 1.5
    const pushStrength = 0.8

    if (distance < pushRadius) {
      // Push away from mouse
      const direction = new THREE.Vector3()
        .subVectors(mesh.position, mousePos)
        .normalize()
      const pushForce = (1 - distance / pushRadius) * pushStrength
      velocityRef.current.add(direction.multiplyScalar(pushForce))
    }

    // Spring back to initial position
    const toInitial = new THREE.Vector3().subVectors(
      new THREE.Vector3(...initialPosition),
      mesh.position
    )
    velocityRef.current.add(toInitial.multiplyScalar(0.05))

    // Apply damping
    velocityRef.current.multiplyScalar(0.85)

    // Update position
    mesh.position.add(velocityRef.current)

    // Slight rotation based on velocity
    mesh.rotation.z = velocityRef.current.x * 0.3
    mesh.rotation.x = -velocityRef.current.y * 0.3
  })

  return (
    <mesh
      ref={meshRef}
      position={initialPosition}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={0.6}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// All interactive planes
const InteractivePlanes = ({
  mousePosition,
}: {
  mousePosition: React.MutableRefObject<THREE.Vector3>
}) => {
  const planes = useMemo(() => {
    const items: {
      position: [number, number, number]
      size: [number, number]
      color: string
    }[] = []

    // Generate planes around the magazine
    const colors = [
      "#e8e8e8",
      "#d4d4d4",
      "#c8c8c8",
      "#bcbcbc",
      "#b0b0b0",
      "#a4a4a4",
    ]

    // Create a grid of planes around the center
    for (let x = -4; x <= 4; x++) {
      for (let z = -4; z <= 4; z++) {
        // Skip center area where magazine is
        if (Math.abs(x) <= 1 && Math.abs(z) <= 1) continue

        const posX = x * 0.8 + (Math.random() - 0.5) * 0.3
        const posZ = z * 0.8 + (Math.random() - 0.5) * 0.3
        const sizeX = 0.3 + Math.random() * 0.4
        const sizeZ = 0.3 + Math.random() * 0.4
        const color = colors[Math.floor(Math.random() * colors.length)]

        items.push({
          position: [posX, 0.01, posZ],
          size: [sizeX, sizeZ],
          color,
        })
      }
    }

    return items
  }, [])

  return (
    <>
      {planes.map((plane, index) => (
        <InteractivePlane
          key={index}
          initialPosition={plane.position}
          size={plane.size}
          color={plane.color}
          mousePosition={mousePosition}
        />
      ))}
    </>
  )
}

// Mouse tracker component
const MouseTracker = ({
  mousePosition,
}: {
  mousePosition: React.MutableRefObject<THREE.Vector3>
}) => {
  const { camera, gl } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.current.setFromCamera(new THREE.Vector2(x, y), camera)
      const intersectPoint = new THREE.Vector3()
      raycaster.current.ray.intersectPlane(plane.current, intersectPoint)

      if (intersectPoint) {
        mousePosition.current.copy(intersectPoint)
      }
    }

    gl.domElement.addEventListener("mousemove", handleMouseMove)
    return () => gl.domElement.removeEventListener("mousemove", handleMouseMove)
  }, [camera, gl, mousePosition])

  return null
}

const DeskScene1 = () => {
  const mousePosition = useRef(new THREE.Vector3())
  return (
    <div className="w-full h-full bg-transparent">
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          outputColorSpace: THREE.SRGBColorSpace,
          alpha: true,
        }}
        camera={{
          position: [0, 5, 3],
          fov: 50,
          up: [0, 1, 0],
        }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <Suspense fallback={null}>
          {/* Mouse tracker */}
          <MouseTracker mousePosition={mousePosition} />

          {/* Interactive planes around magazine */}
          <InteractivePlanes mousePosition={mousePosition} />

          {/* Magazine laying on desk - stays stationary */}
          <DeskMagazine />

          {/* Lighting */}
          <ambientLight intensity={0.4} color="#ffffff" />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.5}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-5}
            shadow-camera-right={5}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
          />
          <directionalLight
            position={[-3, 6, -3]}
            intensity={0.8}
            color="#b3d9ff"
          />
          <pointLight position={[0, 3, 0]} intensity={0.5} color="#ffffff" />

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
            maxPolarAngle={Math.PI / 2 - 0.1} // Prevent camera from going below desk
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default DeskScene1
