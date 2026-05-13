"use client"

import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { Billboard, Html } from "@react-three/drei"
import { ComponentType, Suspense, useMemo, useRef } from "react"
import { DEFAULT_ORBIT_CARDS } from "@modules/lander/components/cards"
import { DeskMagazine } from "@modules/desk/components/desk-scene"
import * as THREE from "three"

const DEFAULT_IMAGE_URLS = [
  "/prototype/image.jpg",
  "/prototype/image-2.jpg",
  "/prototype/image-3.jpg",
]

type CircleImageProps = {
  imageUrls?: string[]
  changeEvery?: number
  transitionDuration?: number
}

const CircleImage = ({
  imageUrls = DEFAULT_IMAGE_URLS,
  changeEvery = 3.8,
  transitionDuration = 1.65,
}: CircleImageProps) => {
  const textures = useLoader(THREE.TextureLoader, imageUrls)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  textures.forEach((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
  })

  const getAspect = (texture?: THREE.Texture) => {
    const img = texture?.image as { width: number; height: number } | undefined
    if (!img) return 1
    return img.width / img.height
  }

  const stateRef = useRef({
    currentIndex: 0,
    nextIndex: textures.length > 1 ? 1 : 0,
    timer: 0,
    progress: 0,
    inTransition: false,
  })

  useFrame((_, delta) => {
    const material = materialRef.current
    const state = stateRef.current
    if (!material || textures.length === 0) return

    material.uniforms.uTime.value += delta

    if (textures.length < 2) {
      material.uniforms.uTransition.value = 0
      material.uniforms.uTextureCurrent.value = textures[0]
      material.uniforms.uTextureNext.value = textures[0]
      material.uniforms.uImageAspect.value = getAspect(textures[0])
      return
    }

    state.timer += delta

    if (!state.inTransition && state.timer >= changeEvery) {
      state.inTransition = true
      state.timer = 0
      state.progress = 0
      state.nextIndex = (state.currentIndex + 1) % textures.length

      material.uniforms.uTextureCurrent.value = textures[state.currentIndex]
      material.uniforms.uTextureNext.value = textures[state.nextIndex]
      material.uniforms.uImageAspect.value = getAspect(
        textures[state.currentIndex]
      )
      material.uniforms.uTransition.value = 0
    }

    if (state.inTransition) {
      state.progress += delta / transitionDuration
      const clamped = Math.min(state.progress, 1)

      material.uniforms.uTransition.value = clamped

      if (clamped >= 1) {
        state.inTransition = false
        state.currentIndex = state.nextIndex
        state.progress = 0
        state.timer = 0

        material.uniforms.uTransition.value = 0
        material.uniforms.uTextureCurrent.value = textures[state.currentIndex]
        material.uniforms.uTextureNext.value =
          textures[(state.currentIndex + 1) % textures.length]
        material.uniforms.uImageAspect.value = getAspect(
          textures[state.currentIndex]
        )
        material.uniforms.uTime.value = 0
      }
    } else {
      material.uniforms.uTransition.value = 0
      material.uniforms.uTextureCurrent.value = textures[state.currentIndex]
      material.uniforms.uTextureNext.value =
        textures[(state.currentIndex + 1) % textures.length]
      material.uniforms.uImageAspect.value = getAspect(
        textures[state.currentIndex]
      )
    }
  })

  return (
    <group position={[0, 0, 0]}>
      <mesh renderOrder={2}>
        <sphereGeometry args={[3.14, 180, 180]} />
        <shaderMaterial
          ref={materialRef}
          transparent
          depthWrite={false}
          side={THREE.FrontSide}
          uniforms={{
            uTextureCurrent: { value: textures[0] },
            uTextureNext: { value: textures[1] ?? textures[0] },
            uOpacity: { value: 0.92 },
            uImageAspect: { value: getAspect(textures[0]) },
            uProjectionScale: { value: 0.82 },
            uStopMidRadius: { value: 0.69 },
            uStopMidOpacity: { value: 0.2 },
            uBlurAmount: { value: 0.01 },
            uTransition: { value: 0 },
            uTime: { value: 0 },
            uSwirlStrength: { value: 0.22 },
            uSuckStrength: { value: 0.32 },
            uPulseStrength: { value: 0.18 },
            uChromatic: { value: 0.0035 },
          }}
          vertexShader={`
            varying vec3 vWorldNormal;
            varying vec3 vViewDir;
            varying vec2 vUv;

            void main() {
              vUv = uv;

              vec4 worldPos = modelMatrix * vec4(position, 1.0);
              vec4 mv = viewMatrix * worldPos;

              vWorldNormal = normalize(mat3(modelMatrix) * normal);
              vViewDir = normalize(cameraPosition - worldPos.xyz);

              gl_Position = projectionMatrix * mv;
            }
          `}
          fragmentShader={`
            uniform sampler2D uTextureCurrent;
            uniform sampler2D uTextureNext;
            uniform float uOpacity;
            uniform float uImageAspect;
            uniform float uProjectionScale;
            uniform float uStopMidRadius;
            uniform float uStopMidOpacity;
            uniform float uBlurAmount;
            uniform float uTransition;
            uniform float uTime;
            uniform float uSwirlStrength;
            uniform float uSuckStrength;
            uniform float uPulseStrength;
            uniform float uChromatic;

            varying vec3 vWorldNormal;
            varying vec3 vViewDir;
            varying vec2 vUv;

            float easeInOutCubic(float t) {
              return t < 0.5
                ? 4.0 * t * t * t
                : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
            }

            float ramp(float a, float b, float t) {
              return smoothstep(a, b, t);
            }

            vec2 coverUv(vec2 uv, float imageAspect) {
              float boxAspect = 1.0;
              vec2 suv = uv;

              if (imageAspect > boxAspect) {
                float scale = boxAspect / imageAspect;
                suv.x = (uv.x - 0.5) * scale + 0.5;
              } else {
                float scale = imageAspect / boxAspect;
                suv.y = (uv.y - 0.5) * scale + 0.5;
              }

              return suv;
            }

            vec2 suckUv(vec2 uv, float progress, float suckStrength, float swirlStrength) {
              vec2 center = vec2(0.5);
              vec2 delta = uv - center;
              float dist = length(delta);
              float angle = atan(delta.y, delta.x);

              float inward = progress * suckStrength;
              float swirl = sin(dist * 10.0 - progress * 6.28318) * swirlStrength * progress;

              float radius = dist * (1.0 - inward);
              angle += swirl * (1.0 - dist);

              vec2 warped = vec2(cos(angle), sin(angle)) * radius;
              return center + warped;
            }

            vec2 rebirthUv(vec2 uv, float progress, float suckStrength, float swirlStrength) {
              vec2 center = vec2(0.5);
              vec2 delta = uv - center;
              float dist = length(delta);
              float angle = atan(delta.y, delta.x);

              float outward = (1.0 - progress) * suckStrength;
              float swirl = sin(dist * 10.0 - (1.0 - progress) * 6.28318) * swirlStrength * (1.0 - progress);

              float radius = dist * (1.0 - outward);
              angle -= swirl * (1.0 - dist);

              vec2 warped = vec2(cos(angle), sin(angle)) * radius;
              return center + warped;
            }

            vec4 sampleSoft(sampler2D tex, vec2 uv, float edgeBlur) {
              vec2 delta = uv - 0.5;
              float len = max(length(delta), 0.0001);
              vec2 dir = delta / len;

              vec4 blurTex = vec4(0.0);
              float total = 0.0;

              for (int i = 0; i < 6; i++) {
                float tt = float(i) / 5.0;
                vec2 offset = dir * tt * edgeBlur;
                blurTex += texture2D(tex, uv + offset);
                total += 1.0;
              }

              return blurTex / total;
            }

            void main() {
              vec3 normal = normalize(vWorldNormal);
              vec3 viewDir = normalize(vViewDir);

              vec2 projected = normal.xy * 0.5 / uProjectionScale + 0.5;
              float distToCenter = clamp(length((projected - 0.5) * 2.0), 0.0, 1.0);

              float mask;
              if (distToCenter <= uStopMidRadius) {
                float mt = distToCenter / max(uStopMidRadius, 0.0001);
                mask = mix(1.0, uStopMidOpacity, mt);
              } else {
                float mt = (distToCenter - uStopMidRadius) / max(1.0 - uStopMidRadius, 0.0001);
                mask = mix(uStopMidOpacity, 0.0, mt);
              }

              float sphereFade = mask;

              vec2 baseUv = coverUv(projected, uImageAspect);

              if (
                baseUv.x < 0.0 || baseUv.x > 1.0 ||
                baseUv.y < 0.0 || baseUv.y > 1.0
              ) {
                discard;
              }

              if (uTransition < 0.0001) {
                vec4 tex = texture2D(uTextureCurrent, baseUv);
                gl_FragColor = vec4(tex.rgb, tex.a * sphereFade * uOpacity);
                return;
              }

              float t = easeInOutCubic(uTransition);

              float activateDistortionIn = ramp(0.0, 0.16, t);
              float activateBlurIn = ramp(0.03, 0.22, t);
              float activatePulseIn = ramp(0.18, 0.5, t);
              float activateChromaticIn = ramp(0.45, 0.78, t);

              float settleOut = 1.0 - ramp(0.78, 1.0, t);
              float settleOutSoft = 1.0 - ramp(0.72, 1.0, t);

              float suckPhaseRaw = smoothstep(0.0, 0.48, t);
              float revealPhaseRaw = smoothstep(0.52, 1.0, t);

              float suckPhase = suckPhaseRaw * activateDistortionIn;
              float revealPhase = revealPhaseRaw * settleOut;

              vec2 suckedUv = suckUv(baseUv, suckPhaseRaw, uSuckStrength, uSwirlStrength);
              vec2 rebornUv = rebirthUv(baseUv, revealPhaseRaw, uSuckStrength, uSwirlStrength);

              vec2 currentUv = mix(baseUv, suckedUv, activateDistortionIn);
              vec2 nextUv = mix(baseUv, rebornUv, revealPhase);

              currentUv = clamp(currentUv, 0.001, 0.999);
              nextUv = clamp(nextUv, 0.001, 0.999);

              vec4 currentClean = texture2D(uTextureCurrent, baseUv);
              vec4 currentWarped = sampleSoft(
                uTextureCurrent,
                currentUv,
                uBlurAmount * (1.0 + suckPhaseRaw * 2.0)
              );
              vec4 currentTex = mix(currentClean, currentWarped, activateBlurIn);

              vec4 nextClean = texture2D(uTextureNext, baseUv);
              vec4 nextWarped = sampleSoft(
                uTextureNext,
                nextUv,
                uBlurAmount * (1.4 - revealPhaseRaw * 0.5)
              );

              float nextWarpMix = revealPhaseRaw * settleOutSoft;
              vec4 nextTex = mix(nextClean, nextWarped, nextWarpMix);

              float collapse = 1.0 - smoothstep(0.0, 0.5, t);
              float emerge = smoothstep(0.5, 1.0, t);

              float centerWeight = 1.0 - distToCenter;
              float magicCore = sin(t * 3.14159) * centerWeight * activatePulseIn * settleOutSoft;
              float pulseRing = smoothstep(0.28, 0.0, abs(distToCenter - 0.18)) * sin(t * 3.14159) * activatePulseIn * settleOutSoft;

              vec2 chromaDir = normalize(baseUv - 0.5);
              chromaDir = length(chromaDir) < 0.0001 ? vec2(1.0, 0.0) : chromaDir;

              vec3 nextChromatic;
              nextChromatic.r = texture2D(
                uTextureNext,
                clamp(nextUv + chromaDir * uChromatic * emerge * activateChromaticIn * settleOut, 0.001, 0.999)
              ).r;
              nextChromatic.g = texture2D(uTextureNext, nextUv).g;
              nextChromatic.b = texture2D(
                uTextureNext,
                clamp(nextUv - chromaDir * uChromatic * emerge * activateChromaticIn * settleOut, 0.001, 0.999)
              ).b;

              vec3 outgoing = currentTex.rgb * collapse;
              vec3 incomingBase = mix(nextTex.rgb, nextChromatic, emerge * 0.45 * activateChromaticIn * settleOut);
              vec3 incoming = mix(nextClean.rgb, incomingBase, settleOutSoft) * emerge;

              vec3 finalRgb = outgoing + incoming;
              finalRgb += vec3(0.16, 0.22, 0.45) * magicCore * uPulseStrength;
              finalRgb += vec3(0.10, 0.12, 0.22) * pulseRing * 0.45;

              float alphaTransition =
                mix(1.0, 0.22, suckPhase) +
                mix(0.0, 0.95, emerge);

              float finalAlpha = clamp(sphereFade * alphaTransition * uOpacity, 0.0, 1.0);

              gl_FragColor = vec4(finalRgb, finalAlpha);
            }
          `}
        />
      </mesh>

      <MagicAura />
      <OrbitingMagazines
        count={6}
        radius={3.8}
        tilt={[0, 0, 0]}
        y={0}
        scale={0.75}
      />
    </group>
  )
}

