"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import * as THREE from "three"
import { sdk } from "@/lib/config"

const MAX_CARD_WIDTH = 560
const CARD_ASPECT_RATIO = 3 / 4
const NUM_CARDS = 30
const CAMERA_FOV_DEG = 45
const CAMERA_Z = 14
const FRONT_CARD_SCREEN_FILL = 0.65

function getFullImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  const backend =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

  const absolute =
    url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `${backend}${url.startsWith("/") ? "" : "/"}${url}`

  // Always proxy images to avoid CORS issues with WebGL texture loading.
  return `/api/image-proxy?url=${encodeURIComponent(absolute)}`
}

interface Card {
  id: string
  title: string
  color: string
  imageUrl?: string
}

const initialCards: Card[] = Array.from({ length: NUM_CARDS }, (_, i) => ({
  id: `card-${i}`,
  title: `Magazine ${i + 1}`,
  color: "#ffffff",
}))

export default function Magazine1Page() {
  const { countryCode } = useParams<{ countryCode: string }>()

  const [cards, setCards] = useState<Card[]>(initialCards)
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cardMeshesRef = useRef<THREE.Mesh[]>([])
  const rotationRef = useRef(0)
  const targetRotationRef = useRef(0)
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        const { product_categories } = await sdk.client.fetch<{
          product_categories: Array<{ id: string; name: string }>
        }>("/store/product-categories", {
          method: "GET",
          query: { limit: 100, fields: "id,name" },
          cache: "no-store",
        })

        const magazinesCategory = product_categories.find(
          (c) => c.name?.toLowerCase() === "magazines"
        )

        if (!magazinesCategory) return

        const { products } = await sdk.client.fetch<{
          products: Array<{
            id: string
            title: string
            thumbnail?: string | null
            images?: Array<{ url?: string | null }> | null
          }>
        }>("/store/products", {
          method: "GET",
          query: {
            limit: 100,
            category_id: magazinesCategory.id,
            fields: "id,title,thumbnail,*images,*images.url",
          },
          cache: "no-store",
        })

        const imageUrls = (products || [])
          .map((p) => p.thumbnail || p.images?.[0]?.url)
          .filter((u): u is string => Boolean(u))

        const fullImageUrls = imageUrls
          .map((u) => getFullImageUrl(u))
          .filter((u): u is string => Boolean(u))

        if (fullImageUrls.length === 0) return

        const nextCards: Card[] = Array.from({ length: NUM_CARDS }, (_, i) => {
          const url = fullImageUrls[i % fullImageUrls.length]
          const product = products[i % products.length]
          return {
            id: `magazine-card-${i}`,
            title: product?.title || `Magazine ${i + 1}`,
            color: "#ffffff",
            imageUrl: url,
          }
        })

        if (!cancelled) setCards(nextCards)
      } catch {
        // ignore
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [countryCode])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xefefef)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      CAMERA_FOV_DEG,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    )
    camera.position.z = CAMERA_Z
    camera.position.y = 0
    camera.position.x = 0
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(0, 10, 10)
    scene.add(directionalLight)

    const circleRadiusRef = { current: 0 }

    const cardWidth = 2
    const cardHeight = cardWidth / CARD_ASPECT_RATIO

    const recomputeCircleRadius = () => {
      const aspect = container.clientWidth / container.clientHeight
      const fovRad = (CAMERA_FOV_DEG * Math.PI) / 180

      // PerspectiveCamera fov is vertical; derive visible width at depth using aspect.
      // visibleHeight(d) = 2*d*tan(fov/2)
      // visibleWidth(d)  = visibleHeight(d) * aspect
      // Want: cardWidth = FRONT_CARD_SCREEN_FILL * visibleWidth(d)
      // => d = cardWidth / (FRONT_CARD_SCREEN_FILL * 2 * tan(fov/2) * aspect)
      const distanceToFrontCard =
        cardWidth / (FRONT_CARD_SCREEN_FILL * 2 * Math.tan(fovRad / 2) * aspect)

      circleRadiusRef.current = camera.position.z - distanceToFrontCard
    }

    recomputeCircleRadius()

    // Create cards in a circle
    const cardGeometry = new THREE.PlaneGeometry(cardWidth, cardHeight)
    const cardMeshes: THREE.Mesh[] = []

    const textureLoader = new THREE.TextureLoader()
    textureLoader.crossOrigin = "anonymous"

    cards.forEach((card, i) => {
      const material = new THREE.MeshBasicMaterial({
        color:
          card.color === "#ffffff" ? 0xffffff : new THREE.Color(card.color),
        side: THREE.DoubleSide,
      })

      if (card.imageUrl) {
        textureLoader.load(
          card.imageUrl,
          (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace
            material.map = texture
            material.color = new THREE.Color(0xffffff)
            material.needsUpdate = true
          },
          undefined,
          () => {
            // ignore
          }
        )
      }

      const mesh = new THREE.Mesh(cardGeometry, material)

      // Initial position in a vertical circle (standing up)
      const angle = (i / NUM_CARDS) * Math.PI * 2
      const yOffset = -3
      mesh.position.x = 2
      mesh.position.y = Math.cos(angle) * circleRadiusRef.current + yOffset
      mesh.position.z = Math.sin(angle) * circleRadiusRef.current

      // Cards have no initial rotation
      scene.add(mesh)
      cardMeshes.push(mesh)
    })

    cardMeshesRef.current = cardMeshes

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      // Smooth rotation interpolation
      rotationRef.current +=
        (targetRotationRef.current - rotationRef.current) * 0.1

      // Normalize rotation to keep it within reasonable bounds for infinite scroll
      const rotationPerCard = (Math.PI * 2) / NUM_CARDS
      const totalRotation = rotationRef.current
      const normalizedRotation = totalRotation % (Math.PI * 2)

      // Manually update each card's position to create orbital motion
      // Cards rotate to face the center of the circle
      const yOffset = 0
      cardMeshes.forEach((mesh, i) => {
        const baseAngle = (i / NUM_CARDS) * Math.PI * 2
        const currentAngle = baseAngle + normalizedRotation
        mesh.position.x = 0
        mesh.position.y =
          Math.cos(currentAngle) * circleRadiusRef.current + yOffset
        mesh.position.z = Math.sin(currentAngle) * circleRadiusRef.current
        mesh.visible = mesh.position.z >= 0
        mesh.lookAt(0, 12, 0)
      })

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      if (w <= 0 || h <= 0) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      recomputeCircleRadius()
    }

    handleResize()

    const ro = new ResizeObserver(handleResize)
    ro.observe(container)

    window.addEventListener("resize", handleResize)

    // Handle scroll
    const handleScroll = (e: WheelEvent) => {
      isScrollingRef.current = true
      targetRotationRef.current += e.deltaY * 0.002

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Set timeout to detect when scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false

        // Calculate nearest card to center
        const rotationPerCard = (Math.PI * 2) / NUM_CARDS
        const currentRotation = targetRotationRef.current
        const nearestCardIndex = Math.round(currentRotation / rotationPerCard)
        const snappedRotation = nearestCardIndex * rotationPerCard

        targetRotationRef.current = snappedRotation
      }, 150)
    }

    container.addEventListener("wheel", handleScroll)

    // Cleanup
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", handleResize)
      container.removeEventListener("wheel", handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      container.removeChild(renderer.domElement)
      renderer.dispose()
      cardMeshes.forEach((mesh) => {
        mesh.geometry.dispose()
        const mat = mesh.material as THREE.MeshBasicMaterial
        if (mat.map) mat.map.dispose()
        mat.dispose()
      })
    }
  }, [cards])

  return (
    <div className="h-[calc(100vh-200px)] relative w-full">
      <div
        className="absolute top-0 left-0 right-0 h-[100px] pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, #efefef 0%, transparent 100%)",
          zIndex: 20,
        }}
      />
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
