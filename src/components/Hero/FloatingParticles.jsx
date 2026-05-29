import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function FloatingParticles({ count = 30 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create particle elements
    const particles = [];
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'gold-particle';
      
      // Random initial properties
      const size = Math.random() * 3 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const opacity = Math.random() * 0.5 + 0.2;
      
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: var(--gold);
        border-radius: 50%;
        left: ${x}%;
        top: ${y}%;
        opacity: ${opacity};
        box-shadow: 0 0 ${size * 2}px var(--gold);
        pointer-events: none;
      `;
      
      container.appendChild(particle);
      particles.push(particle);
    }

    // Animate particles
    particles.forEach(particle => {
      gsap.to(particle, {
        y: `-=${Math.random() * 150 + 50}`,
        x: `+=${(Math.random() - 0.5) * 100}`,
        opacity: Math.random() * 0.8 + 0.2,
        duration: Math.random() * 10 + 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    });

    return () => {
      particles.forEach(p => p.remove());
    };
  }, [count]);

  return (
    <div 
      ref={containerRef} 
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1, pointerEvents: 'none' }}
    />
  );
}
