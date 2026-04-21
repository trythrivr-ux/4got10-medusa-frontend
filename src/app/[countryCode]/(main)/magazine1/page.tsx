"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import * as THREE from "three"
import { sdk } from "@/lib/config"
import { useCustomLayout } from "@/context/custom-layout-context"
import { addToCart } from "@lib/data/cart"

const MAX_CARD_WIDTH = 560
const CARD_ASPECT_RATIO = 3 / 4
const NUM_CARDS = 30
const CAMERA_FOV_DEG = 45
const CAMERA_Z = 14
const FRONT_CARD_SCREEN_FILL = 0.7

function getFullImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  const backend =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

  const absolute =
    url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `${backend}${url.startsWith("/") ? "" : "/"}${url}`

  let normalizedAbsolute = absolute
  try {
    normalizedAbsolute = decodeURIComponent(absolute)
  } catch {
    // ignore
  }

  // Always proxy images to avoid CORS issues with WebGL texture loading.
  return `/api/image-proxy?url=${encodeURIComponent(normalizedAbsolute)}`
}

interface Card {
  id: string
  title: string
  color: string
  imageUrl?: string
  productId?: string
  variantId?: string
}

const initialCards: Card[] = Array.from({ length: NUM_CARDS }, (_, i) => ({
  id: `card-${i}`,
  title: `Magazine ${i + 1}`,
  color: "#ffffff",
}))