const MagicAura = () => {
  const glowTexture = useMemo(() => {
    const size = 1024
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size

    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.16,
      size / 2,
      size / 2,
      size * 0.5
    )

    gradient.addColorStop(0.0, "rgba(255,255,255,0.0)")
    gradient.addColorStop(0.52, "rgba(255,255,255,0.0)")
    gradient.addColorStop(0.78, "rgba(180,200,255,0.07)")
    gradient.addColorStop(1.0, "rgba(180,200,255,0.0)")

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])

  if (!glowTexture) return null

  return (
    <Billboard position={[0, 0, 0]}>
      <mesh renderOrder={1} scale={[8.2, 8.2, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={glowTexture}
          transparent
          depthWrite={false}
          opacity={1}
          color="#ffffff"
          blending={THREE.NormalBlending}
        />
      </mesh>
    </Billboard>
  )
}

type OrbitingCardsProps = {
  cards?: ComponentType[]
  radius?: number
  tilt?: [number, number, number]
  spin?: [number, number, number]
  y?: number
}

const OrbitingCards = ({
  cards = DEFAULT_ORBIT_CARDS,
  radius = 4.5,
  tilt = [0, 0, 0],
  spin = [0, 0.35, 0],
  y = 0,
}: OrbitingCardsProps) => {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!groupRef.current) return
    groupRef.current.rotation.x += delta * spin[0]
    groupRef.current.rotation.y += delta * spin[1]
    groupRef.current.rotation.z += delta * spin[2]
  })

  const positions = useMemo(
    () =>
      cards.map((_, i) => {
        const angle = (i / cards.length) * Math.PI * 2
        return {
          x: Math.cos(angle) * radius,
          z: Math.sin(angle) * radius,
        }
      }),
    [cards, radius]
  )

  return (
    <group rotation={tilt} position={[0, y, 0]}>
      <group ref={groupRef}>
        {cards.map((CardComponent, i) => (
          <Billboard
            key={i}
            position={[positions[i].x, 0.85, positions[i].z]}
            scale={0.4}
          >
            <Html
              transform
              distanceFactor={6}
              center
              occlude="blending"
              style={{ pointerEvents: "none", background: "transparent" }}
              wrapperClass="!bg-transparent"
            >
              <CardComponent />
            </Html>
          </Billboard>
        ))}
      </group>
    </group>
  )
}

