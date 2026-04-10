"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71;
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;
const NUM_PAGES = 20;

// Create page geometry with bones for page curl effect
const createPageGeometry = () => {
  const geometry = new THREE.BoxGeometry(
    PAGE_WIDTH,
    PAGE_HEIGHT,
    PAGE_DEPTH,
    PAGE_SEGMENTS,
    1,
    1
  );
  geometry.translate(PAGE_WIDTH / 2, 0, 0); // Pivot at spine

  const position = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  const skinIndexes: number[] = [];
  const skinWeights: number[] = [];

  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const x = vertex.x;
    const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH));
    const skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;
    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
  }

  geometry.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(skinIndexes, 4));
  geometry.setAttribute("skinWeight", new THREE.Float32BufferAttribute(skinWeights, 4));

  return geometry;
};

interface PaperProps {
  currentState?: number;
  scrollProgress?: number; // 0 = closed, 1 = fully open
  leafIntensity?: number;  // 0 = off, 1 = full "leaf" motion
  bendAmount?: number;     // 0 = flat, positive = bend upward, negative = bend downward
  frontCover?: string;     // URL for front cover image
  backCover?: string;      // URL for back cover image
}

export const Paper = ({ 
  currentState, 
  scrollProgress = 0, 
  leafIntensity = 0,
  bendAmount = 0,
  frontCover,
  backCover
}: PaperProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const pagesRef = useRef<THREE.Group[]>([]);
  const dampedBendRef = useRef(0);
  
  const [animProgress, setAnimProgress] = React.useState<{ main: number; curve: number }>({ main: 0, curve: 0 });

  // Create pages with textures (images or placeholders)
  const pages = useMemo(() => {
    return Array.from({ length: NUM_PAGES }, (_, i) => {
      let texturePath: string;
      if (i === 0) {
        // Front cover - use product image if provided
        texturePath = frontCover || '/textures/left-page.jpg';
      } else if (i === NUM_PAGES - 1) {
        // Back cover - use product image if provided
        texturePath = backCover || '/textures/right-page.jpg';
      } else {
        texturePath = `/textures/page-${i + 1}.jpg`;
      }
      
      // Create material first so we can update it in callbacks
      const material = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        roughness: 0.4,
        metalness: 0.05,
        envMapIntensity: 0.3,
      });
      
      // Check if URL is external (needs CORS)
      const isExternalUrl = texturePath.startsWith('http://') || texturePath.startsWith('https://');
      
      // Load texture with proper callbacks and CORS support
      const loader = new THREE.TextureLoader();
      if (isExternalUrl) {
        loader.setCrossOrigin('anonymous');
      }
      
      const texture = loader.load(
        texturePath,
        (loadedTexture) => {
          // Success callback
          console.log(`Texture loaded successfully for page ${i}:`, texturePath);
          loadedTexture.colorSpace = THREE.SRGBColorSpace;
          material.map = loadedTexture;
          material.needsUpdate = true;
        },
        undefined,
        (error) => {
          // Error callback - create placeholder
          console.warn(`Failed to load texture for page ${i}:`, texturePath, error);
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 512;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 512, 512);
            ctx.fillStyle = '#333333';
            ctx.font = '32px Arial';
            ctx.textAlign = 'center';
            const label = i === 0 ? 'Front Cover' : i === NUM_PAGES - 1 ? 'Back Cover' : `Page ${i + 1}`;
            ctx.fillText(label, 256, 256);
          }
          const placeholderTexture = new THREE.CanvasTexture(canvas);
          placeholderTexture.colorSpace = THREE.SRGBColorSpace;
          material.map = placeholderTexture;
          material.needsUpdate = true;
        }
      );
      texture.colorSpace = THREE.SRGBColorSpace;
      
      // Set initial texture
      material.map = texture;
      
      const bones: THREE.Bone[] = [];
      for (let j = 0; j <= PAGE_SEGMENTS; j++) {
        const bone = new THREE.Bone();
        bones.push(bone);
        if (j === 0) {
          bone.position.x = 0;
        } else {
          bone.position.x = SEGMENT_WIDTH;
        }
        if (j > 0) {
          bones[j - 1].add(bone);
        }
      }
      
      const skeleton = new THREE.Skeleton(bones);
      const geometry = createPageGeometry();
      
      const mesh = new THREE.SkinnedMesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      mesh.add(skeleton.bones[0]);
      mesh.bind(skeleton);
      
      return { mesh, skeleton };
    });
  }, [frontCover, backCover]);

  // Custom animation loop
  useEffect(() => {
    let start = performance.now();
    let phase = 0;
    let rafId: number;

    const phases = [
      { duration: 2500, from: 0, to: 1 },
      { duration: 5000, from: 1, to: 0 },
      { duration: 3000, from: 0, to: 0.32 },
      { duration: 3000, from: 0.32, to: 0.18 },
      { duration: 2500, from: 0.18, to: 0 },
      { duration: 3500, from: 0, to: 1 },
    ];

    function animate(now: number) {
      const elapsed = now - start;
      const { duration, from, to } = phases[phase];
      let t = Math.min(elapsed / duration, 1);
      t = 0.5 * (1 - Math.cos(Math.PI * t));
      const animState = { main: 0, curve: 0 };
      if (phase < phases.length - 1) {
        animState.main = from + (to - from) * t;
        animState.curve = 0;
      } else {
        animState.main = 0;
        animState.curve = t;
      }
      setAnimProgress(animState);
      if (elapsed >= duration) {
        phase = (phase + 1) % phases.length;
        start = now;
      }
      rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [currentState]);

  // ─── CURVE PATH ───
  // The magazine follows a smooth Catmull-Rom spline through these 3D points.
  // At progress 0, it's centered in front of camera, straight and flat.
  
  // Simple unit-scale curve (positions will be scaled in useFrame)
  const curvePath = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),       // A: centered in front of camera (start)
      new THREE.Vector3(0, 0.3, 0.1),   // B: slight movement
      new THREE.Vector3(0.2, 0.6, 0.2), // C: swing right
      new THREE.Vector3(-0.2, 0.9, 0.3),// D: swing left
      new THREE.Vector3(0, 1.2, 0.4),   // E: center higher
      new THREE.Vector3(0, 1.5, 0.5),   // F: higher still
    ], false, 'catmullrom', 0.5);
  }, []);

  // Per-point animation data (matched to curve points above)
  const animData = useMemo(() => [
    { rotation: { x: 0, y: 0, z: 0 },    pageFlip: 0,   bend: 0 },  // A: centered, straight, flat
    { rotation: { x: 0, y: 0, z: 0.05 }, pageFlip: 0,   bend: 0 },  // B: slight tilt
    { rotation: { x: -0.1, y: 0.1, z: 0.1 }, pageFlip: 0, bend: 1 },// C: starting to animate
    { rotation: { x: 0.1, y: -0.2, z: -0.1 }, pageFlip: 0.3, bend: 2 },// D: more animation
    { rotation: { x: -0.1, y: 0.2, z: 0.05 }, pageFlip: 0.7, bend: 1 },// E: pages flipping
    { rotation: { x: 0, y: 0, z: 0 },    pageFlip: 1.0, bend: 0 },  // F: fully flipped
  ], []);

  // Interpolate animation data for a given progress (0–1)
  const interpolateCurve = (progress: number) => {
    const p = Math.max(0, Math.min(1, progress));
    
    // Get position from the smooth Catmull-Rom curve
    const position = curvePath.getPointAt(p);
    
    // Interpolate animation data linearly between the nearest two data points
    const numPoints = animData.length;
    const scaledT = p * (numPoints - 1);
    const idx = Math.min(Math.floor(scaledT), numPoints - 2);
    const localT = scaledT - idx;
    // Smooth easing for the local interpolation
    const eased = 0.5 * (1 - Math.cos(Math.PI * localT));
    
    const from = animData[idx];
    const to = animData[idx + 1];
    
    return {
      position: { x: position.x, y: position.y, z: position.z },
      rotation: {
        x: from.rotation.x + (to.rotation.x - from.rotation.x) * eased,
        y: from.rotation.y + (to.rotation.y - from.rotation.y) * eased,
        z: from.rotation.z + (to.rotation.z - from.rotation.z) * eased,
      },
      pageFlip: from.pageFlip + (to.pageFlip - from.pageFlip) * eased,
      bend: from.bend + (to.bend - from.bend) * eased,
    };
  };

  // Update pages each frame based on scroll progress
  useFrame((state) => {
    if (!groupRef.current) return;

    const delta = state.clock.getDelta();
    const elapsed = state.clock.elapsedTime;
    const progress = scrollProgress;

    // ─── INTERPOLATE CURVE PATH ───
    const frame = interpolateCurve(progress);

    // Calculate proper distance to fill viewport height
    const camera = state.camera as THREE.PerspectiveCamera;
    const fov = camera.fov * Math.PI / 180;
    
    // We want the magazine (PAGE_HEIGHT) to fill 85% of viewport
    const targetViewportHeight = state.viewport.height * 0.85;
    
    // Calculate distance: we want PAGE_HEIGHT to appear as targetViewportHeight
    // At distance D, an object of height H appears as height = H * (viewportHeightAtDistance1 / D)
    // So: targetViewportHeight = PAGE_HEIGHT * (viewportHeightAtDistance1 / distance)
    // distance = PAGE_HEIGHT * (viewportHeightAtDistance1 / targetViewportHeight)
    const viewportHeightAtDistance1 = 2 * Math.tan(fov / 2); // Height of viewport at distance 1
    const distance = PAGE_HEIGHT * (viewportHeightAtDistance1 / targetViewportHeight);
    
    // Position at calculated distance from camera
    // Offset X by -PAGE_WIDTH/2 to center the magazine (geometry pivots at spine/left edge)
    groupRef.current.position.set(
      frame.position.x - PAGE_WIDTH / 2, 
      frame.position.y, 
      -distance + frame.position.z // Negative Z = toward camera
    );
    
    // Scale to 1:1 (let distance control size)
    groupRef.current.scale.set(1, 1, 1);

    // Apply rotation directly (no damping)
    // Add leaf swing on top if leafIntensity > 0
    const swingAmount = 0.2 * leafIntensity;
    const swingSpeed = 0.6;
    const leafSwingX = Math.sin(elapsed * swingSpeed * 0.7) * swingAmount * 0.5;
    const leafSwingZ = Math.sin(elapsed * swingSpeed) * swingAmount;

    // Camera-relative rotation: match camera orientation + animation rotation
    // This keeps the magazine pinned to screen orientation
    groupRef.current.rotation.x = frame.rotation.x + leafSwingX;
    groupRef.current.rotation.y = frame.rotation.y; // Y rotation affects screen-facing
    groupRef.current.rotation.z = frame.rotation.z + leafSwingZ;

    // Set bend directly (keyframe bend + prop bend)
    dampedBendRef.current = frame.bend + bendAmount;

    // ─── BOOK-STYLE PAGE FLIPPING ───
    // Think of a real book:
    //   - All pages are bound together at the spine (x=0)
    //   - Pages are stacked on top of each other at the spine
    //   - When you flip a page, it rotates 180° around the spine
    //   - The spine point NEVER moves — only the free edge swings over
    //   - Page 0 (front cover) is on top, flips first
    //   - Each page flips one by one after the previous
    const flipProgress = frame.pageFlip;

    // Per-page window size: outer pages get wider windows (slower), middle pages narrower (faster)
    const pageWindowSize = (idx: number) => {
      const center = (NUM_PAGES - 1) / 2;
      const dist = Math.abs(idx - center) / center; // 0 at center, 1 at edges
      // Edges get 4x the base window, center gets 1.5x (all slower overall)
      return 1.5 + dist * 2.5;
    };

    // Calculate total weighted size to normalize windows so they still sum to 1.0
    let totalWeight = 0;
    for (let i = 0; i < NUM_PAGES; i++) totalWeight += pageWindowSize(i);

    pages.forEach((page, index) => {
      const group = pagesRef.current[index];
      if (!group) return;

      // ─── SEQUENTIAL FLIP TIMING ───
      // Each page gets a variable-width slice of flipProgress
      // Outer pages get wider slices (slower flip), middle pages narrower (faster)
      let pageStart = 0;
      for (let i = 0; i < index; i++) pageStart += pageWindowSize(i) / totalWeight;
      const pageRange = pageWindowSize(index) / totalWeight;

      // How far through THIS page's flip (0 = not started, 1 = fully flipped)
      const rawT = Math.max(0, Math.min(1,
        (flipProgress - pageStart) / pageRange
      ));

      // Smooth easing per page flip
      const pageT = 0.5 * (1 - Math.cos(Math.PI * rawT));

      // ─── ROTATION ───
      // 0 = closed (page extends to the right)
      // -PI = flipped (page extends to the left)
      group.rotation.y = -pageT * Math.PI;

      // ─── Z-STACKING (reverse order when flipped) ───
      // Before flip: page 0 on top (highest z), page 19 at bottom
      //   top: 1, 2, 3, 4, 5 :bottom
      // After flip: page 0 at bottom, page 19 on top (reversed)
      //   bottom: 1, 2, 3, 4, 5 :top
      // Each page lerps its z from its "unflipped" position to its "flipped" position
      const gap = PAGE_DEPTH * 0.5;
      const unflippedZ = (NUM_PAGES - 1 - index) * gap;  // page 0 = highest z (top)
      const flippedZ = index * gap;                        // page 0 = lowest z (bottom)
      group.position.z = THREE.MathUtils.lerp(unflippedZ, flippedZ, pageT);

      // ─── BONE BENDING (paper curl during flip) ───
      const bones = page.skeleton.bones;
      const midFlip = Math.sin(pageT * Math.PI); // peaks when page is vertical (90°)
      const bendIntensity = midFlip * 0.05;

      for (let i = 0; i < PAGE_SEGMENTS; i++) {
        const segmentProgress = i / PAGE_SEGMENTS;

        // Paper curl: outer edge bends more, like real paper catching air
        const curlY = Math.sin(segmentProgress * Math.PI * 0.7) * bendIntensity;

        // Slight gravity droop at the tip
        const droop = segmentProgress * segmentProgress * midFlip * 0.04;

        // Magazine bend: uniform Y-rotation per bone segment
        // Every bone gets the same small rotation, which accumulates across all 30 segments
        // into a smooth arc — like bending the whole magazine as one solid piece
        const bendPerBone = dampedBendRef.current * 0.025;

        // Leaf wave (gated by leafIntensity)
        const wavePhase = elapsed * 2.0 + segmentProgress * 3.0 + index * 0.3;
        const waveAmount = Math.sin(wavePhase) * 0.12 * leafIntensity;
        const leafBend = Math.sin(segmentProgress * Math.PI) * 0.18 * leafIntensity;

        bones[i].rotation.y = curlY + waveAmount * 0.5 + bendPerBone;
        bones[i].rotation.z = droop + leafBend;
      }
    });
  });

  return (
    <>
      {/* Ground plane removed for better visibility */}

      {/* Book */}
      <group ref={groupRef} position={[0, 0, 0]}>
        {pages.map((page, index) => {
          // All pages bound at the spine (x=0). Z-position managed by useFrame.
          return (
            <group
              key={index}
              ref={(el) => {
                if (el) pagesRef.current[index] = el;
              }}
              position={[0, 0, 0]}
            >
              <primitive object={page.mesh} />
            </group>
          );
        })}
      </group>
    </>
  );
};
