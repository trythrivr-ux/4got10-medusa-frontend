"use client"

import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { Suspense, useRef, useMemo, useState, useEffect } from "react"
import * as THREE from "three"
import { OrbitControls, Environment, useTexture } from "@react-three/drei"

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

  // Create grain texture
  const grainTexture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext("2d")!

    // Fill with mid-grey
    ctx.fillStyle = "#808080"
    ctx.fillRect(0, 0, 512, 512)

    // Add noise
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
        texturePath = frontCover || "/textures/left-page.jpg"
      } else if (i === NUM_PAGES - 1) {
        texturePath = backCover || "/textures/right-page.jpg"
      } else {
        texturePath = `/textures/page-${i + 1}.jpg`
      }

      const material = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        roughness: 0.6,
        metalness: 0.8,
        envMapIntensity: 0.3,
        bumpMap: grainTexture,
        bumpScale: 0.02,
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
  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Continuous spin around world Y-axis (fixed vertical axis, regardless of tilt)
    groupRef.current.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), delta * 0.3)

    // Fixed bend amount - magazine stays slightly bent open
    const bend = 0.05
    dampedBendRef.current = bend

    // Fixed page flip progress - more open, one side lifted up
    const flipProgress = 0.008

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
      position={[0, 1.5, 0]} // Higher up on display pedestal
      rotation={[-Math.PI / -1.09, 3.8, 3]} // Lay flat
      scale={[1.2, 1.2, 1.2]}
      castShadow
      receiveShadow
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

// Interactive plane that responds to mouse like being pushed by hand
interface InteractivePlaneProps {
  initialPosition: [number, number, number]
  size: [number, number]
  color: string
  rotation: number
  mousePosition: React.MutableRefObject<THREE.Vector3>
  mouseVelocity: React.MutableRefObject<THREE.Vector3>
}

const InteractivePlane = ({
  initialPosition,
  size,
  color,
  rotation,
  mousePosition,
  mouseVelocity,
}: InteractivePlaneProps) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const velocityRef = useRef(new THREE.Vector3())

  useFrame(() => {
    if (!meshRef.current) return

    const mesh = meshRef.current
    const mousePos = mousePosition.current
    const mouseVel = mouseVelocity.current

    // Calculate distance to mouse
    const distance = mesh.position.distanceTo(mousePos)
    const pushRadius = 0.3 // Very small - only when directly over

    if (distance < pushRadius) {
      // Push in the direction of mouse movement (like a hand sweeping)
      const pushStrength = (1 - distance / pushRadius) * 0.15 // Much less force

      // Add mouse velocity to plane velocity (hand push effect)
      velocityRef.current.x += mouseVel.x * pushStrength
      velocityRef.current.z += mouseVel.z * pushStrength

      // Also add some perpendicular push based on proximity
      const toPlane = new THREE.Vector3()
        .subVectors(mesh.position, mousePos)
        .normalize()
      velocityRef.current.add(toPlane.multiplyScalar(pushStrength * 0.1))
    }

    // Apply friction (slows down over time like paper on desk)
    velocityRef.current.multiplyScalar(0.92)

    // Update position
    mesh.position.add(velocityRef.current)

    // Lock Y position - planes always stay flat on table
    mesh.position.y = 0.01

    // Boundary constraints - keep inside a 4x4 box
    const boundarySize = 2
    mesh.position.x = Math.max(
      -boundarySize,
      Math.min(boundarySize, mesh.position.x)
    )
    mesh.position.z = Math.max(
      -boundarySize,
      Math.min(boundarySize, mesh.position.z)
    )

    // Slight tilt based on velocity (on top of flat rotation)
    // Base rotation is flat, we just add small wobble
    mesh.rotation.x = -Math.PI / 2 + velocityRef.current.z * 0.1
    mesh.rotation.z = velocityRef.current.x * 0.1
  })

  return (
    <mesh
      ref={meshRef}
      position={initialPosition}
      rotation={[-Math.PI / 2, 0, rotation]}
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
  mouseVelocity,
}: {
  mousePosition: React.MutableRefObject<THREE.Vector3>
  mouseVelocity: React.MutableRefObject<THREE.Vector3>
}) => {
  const planes = useMemo(() => {
    const items: {
      position: [number, number, number]
      size: [number, number]
      color: string
      rotation: number
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

    // Magazine dimensions for collision check
    const magazineWidth = 1.28
    const magazineHeight = 1.71

    // Create fewer planes scattered randomly
    const numPlanes = 15
    const boundarySize = 1.8

    for (let i = 0; i < numPlanes; i++) {
      let posX: number, posZ: number
      let attempts = 0

      // Find position not under magazine
      do {
        posX = (Math.random() - 0.5) * boundarySize * 2
        posZ = (Math.random() - 0.5) * boundarySize * 2
        attempts++
      } while (
        // Check if position is under magazine (smaller exclusion zone)
        Math.abs(posX) < magazineWidth * 0.4 &&
        Math.abs(posZ) < magazineHeight * 0.4 &&
        attempts < 50
      )

      const sizeX = 0.2 + Math.random() * 0.5
      const sizeZ = 0.2 + Math.random() * 0.5
      const color = colors[Math.floor(Math.random() * colors.length)]
      const rotation = Math.random() * Math.PI * 2 // Random Y rotation

      items.push({
        position: [posX, 0.01, posZ],
        size: [sizeX, sizeZ],
        color,
        rotation,
      })
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
          rotation={plane.rotation}
          mousePosition={mousePosition}
          mouseVelocity={mouseVelocity}
        />
      ))}
    </>
  )
}