type OrbitingMagazinesProps = {
  count?: number
  radius?: number
  tilt?: [number, number, number]
  y?: number
  scale?: number
}

const OrbitingMagazines = ({
  count = 4,
  radius = 5.2,
  tilt = [0, 0, 0],
  y = 0,
  scale = 0.4,
}: OrbitingMagazinesProps) => {
  const positions = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2
        return {
          x: Math.cos(angle) * radius,
          z: Math.sin(angle) * radius,
          rotY: -angle + Math.PI / 2,
        }
      }),
    [count, radius]
  )

  return (
    <group rotation={tilt} position={[0, y, 0]}>
      {positions.map((pos, i) => (
        <group
          key={i}
          position={[pos.x, 0, pos.z]}
          rotation={[0, pos.rotY, 0]}
          scale={scale}
        >
          <DeskMagazine autoSpin={false} />
        </group>
      ))}
    </group>
  )
}

type CircleImageSceneProps = {
  imageUrls?: string[]
  changeEvery?: number
  transitionDuration?: number
}

const CircleImageScene = ({
  imageUrls = DEFAULT_IMAGE_URLS,
  changeEvery = 3.8,
  transitionDuration = 1.65,
}: CircleImageSceneProps) => {
  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent">
      {/* Progressive backdrop blur behind the sphere */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[29.9rem] w-[29.9rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          backdropFilter: "blur(24px) saturate(1.15)",
          WebkitBackdropFilter: "blur(24px) saturate(1.15)",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.10) 28%, rgba(255,255,255,0.05) 48%, rgba(255,255,255,0.02) 62%, rgba(255,255,255,0.00) 78%)",
          maskImage:
            "radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0.96) 24%, rgba(0,0,0,0.74) 46%, rgba(0,0,0,0.34) 64%, rgba(0,0,0,0.10) 76%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0.96) 24%, rgba(0,0,0,0.74) 46%, rgba(0,0,0,0.34) 64%, rgba(0,0,0,0.10) 76%, rgba(0,0,0,0) 100%)",
          filter: "blur(0.5px)",
        }}
      />

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[36.8rem] w-[36.8rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          maskImage:
            "radial-gradient(circle, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.22) 38%, rgba(0,0,0,0.08) 60%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "radial-gradient(circle, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.22) 38%, rgba(0,0,0,0.08) 60%, rgba(0,0,0,0) 100%)",
        }}
      />

      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          outputColorSpace: THREE.SRGBColorSpace,
          alpha: true,
        }}
        camera={{
          position: [0, 0, 10],
          fov: 45,
          up: [0, 1, 0],
        }}
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
          position: "relative",
          zIndex: 1,
          pointerEvents: "auto",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(0x000000), 0)
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={3.5} color="#ffffff" />
          <hemisphereLight
            color="#ffffff"
            groundColor="#d7d7d7"
            intensity={2.5}
          />
          <directionalLight
            position={[0, 5, 8]}
            intensity={4}
            color="#ffffff"
          />
          <directionalLight
            position={[-6, 3, 4]}
            intensity={2.5}
            color="#ffffff"
          />
          <directionalLight
            position={[6, 3, 4]}
            intensity={2.5}
            color="#ffffff"
          />
          <CircleImage
            imageUrls={imageUrls}
            changeEvery={changeEvery}
            transitionDuration={transitionDuration}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default CircleImageScene