export default function Magazine1Page() {
  const { countryCode } = useParams<{ countryCode: string }>()
  const { setCustomLayout } = useCustomLayout()
  const router = useRouter()

  const [cards, setCards] = useState<Card[]>(initialCards)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showAddToCart, setShowAddToCart] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Card | null>(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleAddToCart = async () => {
    if (!currentProduct?.variantId) {
      return
    }

    setIsAddingToCart(true)
    try {
      await addToCart({
        variantId: currentProduct.variantId,
        quantity: 1,
        countryCode,
      })

      window.dispatchEvent(new Event("cart-updated"))
      router.refresh()
    } catch (error) {
      console.error("Failed to add to cart:", error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  useEffect(() => {
    setCustomLayout(true)
    return () => setCustomLayout(false)
  }, [setCustomLayout])
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cardMeshesRef = useRef<THREE.Mesh[]>([])
  const rotationRef = useRef(0)
  const targetRotationRef = useRef(0)
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const frontCardIndexRef = useRef(-1)
  const popOffsetRef = useRef(0)
  const spacingOffsetRef = useRef(0)
  const cardPopOffsetsRef = useRef<number[]>([])
  const cardSpacingOffsetsRef = useRef<number[]>([])

  useEffect(() => {
    if (
      frontCardIndexRef.current >= 0 &&
      frontCardIndexRef.current < cards.length
    ) {
      setCurrentProduct(cards[frontCardIndexRef.current])
    }
  }, [frontCardIndexRef.current, cards])

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
            variants?: Array<{ id: string }> | null
          }>
        }>("/store/products", {
          method: "GET",
          query: {
            limit: 100,
            category_id: magazinesCategory.id,
            fields:
              "id,title,thumbnail,*images,*images.url,*variants,*variants.id",
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
          const variant = product?.variants?.[0]
          return {
            id: `magazine-card-${i}`,
            title: product?.title || `Magazine ${i + 1}`,
            color: "#ffffff",
            imageUrl: url,
            productId: product?.id,
            variantId: variant?.id,
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
            texture.center.set(0.5, 0.5)
            texture.repeat.x = -1
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

      // Smooth pop offset animation (always active for front card)
      const targetPopOffset = 0.5
      popOffsetRef.current += (targetPopOffset - popOffsetRef.current) * 0.1

      // Smooth spacing offset animation (when not scrolling)
      const targetSpacingOffset = !isScrollingRef.current ? 0.5 : 0
      spacingOffsetRef.current +=
        (targetSpacingOffset - spacingOffsetRef.current) * 0.1

      // Normalize rotation to keep it within reasonable bounds for infinite scroll
      const rotationPerCard = (Math.PI * 2) / NUM_CARDS
      const totalRotation = rotationRef.current
      const normalizedRotation = totalRotation % (Math.PI * 2)

      // Track which card is at the front (highest z position)
      let maxZ = -Infinity
      let frontCardIdx = -1

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
        mesh.lookAt(0, 3, 0)

        // Track front card
        if (mesh.position.z > maxZ) {
          maxZ = mesh.position.z
          frontCardIdx = i
        }
      })

      frontCardIndexRef.current = frontCardIdx

      // Initialize per-card offset arrays if needed
      if (cardPopOffsetsRef.current.length !== NUM_CARDS) {
        cardPopOffsetsRef.current = Array(NUM_CARDS).fill(0)
      }
      if (cardSpacingOffsetsRef.current.length !== NUM_CARDS) {
        cardSpacingOffsetsRef.current = Array(NUM_CARDS).fill(0)
      }

      // Animate per-card offsets smoothly
      const numCardsToSpace = 5
      for (let i = 0; i < NUM_CARDS; i++) {
        // Calculate target pop offset (1 for front card, 0 for others)
        const targetPopOffset = i === frontCardIdx ? popOffsetRef.current : 0
        cardPopOffsetsRef.current[i] +=
          (targetPopOffset - cardPopOffsetsRef.current[i]) * 0.1

        // Calculate target spacing offset for cards after front card
        let targetSpacingOffset = 0
        if (i !== frontCardIdx) {
          const offset = (i - frontCardIdx + NUM_CARDS) % NUM_CARDS
          if (offset <= numCardsToSpace && offset > 0) {
            targetSpacingOffset =
              spacingOffsetRef.current * (1 - (offset - 1) / numCardsToSpace)
          }
        }
        cardSpacingOffsetsRef.current[i] +=
          (targetSpacingOffset - cardSpacingOffsetsRef.current[i]) * 0.1
      }

      // Apply per-card offsets to positions
      cardMeshes.forEach((mesh, i) => {
        mesh.position.y += cardPopOffsetsRef.current[i]
        mesh.position.y -= cardSpacingOffsetsRef.current[i]
      })

      // Reset scale for other cards
      cardMeshes.forEach((mesh, i) => {
        mesh.scale.set(1, 1, 1)
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

    let touchStartY = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }

    const handleScroll = (e: WheelEvent) => {
      e.preventDefault()
      isScrollingRef.current = true
      setShowAddToCart(false)
      targetRotationRef.current -= e.deltaY * 0.002

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Set timeout to detect when scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false
        setShowAddToCart(true)

        // Calculate nearest card to center
        const rotationPerCard = (Math.PI * 2) / NUM_CARDS
        const currentRotation = targetRotationRef.current
        const nearestCardIndex = Math.round(currentRotation / rotationPerCard)
        const snappedRotation = nearestCardIndex * rotationPerCard

        // Offset by rotationPerCard/2 to center the card at z=0 instead of at the front of the circle
        const centeredRotation = snappedRotation - rotationPerCard / 2

        targetRotationRef.current = centeredRotation
      }, 1000)
    }

    const handleTouchMove = (e: TouchEvent) => {
      isScrollingRef.current = true
      setShowAddToCart(false)
      const touchY = e.touches[0].clientY
      const deltaY = touchStartY - touchY
      targetRotationRef.current -= deltaY * 0.005
      touchStartY = touchY

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Set timeout to detect when scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false
        setShowAddToCart(true)

        // Calculate nearest card to center
        const rotationPerCard = (Math.PI * 2) / NUM_CARDS
        const currentRotation = targetRotationRef.current
        const nearestCardIndex = Math.round(currentRotation / rotationPerCard)
        const snappedRotation = nearestCardIndex * rotationPerCard

        // Offset by rotationPerCard/2 to center the card at z=0 instead of at the front of the circle
        const centeredRotation = snappedRotation - rotationPerCard / 2

        targetRotationRef.current = centeredRotation
      }, 1000)
    }

    container.addEventListener("wheel", handleScroll)
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    })
    container.addEventListener("touchmove", handleTouchMove, { passive: true })

    // Cleanup
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", handleResize)
      container.removeEventListener("wheel", handleScroll)
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
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
    <div className="h-screen relative w-full">
      <div
        className="absolute top-0 left-0 right-0 h-[50px] pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, #efefef 0%, transparent 100%)",
          zIndex: 20,
        }}
      />
      <div ref={containerRef} className="w-full h-full" />
      <div
        className="absolute -mb-[2px] bottom-0 left-0 right-0 h-[50px] pointer-events-none"
        style={{
          background: "linear-gradient(to top, #efefef 0%, transparent 100%)",
          zIndex: 20,
        }}
      />
      {showAddToCart && currentProduct && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center gap-3 transition-opacity duration-300">
          <p
            className="text-lg font-semibold text-black font-sans"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            {currentProduct.title}
          </p>
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      )}
    </div>
  )
}
