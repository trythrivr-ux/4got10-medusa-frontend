"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import PaperSceneWrapper from "@modules/home/components/paper-model/PaperSceneWrapper"
import type { PaperSceneRef } from "@modules/home/components/paper-model/index"


// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function LandingPageClient() {
  const [experienceStarted, setExperienceStarted] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([])
  const paperSceneRef = useRef<PaperSceneRef>(null)
  
  // Momentum animation state
  const momentumRef = useRef({
    velocity: 0,
    lastScrollY: 0,
    lastTime: 0,
    animationId: null as number | null
  })
  
  // Store scroll listener for cleanup
  const scrollListenerRef = useRef<(() => void) | null>(null)
  // Store position update timeout for cleanup
  const positionUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Start experience handler
  const handleStartExperience = () => {
    // Snap scroll to section 1 (index 1, which is the second section)
    const sectionHeight = window.innerHeight;
    const targetScroll = sectionHeight * 1;
    
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    // Add smooth scrolling to html/body (client-side only)
    if (typeof window !== "undefined") {
      document.documentElement.style.scrollBehavior = 'smooth'
      document.body.style.scrollBehavior = 'smooth'
    }

    // Debug log
    console.log('Effect running, containerRef:', containerRef.current, 'paperSceneRef:', paperSceneRef.current);
    
    // Wait for refs to be available
    const initializeAnimations = () => {
      if (!containerRef.current || !paperSceneRef.current) {
        console.log('Refs not ready, retrying...');
        setTimeout(initializeAnimations, 100);
        return;
      }
      
      console.log('Initializing animations...');
      
      // GSAP ScrollTrigger setup
      const sections = sectionsRef.current.filter(Boolean)
      console.log('Sections found:', sections.length);
      
      // Scroll snapping for all 5 sections
      ScrollTrigger.create({
        trigger: containerRef.current as HTMLElement,
        start: "top top",
        end: "bottom bottom",
        snap: {
          snapTo: 1 / 4, // 5 sections = 4 intervals (0, 0.25, 0.5, 0.75, 1.0)
          duration: 0.8,
          ease: "power2.inOut"
        }
      })

      // Animation state
      let isAnimating = false;
      let animationProgress = 0;
      let animationStartTime = 0;
      const ANIMATION_DURATION = 5000; // 5 seconds for full animation
      const TRIGGER_SCROLL_THRESHOLD = 100; // Trigger animation after 100px of scroll
      
      // Pinning state
      let isPinned = true; // Start pinned
      
      // Button state
      let showStartButton = true;
      
      // Initialize momentum state
      momentumRef.current.lastScrollY = window.scrollY;
      momentumRef.current.lastTime = Date.now();
      momentumRef.current.velocity = 0;
      
      const handleScroll = () => {
        if (!paperSceneRef.current || !containerRef.current) return;
        
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - momentumRef.current.lastScrollY;
        const containerHeight = containerRef.current.offsetHeight;
        const windowHeight = window.innerHeight;
        
        momentumRef.current.lastScrollY = currentScrollY;
        
        // Calculate which section we're in
        const sectionHeight = windowHeight;
        const currentSection = Math.floor(currentScrollY / sectionHeight);
        
        // Control pinning: pinned in sections 0-3, unpinned in section 4
        const shouldBePinned = currentSection < 4;
        
        if (shouldBePinned !== isPinned) {
          isPinned = shouldBePinned;
          updateScenePosition(currentScrollY, sectionHeight);
        }
        
                
        // Control start button: visible only in section 0
        const shouldShowStartButton = currentSection === 0;
        if (shouldShowStartButton !== showStartButton) {
          showStartButton = shouldShowStartButton;
          updateStartButtonVisibility();
        }
        
        // 3D scene always visible (animation starts from off-screen position)
        updateSceneVisibility(true);
        
        // Update gradient colors based on section
        updateGradientColors(currentSection);
        
        // ─── SCROLL-DRIVEN ANIMATION ───
        // Sections 0+1+2: curve path animation, scrollProgress 0→1
        // Section 3: bend animation
        // Section 4: reset + unpin
        if (currentSection <= 2) {
          // Scroll from top of page to bottom of section 2 → progress 0 to 1
          const animEnd = sectionHeight * 3;       // bottom of section 2
          const progress = currentScrollY / animEnd;
          paperSceneRef.current.setScrollProgress(Math.max(0, Math.min(1, progress)));
          paperSceneRef.current.setBendAmount(0);
        } else if (currentSection === 3) {
          paperSceneRef.current.setScrollProgress(1);
          const sectionProgress = (currentScrollY - sectionHeight * 3) / sectionHeight;
          const bendValue = Math.sin(Math.min(1, Math.max(0, sectionProgress)) * Math.PI) * 6;
          paperSceneRef.current.setBendAmount(bendValue);
        } else if (currentSection >= 4) {
          paperSceneRef.current.setScrollProgress(0);
          paperSceneRef.current.setBendAmount(0);
        }
      };
      
      const updateScenePosition = (scrollY: number, sectionHeight: number) => {
        if (!containerRef.current) return;
        
        const scene3D = containerRef.current.querySelector('.fixed-3d-scene') as HTMLElement;
        const gradientBg = containerRef.current.querySelector('.gradient-background') as HTMLElement;
        
        if (!scene3D || !gradientBg) return;
        
        // Always ensure proper dimensions
        scene3D.style.width = '100vw';
        scene3D.style.height = '100vh';
        scene3D.style.maxHeight = '100vh';
        scene3D.style.overflow = 'hidden';
        
        gradientBg.style.width = '100vw';
        gradientBg.style.height = '100vh';
        gradientBg.style.maxHeight = '100vh';
        gradientBg.style.overflow = 'hidden';
        
        // Add smooth transitions for visibility changes
        scene3D.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        gradientBg.style.transition = 'opacity 0.3s ease-out'; // No transform transition for gradient
        
        if (isPinned) {
          // Fixed positioning - always fill viewport
          scene3D.style.position = 'fixed';
          scene3D.style.top = '0';
          scene3D.style.left = '0';
          scene3D.style.bottom = 'auto';
          scene3D.style.right = 'auto';
          scene3D.style.transform = 'none';
          
          gradientBg.style.position = 'fixed';
          gradientBg.style.top = '0';
          gradientBg.style.left = '0';
          gradientBg.style.bottom = 'auto';
          gradientBg.style.right = 'auto';
          gradientBg.style.transform = 'none';
        } else {
          // Absolute positioning - positioned at section 5 start (index 4)
          // This makes the scene scroll away naturally with the page
          scene3D.style.position = 'absolute';
          scene3D.style.top = `${sectionHeight * 4}px`;
          scene3D.style.left = '0';
          scene3D.style.bottom = 'auto';
          scene3D.style.right = 'auto';
          scene3D.style.transform = 'none';
          
          gradientBg.style.position = 'absolute';
          gradientBg.style.top = `${sectionHeight * 4}px`;
          gradientBg.style.left = '0';
          gradientBg.style.bottom = 'auto';
          gradientBg.style.right = 'auto';
          gradientBg.style.transform = 'translateX(0)';
        }
      };
      
            
      const updateStartButtonVisibility = () => {
        if (!containerRef.current) return;
        
        const startButton = containerRef.current.querySelector('.start-experience-btn') as HTMLElement;
        if (!startButton) return;
        
        if (showStartButton) {
          startButton.style.opacity = '1';
          startButton.style.pointerEvents = 'auto';
        } else {
          startButton.style.opacity = '0';
          startButton.style.pointerEvents = 'none';
        }
      };
      
      const updateSceneVisibility = (shouldShow: boolean) => {
        if (!containerRef.current) return;
        
        const scene3D = containerRef.current.querySelector('.fixed-3d-scene') as HTMLElement;
        if (!scene3D) return;
        
        if (shouldShow) {
          // Animate in from outside the canvas
          scene3D.style.opacity = '1';
          scene3D.style.transform = 'translateX(0)';
          scene3D.style.pointerEvents = 'none';
        } else {
          // Position outside the canvas (hidden)
          scene3D.style.opacity = '0';
          scene3D.style.transform = 'translateX(-100vw)';
          scene3D.style.pointerEvents = 'none';
        }
      };
      
      const updateGradientVisibility = (shouldShow: boolean) => {
        if (!containerRef.current) return;
        
        const gradientBg = containerRef.current.querySelector('.gradient-background') as HTMLElement;
        if (!gradientBg) return;
        
        if (shouldShow) {
          // Gradient appears instantly, no slide animation
          gradientBg.style.opacity = '1';
          gradientBg.style.transform = 'translateX(0)';
          gradientBg.style.pointerEvents = 'none';
          gradientBg.style.transition = 'opacity 0.3s ease-out'; // Only fade, no transform
        } else {
          // Gradient disappears instantly, no slide animation
          gradientBg.style.opacity = '0';
          gradientBg.style.transform = 'translateX(0)'; // Stay in place
          gradientBg.style.pointerEvents = 'none';
          gradientBg.style.transition = 'opacity 0.3s ease-out'; // Only fade, no transform
        }
      };
      
      const updateGradientColors = (section: number) => {
        if (!containerRef.current) return;
        
        const gradientOverlay = containerRef.current.querySelector('.gradient-overlay') as HTMLElement;
        if (!gradientOverlay) return;
        
        if (section === 0 || section === 1) {
          // Sections 1 & 2: Hide overlay (show base gradient)
          gradientOverlay.style.opacity = '0';
        } else if (section === 2) {
          // Section 3: Fade in overlay (blend with base gradient)
          gradientOverlay.style.opacity = '1';
        }
      };
      
            
      const startAnimation = () => {
        if (isAnimating || !paperSceneRef.current) return;
        
        isAnimating = true;
        animationStartTime = Date.now();
        animationProgress = 0;
        
        console.log('Starting full animation sequence');
        
        // Cancel any existing animation
        if (momentumRef.current.animationId) {
          cancelAnimationFrame(momentumRef.current.animationId);
        }
        
        animateFullSequence();
      };
      
      const animateFullSequence = () => {
        if (!paperSceneRef.current) return;
        
        const currentTime = Date.now();
        const elapsed = currentTime - animationStartTime;
        const rawProgress = Math.min(elapsed / ANIMATION_DURATION, 1); // 0 to 1 over duration
        
        // Animate from 0 to 1 and STAY at 1 (no close phase)
        // Apply easing for smooth ramp up
        const easedProgress = Math.sin(rawProgress * Math.PI / 2);
        const finalProgress = easedProgress * easedProgress * (3.0 - 2.0 * easedProgress);
        
        paperSceneRef.current.setScrollProgress(finalProgress);
        
        // Continue animation if not complete
        if (rawProgress < 1) {
          momentumRef.current.animationId = requestAnimationFrame(animateFullSequence);
        } else {
          // Animation complete — stays at scrollProgress = 1
          paperSceneRef.current.setScrollProgress(1);
          isAnimating = false;
          momentumRef.current.animationId = null;
          console.log('Animation sequence complete');
        }
      };
      
      // Start scroll listener
      const scrollListener = () => {
        console.log('Scroll event detected!');
        handleScroll();
      };
      
      window.addEventListener('scroll', scrollListener, { passive: true });
      scrollListenerRef.current = scrollListener;
      
      console.log('Animations initialized! Scroll listener attached.');
      
      // Set initial animation state to closed
      if (paperSceneRef.current) {
        paperSceneRef.current.setScrollProgress(0);
        console.log('Set initial animation state: closed');
      }
      
      // Initialize 3D scene position and UI elements
      updateScenePosition(window.scrollY, window.innerHeight);
      updateStartButtonVisibility();
      updateSceneVisibility(false); // Start hidden in section 0
      updateGradientVisibility(true); // Always visible from start
      updateGradientColors(0); // Start with Section 1 colors
    };
    
    initializeAnimations();

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      if (scrollListenerRef.current) {
        window.removeEventListener('scroll', scrollListenerRef.current)
      }
      if (momentumRef.current.animationId) {
        cancelAnimationFrame(momentumRef.current.animationId)
      }
      if (positionUpdateTimeoutRef.current) {
        clearTimeout(positionUpdateTimeoutRef.current)
      }
    }
  }, [])

  
  return (
    <div ref={containerRef} className="relative w-full" style={{ height: '500vh' }}>
      {/* Gradient Background - behind 3D scene */}
      <div 
        className="gradient-background fixed inset-0 w-full h-full opacity-100 pointer-events-none z-0" 
        style={{
          background: 'linear-gradient(180deg, #F7F7F7 0%, #E6F6F2 100%)',
          position: 'relative'
        }}
      >
        {/* Pseudo-element overlay for smooth gradient transition */}
        <div 
          style={{  
            position: 'absolute',
            inset: 0,
            background: '#EEEEEE',
            opacity: 0,
            transition: 'opacity 1.5s ease-in-out',
            pointerEvents: 'none',
            zIndex: 1
          }}
          className="gradient-overlay"
        />
      </div>
      
      {/* Fixed 3D Scene - stays in viewport */}
      <div className="fixed-3d-scene fixed inset-0 w-full h-full opacity-100 pointer-events-none z-5">
        <PaperSceneWrapper ref={paperSceneRef} />
      </div>

      
      {/* Section 1: Start Experience */}
      <div ref={el => { if (el) sectionsRef.current[0] = el }} className="h-screen w-full bg-transparent flex items-center justify-center">
        <div className="text-center z-10 relative">
          <h1 className="text-white text-6xl font-bold mb-8 font-[family-name:var(--font-jersey)]">
            Interactive Magazine
          </h1>
          <p className="text-white/80 text-xl mb-12 font-[family-name:var(--font-kumbh)]">
            Experience our magazine in a whole new dimension
          </p>
          <button 
            onClick={handleStartExperience}
            className="start-experience-btn bg-white text-black px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 hover:bg-white/90 font-[family-name:var(--font-inter)]"
          >
            Start Experience
          </button>
        </div>
      </div>

      {/* Section 2: 3D Magazine Experience */}
      <div ref={el => { if (el) sectionsRef.current[1] = el }} className="h-screen w-full bg-transparent flex items-center justify-center">
        <div className="text-center text-white z-10">
          <h2 className="text-3xl font-bold mb-2 font-[family-name:var(--font-jersey)]">Explore</h2>
          <p className="text-white/80 font-[family-name:var(--font-kumbh)]">Scroll to continue your journey</p>
        </div>
      </div>

      {/* Section 3: Magazine Flip */}
      <div ref={el => { if (el) sectionsRef.current[2] = el }} className="h-screen w-full bg-transparent flex items-center justify-center">
        <div className="text-center text-white z-10">
          <h2 className="text-3xl font-bold mb-2 font-[family-name:var(--font-jersey)]">Flip Through</h2>
          <p className="text-white/80 font-[family-name:var(--font-kumbh)]">Watch the pages come alive</p>
        </div>
      </div>

      {/* Section 4: Bend */}
      <div ref={el => { if (el) sectionsRef.current[3] = el }} className="h-screen w-full bg-transparent flex items-center justify-center">
        <div className="text-center text-white z-10">
          <h2 className="text-3xl font-bold mb-2 font-[family-name:var(--font-jersey)]">Feel the Pages</h2>
          <p className="text-white/80 font-[family-name:var(--font-kumbh)]">Experience the magazine flex</p>
        </div>
      </div>

      {/* Section 5: Call to Action (unpin) */}
      <div ref={el => { if (el) sectionsRef.current[4] = el }} className="h-screen w-full bg-transparent flex items-center justify-center">
        <div className="text-center max-w-4xl px-8">
          <h2 className="text-white text-5xl font-bold mb-6 font-[family-name:var(--font-jersey)]">
            Ready for More?
          </h2>
          <p className="text-white/80 text-xl mb-8 font-[family-name:var(--font-kumbh)]">
            Discover our full collection and bring home your favorite pieces
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors font-[family-name:var(--font-inter)]">
              Shop Collection
            </button>
            <button className="border border-white text-white px-6 py-3 rounded-full font-bold hover:bg-white hover:text-black transition-colors font-[family-name:var(--font-inter)]">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
