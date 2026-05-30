import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useApp } from '../../context/AppContext';

export default function AdminBackground() {
  const { theme } = useApp();
  const smokeRef = useRef(null);
  const starsRef = useRef(null);

  useEffect(() => {
    // Smoke / Nebula slow breathing effect
    gsap.to(smokeRef.current, {
      scale: 1.2,
      opacity: 0.8,
      duration: 15,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });

    // Twinkling stars effect
    const stars = starsRef.current.children;
    gsap.set(stars, { opacity: 0, scale: 0 });
    
    Array.from(stars).forEach(star => {
      gsap.to(star, {
        opacity: () => Math.random() * 0.8 + 0.2,
        scale: () => Math.random() * 1.5 + 0.5,
        duration: () => Math.random() * 3 + 2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: () => Math.random() * 5
      });
    });
  }, []);

  // Theme-specific styles
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#050816' : '#FDFBF7';
  const nebulaColor = isDark ? 'radial-gradient(ellipse at 50% 50%, rgba(16,43,70,0.6) 0%, transparent 60%)' : 'radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.15) 0%, transparent 60%)';
  const marbleColor = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: bgColor, overflow: 'hidden', pointerEvents: 'none' }}>
      
      {/* Background SVG Marble / Noise Texture */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5 }}>
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" fill={marbleColor}/>
      </svg>

      {/* Nebula / Smoke Glow */}
      <div 
        ref={smokeRef}
        style={{ 
          position: 'absolute', 
          top: '-20%', 
          left: '-10%', 
          width: '140%', 
          height: '140%', 
          background: nebulaColor,
          filter: 'blur(60px)',
          opacity: 0.5
        }} 
      />

      {/* Sparkles / Particles */}
      <div ref={starsRef} style={{ position: 'absolute', inset: 0 }}>
        {[...Array(30)].map((_, i) => (
          <div 
            key={i}
            style={{
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: '4px',
              height: '4px',
              background: isDark ? '#FFF' : '#D4AF37',
              borderRadius: '50%',
              boxShadow: isDark ? '0 0 10px #FFF' : '0 0 10px #D4AF37'
            }}
          />
        ))}
      </div>
    </div>
  );
}