// Mouse tracker component - tracks position AND velocity
const MouseTracker = ({
  mousePosition,
  mouseVelocity,
}: {
  mousePosition: React.MutableRefObject<THREE.Vector3>
  mouseVelocity: React.MutableRefObject<THREE.Vector3>
}) => {
  const { camera, gl } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const lastPosition = useRef(new THREE.Vector3())

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.current.setFromCamera(new THREE.Vector2(x, y), camera)
      const intersectPoint = new THREE.Vector3()
      raycaster.current.ray.intersectPlane(plane.current, intersectPoint)

      if (intersectPoint) {
        // Calculate velocity (difference between current and last position)
        mouseVelocity.current.subVectors(intersectPoint, lastPosition.current)

        // Update position
        mousePosition.current.copy(intersectPoint)
        lastPosition.current.copy(intersectPoint)
      }
    }

    gl.domElement.addEventListener("mousemove", handleMouseMove)
    return () => gl.domElement.removeEventListener("mousemove", handleMouseMove)
  }, [camera, gl, mousePosition, mouseVelocity])

  return null
}

// Image scene component - displays a real photograph as the environment
const ImageScene = ({ imageUrl }: { imageUrl: string }) => {
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const tex = loader.load(imageUrl)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [imageUrl])

  return (
    <mesh position={[0, 0, -2]} rotation={[0, 0, 0]}>
      <planeGeometry args={[16, 9]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  )
}

// Surface plane for the magazine to sit on
const SurfacePlane = () => {
  return (
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[6, 6]} />
      <meshStandardMaterial
        color="#c0c0c0"
        roughness={0.8}
        metalness={0.1}
        transparent
        opacity={0.0}
      />
    </mesh>
  )
}

// Load concrete textures - shared across components
const useConcreteTextures = () => {
  const [textures, setTextures] = useState<{
    diffuse: THREE.Texture | null
    normal: THREE.Texture | null
    aoRoughMetal: THREE.Texture | null
  }>({
    diffuse: null,
    normal: null,
    aoRoughMetal: null,
  })

  useEffect(() => {
    const loader = new THREE.TextureLoader()

    const loadTexture = (path: string, repeat: number = 4) => {
      return new Promise<THREE.Texture>((resolve) => {
        loader.load(path, (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace
          texture.wrapS = THREE.RepeatWrapping
          texture.wrapT = THREE.RepeatWrapping
          texture.repeat.set(repeat, repeat)
          resolve(texture)
        })
      })
    }

    Promise.all([
      loadTexture("/textures/concrete_diffuse.jpg", 4),
      loadTexture("/textures/concrete_normal.jpg", 4),
      loadTexture("/textures/concrete_ao_rough_metal.jpg", 4),
    ]).then(([diffuse, normal, aoRoughMetal]) => {
      setTextures({ diffuse, normal, aoRoughMetal })
    })
  }, [])

  return textures
}

