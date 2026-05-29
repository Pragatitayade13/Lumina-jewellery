import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Move cursor with GSAP for smooth interpolation
    const moveCursor = (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: "power2.out"
      });
    };

    const handleMouseOver = (e) => {
      const tag = e.target.tagName.toLowerCase();
      const isClickable = ['a', 'button', 'input', 'select', 'textarea'].includes(tag) || 
                          e.target.closest('a') || e.target.closest('button') || e.target.classList.contains('clickable');
      
      if (isClickable) {
        setIsHovering(true);
        gsap.to(cursor, { scale: 2, backgroundColor: 'rgba(201, 168, 76, 0.2)', borderColor: 'var(--gold)', duration: 0.3 });
      } else {
        setIsHovering(false);
        gsap.to(cursor, { scale: 1, backgroundColor: 'transparent', borderColor: 'var(--gold)', duration: 0.3 });
      }
    };

    window.addEventListener('mousemove', moveCursor);
    document.body.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.body.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <div 
      ref={cursorRef} 
      className="custom-cursor"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        border: '1px solid var(--gold)',
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(-50%, -50%)',
        transition: 'opacity 0.3s ease',
        mixBlendMode: 'difference' // Luxury effect over dark/light backgrounds
      }}
    />
  );
}
