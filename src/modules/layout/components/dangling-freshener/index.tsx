"use client"

import { useEffect, useRef } from 'react';

interface DanglingFreshenerProps {
  logoSrc: string;
}

const DanglingFreshener = ({ logoSrc }: DanglingFreshenerProps) => {
  const freshenerRef = useRef<HTMLDivElement>(null);
  const angle = useRef(0);

  useEffect(() => {
    const animate = () => {
      angle.current += 0.02;
      const sway = Math.sin(angle.current) * 0.1;
      if (freshenerRef.current) {
        freshenerRef.current.style.transform = `translateX(${sway * 20}px) rotate(${sway}rad)`;
      }
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{ width: 2, height: 100, background: '#333', position: 'absolute', top: 0 }} /> {/* String */}
      <div
        ref={freshenerRef}
        style={{
          position: 'relative',
          top: 100,
          width: 80,
          height: 120,
          background: '#f0e68c',
          borderRadius: '10px',
          border: '2px solid #8b4513',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          transformOrigin: 'top center'
        }}
      >
        <img src={logoSrc} alt="Logo" style={{ maxWidth: '70%', maxHeight: '70%' }} />
      </div>
    </div>
  );
};

export default DanglingFreshener;