// Concrete floor with realistic textures
const ConcreteFloor = () => {
  const textures = useConcreteTextures()

  if (!textures.diffuse || !textures.normal || !textures.aoRoughMetal) {
    return (
      <mesh
        position={[0, -0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#808080" roughness={0.9} />
      </mesh>
    )
  }

  return (
    <mesh
      position={[0, -0.01, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial
        map={textures.diffuse}
        normalMap={textures.normal}
        aoMap={textures.aoRoughMetal}
        roughnessMap={textures.aoRoughMetal}
        metalness={0}
        aoMapIntensity={1}
        normalScale={new THREE.Vector2(1, 1)}
        roughness={1}
      />
    </mesh>
  )
}

// Ground plane that receives shadows
const GroundPlane = () => {
  return (
    <mesh
      position={[0, -0.01, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[500, 30]} />
      <shadowMaterial opacity={0.6} />
    </mesh>
  )
}

// Photography Studio Backdrop with infinity curve
const StudioBackdrop = () => {
  return (
    <>
      {/* Infinity curve backdrop - curved wall that seamlessly blends floor to wall */}
      <mesh position={[0, 3, -4]} receiveShadow>
        <meshStandardMaterial
          color="#e8e8e8"
          roughness={0.9}
          metalness={0.0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floor surface - temporarily disabled for shadow testing */}
      {/* <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[36, 36]} />
        <meshStandardMaterial
          color="#f0f0f0"
          roughness={0.95}
          metalness={0.0}
        />
      </mesh> */}
    </>
  )
}

// Custom high-quality shadow mesh for the magazine
const MagazineShadow = () => {
  // Create gradient texture for soft shadow edges
  const shadowTexture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext("2d")!

    // Create radial gradient for soft edges
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.4)")
    gradient.addColorStop(0.5, "rgba(0, 0, 0, 0.2)")
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.needsUpdate = true
    return texture
  }, [])

  return (
    <mesh
      position={[0.1, 0.001, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[1.5, 2]} />
      <meshBasicMaterial
        map={shadowTexture}
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </mesh>
  )
}

// Display pedestal for the magazine - with concrete texture
const DisplayPedestalWithTexture = () => {
  const diffuseMap = useTexture("/textures/concrete_diffuse.jpg")
  const normalMap = useTexture("/textures/concrete_normal.jpg")
  const aoRoughMetalMap = useTexture("/textures/concrete_ao_rough_metal.jpg")

  // Create 3D noise texture with smooth edges
  const macroBump = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext("2d")!

    // Fill with base grey
    ctx.fillStyle = "#808080"
    ctx.fillRect(0, 0, 1024, 1024)

    const imageData = ctx.getImageData(0, 0, 1024, 1024)
    const data = imageData.data

    // Edge falloff distance (in UV space 0-1)
    const edgeFade = 0.15

    // Create noise pattern with smooth edges
    for (let y = 0; y < 1024; y++) {
      for (let x = 0; x < 1024; x++) {
        const i = (y * 1024 + x) * 4

        // Normalized coordinates 0-1
        const u = x / 1024
        const v = y / 1024

        // Calculate edge distance and fade
        const edgeDistU = Math.min(u, 1 - u)
        const edgeDistV = Math.min(v, 1 - v)
        const edgeDist = Math.min(edgeDistU, edgeDistV)

        // Smooth falloff near edges
        const edgeFadeFactor =
          edgeDist < edgeFade ? Math.pow(edgeDist / edgeFade, 2) : 1

        // Multi-scale noise for organic look
        const scale1 = 0.01
        const scale2 = 0.03
        const scale3 = 0.005

        const noise1 = Math.sin(x * scale1) * Math.cos(y * scale1) * 40
        const noise2 = Math.sin(x * scale2 + y * scale2) * 30
        const noise3 = Math.cos(x * scale3 - y * scale3 * 0.5) * 50
        const random = (Math.random() - 0.5) * 20

        // Apply edge fade to noise
        const totalNoise = (noise1 + noise2 + noise3 + random) * edgeFadeFactor

        data[i] = 128 + totalNoise
        data[i + 1] = 128 + totalNoise
        data[i + 2] = 128 + totalNoise
      }
    }
    ctx.putImageData(imageData, 0, 0)

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(1, 1)
    return tex
  }, [])

  // Create fine detail noise for secondary bumps
  const fineNoise = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext("2d")!

    ctx.fillStyle = "#808080"
    ctx.fillRect(0, 0, 256, 256)

    const imageData = ctx.getImageData(0, 0, 256, 256)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      // Multi-octave noise for more detail
      const noise1 = (Math.random() - 0.5) * 60
      const noise2 = (Math.random() - 0.5) * 30
      data[i] += noise1 + noise2
      data[i + 1] += noise1 + noise2
      data[i + 2] += noise1 + noise2
    }
    ctx.putImageData(imageData, 0, 0)

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(4, 4) // Higher frequency detail
    return tex
  }, [])

  // Configure texture wrapping - PBR correct setup
  useMemo(() => {
    // Random UV offset to avoid centered repetition
    const offsetX = Math.random() * 0.5
    const offsetY = Math.random() * 0.5

    // Diffuse/albedo uses sRGB color space
    diffuseMap.colorSpace = THREE.SRGBColorSpace
    diffuseMap.wrapS = THREE.RepeatWrapping
    diffuseMap.wrapT = THREE.RepeatWrapping
    diffuseMap.repeat.set(0.19, 0.19) // Much larger texture scale
    diffuseMap.offset.set(offsetX, offsetY)

    // Normal map - linear, no color space conversion
    normalMap.colorSpace = THREE.NoColorSpace
    normalMap.wrapS = THREE.RepeatWrapping
    normalMap.wrapT = THREE.RepeatWrapping
    normalMap.repeat.set(0.19, 0.19)
    normalMap.offset.set(offsetX, offsetY)

    // AO/Rough/Metal - linear, no color space conversion
    aoRoughMetalMap.colorSpace = THREE.NoColorSpace
    aoRoughMetalMap.wrapS = THREE.RepeatWrapping
    aoRoughMetalMap.wrapT = THREE.RepeatWrapping
    aoRoughMetalMap.repeat.set(0.19, 0.19)
    aoRoughMetalMap.offset.set(offsetX, offsetY)
  }, [diffuseMap, normalMap, aoRoughMetalMap])

  // Create box geometry with subdivisions for displacement and UV2 for AO
  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(2, 0.9, 2, 80, 30, 80) // Taller pedestal
    geo.setAttribute(
      "uv2",
      new THREE.BufferAttribute(geo.attributes.uv.array, 2)
    )
    geo.computeTangents()
    return geo
  }, [])

  return (
    <group position={[0, -0.4, 0]}>
      {/* Main concrete pedestal */}
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          map={diffuseMap}
          normalMap={normalMap}
          bumpMap={macroBump}
          bumpScale={0.15}
          aoMap={aoRoughMetalMap}
          roughnessMap={aoRoughMetalMap}
          metalness={0}
          aoMapIntensity={3}
          normalScale={new THREE.Vector2(4, 4)}
          roughness={1}
        />
      </mesh>

      {/* Gradient overlay at bottom - cylinder with side gradient transparency */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[2.25, 2.25, 3, 64, 1, true]} />
        <shaderMaterial
          transparent
          vertexShader={`
            varying vec2 vUv;
            varying vec3 vPosition;
            void main() {
              vUv = uv;
              vPosition = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec2 vUv;
            varying vec3 vPosition;
            void main() {
              // Use local position Y for gradient (normalized to cylinder height)
              float height = 1.5;
              float normalizedY = (vPosition.y + height * 0.5) / height;
              float gradient = smoothstep(0.0, 1.0, normalizedY);
              vec3 bgColor = vec3(0.937, 0.937, 0.937); // #EFEFEF
              gl_FragColor = vec4(bgColor, 1.0 - gradient);
            }
          `}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// Display pedestal wrapper with fallback
const DisplayPedestal = () => {
  return (
    <Suspense
      fallback={
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 0.5, 3]} />
          <meshStandardMaterial color="#808080" roughness={0.9} />
        </mesh>
      }
    >
      <DisplayPedestalWithTexture />
    </Suspense>
  )
}

