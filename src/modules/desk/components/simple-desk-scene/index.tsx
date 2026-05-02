"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Suspense, useRef, useMemo, useState, useEffect } from "react"
import * as THREE from "three"
import {
  OrbitControls,
  Environment,
  Cloud,
  Clouds,
  useTexture,
} from "@react-three/drei"

const PAGE_WIDTH = 1.28
const PAGE_HEIGHT = 1.71
const PAGE_DEPTH = 0.003
const PAGE_SEGMENTS = 30
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS
const NUM_PAGES = 6

const CAMERA_POSITION: [number, number, number] = (() => {
  const from = new THREE.Vector3(-2.73, -1.979, 10.048)
  const to = new THREE.Vector3(-0.13, 0.384, 0.949)
  const dir = new THREE.Vector3().subVectors(from, to).multiplyScalar(0.92)
  return [to.x + dir.x, to.y + dir.y, to.z + dir.z] as [number, number, number]
})()
const CAMERA_TARGET: [number, number, number] = [-0.13, 0.384, 0.949]
const CAMERA_FOV = 30
const ORBIT_TARGET: [number, number, number] = [-0.13, 0.384, 0.949]

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
  scrollProgressRef?: React.MutableRefObject<number>
}

const DeskMagazine = ({
  frontCover,
  backCover,
  scrollProgressRef,
}: DeskMagazineProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const pagesRef = useRef<THREE.Group[]>([])
  const dampedBendRef = useRef(0)
  const hasInitDropRef = useRef(false)
  const [animateIn, setAnimateIn] = useState(true)
  const [visible, setVisible] = useState(true)

  // Create reflective spheres around the magazine
  const spheres = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2
      const radius = 3.5
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = Math.random() * 2 - 1

      const material = new THREE.MeshStandardMaterial({
        metalness: 0.9,
        roughness: 0.1,
        envMapIntensity: 2.0,
        color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.55, 0.7, 0.8),
      })

      const geometry = new THREE.SphereGeometry(0.15, 32, 16)
      const sphere = new THREE.Mesh(geometry, material)
      sphere.position.set(x, y, z)
      sphere.castShadow = true
      sphere.receiveShadow = true

      return sphere
    })
  }, [])

  const finalPos = useMemo(
    () =>
      new THREE.Vector3(CAMERA_TARGET[0], CAMERA_TARGET[1], CAMERA_TARGET[2]),
    []
  )
  const startPos = useMemo(
    () =>
      new THREE.Vector3(
        CAMERA_TARGET[0],
        CAMERA_TARGET[1] - 12,
        CAMERA_TARGET[2]
      ),
    []
  )

  useEffect(() => {
    const key = "desk_magazine_intro_done"
    try {
      const done = window.sessionStorage.getItem(key)
      if (done) {
        setAnimateIn(false)
        hasInitDropRef.current = true
        if (groupRef.current) groupRef.current.position.copy(finalPos)
      } else {
        window.sessionStorage.setItem(key, "1")
        setAnimateIn(true)
        hasInitDropRef.current = false
        if (groupRef.current) groupRef.current.position.copy(startPos)
      }
    } catch {
      // ignore
    }
  }, [finalPos])

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
        texturePath = frontCover || "/textures/left-page.jpg"
      } else if (i === NUM_PAGES - 1) {
        texturePath = backCover || "/textures/right-page.jpg"
      } else {
        texturePath = `/textures/page-${i + 1}.jpg`
      }

      const material = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        roughness: 0.55,
        metalness: 0.15,
        envMapIntensity: 0.6,
        bumpMap: grainTexture,
        bumpScale: 0.015,
        color: new THREE.Color("#ffffff"),
      })

      const loader = new THREE.TextureLoader()
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
  }, [frontCover, backCover, grainTexture])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    groupRef.current.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), delta * 0.3)

    if (animateIn && !hasInitDropRef.current) {
      groupRef.current.position.copy(startPos)
      hasInitDropRef.current = true
    }

    const scrollP = scrollProgressRef?.current ?? 0
    const scrollYOffset = -scrollP * 9.5

    const shouldBeVisible = scrollP <= 0.8
    if (shouldBeVisible !== visible) {
      setVisible(shouldBeVisible)
    }

    groupRef.current.position.x = THREE.MathUtils.damp(
      groupRef.current.position.x,
      finalPos.x,
      3.8,
      delta
    )
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      finalPos.y + scrollYOffset,
      3.8,
      delta
    )
    groupRef.current.position.z = THREE.MathUtils.damp(
      groupRef.current.position.z,
      finalPos.z,
      3.8,
      delta
    )

    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshStandardMaterial
        const targetOpacity = visible ? 1 : 0
        material.opacity = THREE.MathUtils.damp(
          material.opacity || 1,
          targetOpacity,
          5,
          delta
        )
        material.transparent = targetOpacity < 1
        material.needsUpdate = true
      }
    })

    const bend = 0.15
    dampedBendRef.current = bend

    const flipProgress = 0.02

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

      let pageStart = 0
      for (let i = 0; i < index; i++) {
        pageStart += pageWindowSize(i) / totalWeight
      }
      const pageRange = pageWindowSize(index) / totalWeight

      const rawT = Math.max(
        0,
        Math.min(1, (flipProgress - pageStart) / pageRange)
      )
      const pageT = 0.5 * (1 - Math.cos(Math.PI * rawT))

      group.rotation.y = -pageT * Math.PI

      const gap = PAGE_DEPTH * 0.5
      const unflippedZ = (NUM_PAGES - 1 - index) * gap
      const flippedZ = index * gap
      group.position.z = THREE.MathUtils.lerp(unflippedZ, flippedZ, pageT)

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
      position={
        animateIn
          ? ([startPos.x, startPos.y, startPos.z] as [number, number, number])
          : ([finalPos.x, finalPos.y, finalPos.z] as [number, number, number])
      }
      rotation={(() => {
        const cameraPos = new THREE.Vector3(...CAMERA_POSITION)
        const magazinePos = animateIn ? startPos : finalPos

        const direction = new THREE.Vector3()
          .subVectors(cameraPos, magazinePos)
          .normalize()

        const rotation = new THREE.Euler()
        rotation.setFromQuaternion(
          new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            direction
          )
        )

        return [rotation.x, rotation.y, rotation.z] as [number, number, number]
      })()}
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