// SpotLight Helper component - attaches helper to existing spotlight
const SpotLightHelperComponent = ({
  light,
  color = "#ff0000",
}: {
  light: THREE.SpotLight
  color?: string
}) => {
  const helperRef = useRef<THREE.SpotLightHelper | undefined>(undefined)
  const scene = useThree((state) => state.scene)

  useEffect(() => {
    if (!helperRef.current) {
      helperRef.current = new THREE.SpotLightHelper(light, color)
      scene.add(helperRef.current)
    }
    return () => {
      if (helperRef.current) {
        scene.remove(helperRef.current)
        helperRef.current.dispose()
        helperRef.current = undefined
      }
    }
  }, [light, color, scene])

  useFrame(() => {
    if (helperRef.current) {
      helperRef.current.update()
    }
  })

  return null
}

// Volumetric Light using custom shader for realistic light shafts
const VolumetricLight = () => {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLightPosition: { value: new THREE.Vector3(3, 8, 2) },
      uLightColor: { value: new THREE.Color("#fff8dc") },
      uIntensity: { value: 0.8 },
      uDensity: { value: 0.5 },
      uDecay: { value: 0.95 },
    }),
    []
  )

  const vertexShader = `
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vViewPosition = (viewMatrix * worldPosition).xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `

  const fragmentShader = `
    uniform vec3 uLightPosition;
    uniform vec3 uLightColor;
    uniform float uIntensity;
    uniform float uDensity;
    uniform float uDecay;
    
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    
    // Simplex noise function for dust particles
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    void main() {
      vec3 rayOrigin = vWorldPosition;
      vec3 rayDir = normalize(uLightPosition - rayOrigin);
      
      // Distance to light
      float distToLight = length(uLightPosition - rayOrigin);
      
      // Create volumetric light cone
      vec3 toLight = normalize(uLightPosition - rayOrigin);
      float spotAngle = dot(toLight, vec3(0.0, -1.0, 0.0));
      
      // Cone attenuation
      float coneAngle = 0.3; // ~17 degrees
      float coneAttenuation = smoothstep(coneAngle, coneAngle * 0.5, acos(spotAngle));
      
      // Distance attenuation
      float distAttenuation = 1.0 / (1.0 + distToLight * 0.1 + distToLight * distToLight * 0.01);
      
      // Add dust/noise for realistic volumetric effect
      float noise = snoise(rayOrigin * 0.5) * 0.5 + 0.5;
      noise += snoise(rayOrigin * 1.0) * 0.25;
      noise += snoise(rayOrigin * 2.0) * 0.125;
      
      // Combine effects
      float volumetricIntensity = coneAttenuation * distAttenuation * noise * uIntensity;
      
      // Soft edges
      float fresnel = 1.0 - abs(dot(normalize(vViewPosition), vec3(0.0, 0.0, 1.0)));
      volumetricIntensity *= fresnel;
      
      vec3 color = uLightColor * volumetricIntensity;
      
      gl_FragColor = vec4(color, volumetricIntensity * 0.5);
    }
  `

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh ref={meshRef} position={[1, 4, 0]}>
      <coneGeometry args={[2, 8, 32, 1, true]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

const DeskScene = () => {
  const mousePosition = useRef(new THREE.Vector3())
  const mouseVelocity = useRef(new THREE.Vector3())
  const spotLightRef = useRef<THREE.SpotLight>(null)
  const [showHelper, setShowHelper] = useState(false)

  // Camera state for display overlay
  const [cameraInfo, setCameraInfo] = useState({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    rotationDegrees: { x: 0, y: 0, z: 0 },
    target: { x: 0, y: 0, z: 0 },
  })
  const orbitControlsRef = useRef<any>(null)

  // Fixed camera settings - these MUST always be applied
  const CAMERA_POSITION: [number, number, number] = [-6.5, 1.5, 6.5]
  const CAMERA_TARGET: [number, number, number] = [-0.484, 1.047, 0.511]
  const CAMERA_FOV = 30

  const CameraSetup = () => {
    const { camera } = useThree()

    // Force camera position and orientation on mount and every frame
    useEffect(() => {
      camera.position.set(...CAMERA_POSITION)
      camera.lookAt(...CAMERA_TARGET)
      ;(camera as THREE.PerspectiveCamera).fov = CAMERA_FOV
      ;(camera as THREE.PerspectiveCamera).updateProjectionMatrix()
    }, [camera])

    useFrame(() => {
      // Ensure camera stays fixed (prevents any drift)
      camera.position.set(...CAMERA_POSITION)
      camera.lookAt(...CAMERA_TARGET)
    })

    return null
  }

  const CameraTracker = () => {
    const { camera } = useThree()

    useFrame(() => {
      const currentPos = camera.position
      const currentRot = camera.rotation
      const target =
        orbitControlsRef.current?.target || new THREE.Vector3(0, 0, 0)

      // Update state for display
      setCameraInfo({
        position: {
          x: parseFloat(currentPos.x.toFixed(3)),
          y: parseFloat(currentPos.y.toFixed(3)),
          z: parseFloat(currentPos.z.toFixed(3)),
        },
        rotation: {
          x: parseFloat(currentRot.x.toFixed(3)),
          y: parseFloat(currentRot.y.toFixed(3)),
          z: parseFloat(currentRot.z.toFixed(3)),
        },
        rotationDegrees: {
          x: parseFloat(((currentRot.x * 180) / Math.PI).toFixed(1)),
          y: parseFloat(((currentRot.y * 180) / Math.PI).toFixed(1)),
          z: parseFloat(((currentRot.z * 180) / Math.PI).toFixed(1)),
        },
        target: {
          x: parseFloat(target.x.toFixed(3)),
          y: parseFloat(target.y.toFixed(3)),
          z: parseFloat(target.z.toFixed(3)),
        },
      })
    })

    return null
  }

  return (
    <div className="w-full h-full bg-[#EFEFEF]">
      <Canvas
        dpr={[1, 2]}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        gl={{
          antialias: true,
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          alpha: false,
        }}
        camera={{
          position: [-6.5, 1.5, 6.5],
          fov: 30,
          up: [0, 1, 0],
        }}
        style={{ width: "100%", height: "100%" }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color("#EFEFEF"))
        }}
      >
        <CameraSetup />
        <CameraTracker />
        <OrbitControls
          ref={orbitControlsRef}
          enablePan={false}
          enableZoom={false}
          enableRotate={false}
          minDistance={1}
          maxDistance={20}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          target={[-0.484, 1.047, 0.511]}
        />
        <Suspense fallback={null}>
          {/* Studio Lighting - Product Only */}

          {/* Key light - main focused light on product only */}
          <spotLight
            ref={spotLightRef}
            position={[-3, 5, 2]}
            target-position={[0, 1.5, 0]}
            intensity={100}
            color="#ffffff"
            angle={Math.PI / 8}
            penumbra={0.3}
            distance={15}
            decay={1.5}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0001}
            shadow-radius={8}
            shadow-camera-near={0.1}
            shadow-camera-far={20}
          />
          {showHelper && spotLightRef.current && (
            <SpotLightHelperComponent
              light={spotLightRef.current}
              color="#ff0000"
            />
          )}

          {/* Extra wide light - reduced for normal map visibility */}
          <spotLight
            position={[0, 12, 8]}
            target-position={[0, 0.55, 0]}
            intensity={2}
            color="#ffffff"
            angle={Math.PI / 6}
            penumbra={0.2}
            distance={30}
            decay={1}
          />

          {/* Ambient light - base illumination */}
          <ambientLight intensity={1.5} color="#EFEFEF" />

          {/* Hemisphere light - overall scene lighting */}
          <hemisphereLight
            color="#EFEFEF"
            groundColor="#EFEFEF"
            intensity={1.2}
          />

          {/* Fill light - softens shadows from all angles */}
          <directionalLight
            position={[5, 5, -5]}
            intensity={0.5}
            color="#EFEFEF"
          />
          <directionalLight
            position={[-5, 5, 5]}
            intensity={0.5}
            color="#EFEFEF"
          />

          {/* Photography Studio Backdrop */}
          <StudioBackdrop />

          {/* Display pedestal */}
          <DisplayPedestal />

          {/* Magazine on display pedestal */}
          <DeskMagazine />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default DeskScene