const SkySphere = ({
  url = "/textures/sky.jpg",
  radius = 5.5,
}: {
  url?: string
  radius?: number
}) => {
  const texture = useTexture(url)

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace
  }, [texture])

  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[radius, 48, 48]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        transparent
        opacity={0.5}
      />
    </mesh>
  )
}

const AtmosphereSphere = ({
  radius = 5.2,
  innerColor = "#E9F1F7",
  outerColor = "#E9F1F7",
}: {
  radius?: number
  innerColor?: string
  outerColor?: string
}) => {
  const inner = useMemo(() => new THREE.Color(innerColor), [innerColor])
  const outer = useMemo(() => new THREE.Color(outerColor), [outerColor])

  const uniforms = useMemo(
    () => ({
      uInnerColor: { value: inner },
      uOuterColor: { value: outer },
      uInner: { value: 0.0 },
      uOuter: { value: 1.0 },
    }),
    [inner, outer]
  )

  const vertexShader = useMemo(
    () => `
      varying vec3 vWorldDir;

      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldDir = normalize(worldPos.xyz);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    []
  )

  const fragmentShader = useMemo(
    () => `
      uniform vec3 uInnerColor;
      uniform vec3 uOuterColor;
      uniform float uInner;
      uniform float uOuter;
      varying vec3 vWorldDir;

      void main() {
        vec3 dir = normalize(vWorldDir);
        vec3 centerDir = vec3(0.0, 0.0, -1.0);
        float angle = acos(clamp(dot(dir, centerDir), -1.0, 1.0));

        float t = smoothstep(uInner, uOuter, angle);
        vec3 color = mix(uInnerColor, uOuterColor, t);
        float alpha = 1.0 - t;

        gl_FragColor = vec4(color, alpha);
      }
    `,
    []
  )

  return (
    <mesh position={[0, 0, 0]} rotation={[-2, Math.PI, -1]}>
      <sphereGeometry args={[radius, 48, 48]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}

const SimpleCloud = ({
  position = [0, 0, 0],
  scale = [4.8, 2.8, 1],
  rotation = [0, 0, 0],
  opacity = 0.95,
}: {
  position?: [number, number, number]
  scale?: [number, number, number]
  rotation?: [number, number, number]
  opacity?: number
}) => {
  const texture = useTexture("/textures/smoke-soft.png")

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.needsUpdate = true
  }, [texture])

  return (
    <group position={position} scale={scale as any} rotation={rotation}>
      <mesh rotation={[0, 0, 0]}>
        <planeGeometry args={[3.6, 2.5]} />
        <meshBasicMaterial
          map={texture}
          color="#ffffff"
          transparent
          opacity={opacity}
          depthWrite={false}
          alphaTest={0.0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

const MagazineClouds = () => {
  return (
    <group position={[CAMERA_TARGET[0], -1.9, 1.5]}>
      <SimpleCloud
        position={[3, 0, 0]}
        scale={[2, 1, 0.3]}
        opacity={0.9}
        rotation={[0, Math.PI / 1.2, -3.5]}
      />
      <SimpleCloud
        position={[-3, 0, 0]}
        scale={[2, 1, 0.3]}
        opacity={0.9}
        rotation={[3.5, Math.PI / -1, -0.3]}
      />
    </group>
  )
}

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

    const distance = mesh.position.distanceTo(mousePos)
    const pushRadius = 0.3

    if (distance < pushRadius) {
      const pushStrength = (1 - distance / pushRadius) * 0.15

      velocityRef.current.x += mouseVel.x * pushStrength
      velocityRef.current.z += mouseVel.z * pushStrength

      const toPlane = new THREE.Vector3()
        .subVectors(mesh.position, mousePos)
        .normalize()
      velocityRef.current.add(toPlane.multiplyScalar(pushStrength * 0.1))
    }

    velocityRef.current.multiplyScalar(0.92)
    mesh.position.add(velocityRef.current)
    mesh.position.y = 0.01

    const boundarySize = 2
    mesh.position.x = Math.max(
      -boundarySize,
      Math.min(boundarySize, mesh.position.x)
    )
    mesh.position.z = Math.max(
      -boundarySize,
      Math.min(boundarySize, mesh.position.z)
    )

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

const InteractivePlanes = ({
  mousePosition,
  mouseVelocity,
}: {
  mousePosition: React.MutableRefObject<THREE.Vector3>
  mouseVelocity: React.MutableRefObject<THREE.Vector3>
}) => {
  return null
}

const ImageScene = ({ imageUrl }: { imageUrl: string }) => {
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader()

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      loader.setCrossOrigin("anonymous")
    }

    const tex = loader.load(
      imageUrl,
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace
      },
      undefined,
      (error) => {
        console.warn(`Failed to load image texture: ${imageUrl}`, error)
      }
    )
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

const StudioBackdrop = () => {
  return null
}

const CameraSetup = ({
  position,
  target,
  fov,
}: {
  position: [number, number, number]
  target: [number, number, number]
  fov: number
}) => {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(...position)
    camera.lookAt(...target)
    ;(camera as THREE.PerspectiveCamera).fov = fov
    ;(camera as THREE.PerspectiveCamera).updateProjectionMatrix()
  }, [camera, fov, position, target])

  return null
}

const CameraLockedMagazine = ({
  scrollProgressRef,
  frontCover,
  backCover,
}: {
  scrollProgressRef: React.MutableRefObject<number>
  frontCover?: string
  backCover?: string
}) => {
  return (
    <DeskMagazine
      scrollProgressRef={scrollProgressRef}
      frontCover={frontCover}
      backCover={backCover}
    />
  )
}

const SurfacePlane = () => {
  return (
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[6, 6]} />
      <meshStandardMaterial
        color="#c0c0c0"
        roughness={0.8}
        metalness={0.2}
        transparent
        opacity={0.0}
      />
    </mesh>
  )
}

const DisplayPedestal = () => {
  return null
}

const SunLight = () => {
  const lightRef = useRef<THREE.DirectionalLight>(null)
  const targetRef = useRef<THREE.Object3D>(null)

  useEffect(() => {
    if (!lightRef.current || !targetRef.current) return
    lightRef.current.target = targetRef.current
  }, [])

  return (
    <>
      <object3D ref={targetRef} position={CAMERA_TARGET} />
      <directionalLight
        ref={lightRef}
        position={[12, 15, 8]} // Changed position
        intensity={6.0} // Increased intensity
        color="#F3FBFA" // Changed color
        castShadow={false}
      />
    </>
  )
}

interface DeskSceneProps {
  frontCover?: string
  backCover?: string
}

// Camera controller for subtle random rotation
const CameraController = () => {
  const { camera } = useThree()
  const time = useRef(0)
  const initialized = useRef(false)

  // Initialize camera position
  useEffect(() => {
    camera.position.set(...CAMERA_POSITION)
    camera.lookAt(...CAMERA_TARGET)
    initialized.current = true
  }, [camera])

  useFrame((state, delta) => {
    if (!initialized.current) return

    time.current += delta

    // Calculate camera distance from target
    const originalCameraPos = new THREE.Vector3(...CAMERA_POSITION)
    const targetPos = new THREE.Vector3(...CAMERA_TARGET)
    const originalDistance = originalCameraPos.distanceTo(targetPos)

    // Motion parameters - reduced for less intensity
    const radius = 0.4 // Reduced from 0.8
    const speed = 0.8 // Reduced from 1.2

    // Calculate circular motion around target
    const angle = time.current * speed
    const offsetX = Math.sin(angle) * radius
    const offsetZ = Math.cos(angle) * radius

    // Add vertical motion too - reduced
    const offsetY = Math.sin(time.current * speed * 0.7) * 0.15 // Reduced from 0.3

    // Create new position
    const newPosition = new THREE.Vector3(
      CAMERA_POSITION[0] + offsetX,
      CAMERA_POSITION[1] + offsetY,
      CAMERA_POSITION[2] + offsetZ
    )

    // Maintain consistent distance from target
    const direction = newPosition.clone().sub(targetPos).normalize()
    const finalPosition = targetPos
      .clone()
      .add(direction.multiplyScalar(originalDistance))

    // Apply final position
    camera.position.copy(finalPosition)

    // Always look at the target
    camera.lookAt(targetPos)
  })

  return null
}

const DeskScene = ({ frontCover, backCover }: DeskSceneProps) => {
  const orbitControlsRef = useRef<any>(null)
  const scrollProgressRef = useRef(0)
  const sceneWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0

    const update = () => {
      raf = 0
      const el = sceneWrapRef.current
      if (!el) return

      const scrollY = window.scrollY || 0
      const rect = el.getBoundingClientRect()
      const elTop = rect.top + scrollY
      const elHeight = Math.max(1, rect.height)

      const raw = THREE.MathUtils.clamp((scrollY - elTop) / elHeight, 0, 1)

      const threshold = 0.15
      const t = THREE.MathUtils.clamp((raw - threshold) / (1 - threshold), 0, 1)
      scrollProgressRef.current = t
    }

    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(update)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    update()

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={sceneWrapRef} className="w-full h-full bg-transparent">
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          alpha: true,
        }}
        camera={{
          fov: CAMERA_FOV,
          up: [0, 1, 0],
        }}
        style={{
          width: "100%",
          height: "100%",
          touchAction: "none",
          pointerEvents: "none",
        }}
        eventSource={undefined}
        events={undefined}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(0x000000), 0)

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
          gl.domElement.addEventListener("mouseup", (e) => e.preventDefault(), {
            passive: false,
          })
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
        <CameraController />

        {/* <OrbitControls
          ref={orbitControlsRef}
          enablePan={false}
          enableZoom={false}
          enableRotate={false}
          minDistance={3}
          maxDistance={20}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          target={ORBIT_TARGET}
        /> */}

        <Suspense fallback={null}>
          <SkySphere />
          <AtmosphereSphere />
          {/* Lighting setup - warm and blueish sides */}
          <SunLight />

          {/* Blueish light on one side */}
          <directionalLight
            position={[-10, 8, -5]}
            intensity={1.5}
            color="#EFD69D" // Sky blue
            castShadow={false}
          />

          {/* Warm ambient light for all-around illumination */}
          <ambientLight intensity={2.5} color="#F3FBFA" />

          <StudioBackdrop />
          <DisplayPedestal />
          <CameraLockedMagazine
            scrollProgressRef={scrollProgressRef}
            frontCover={frontCover}
            backCover={backCover}
          />
          <MagazineClouds />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default DeskScene
export { DeskMagazine }
