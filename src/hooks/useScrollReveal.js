import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollReveal() {
  const location = useLocation();

  useEffect(() => {
    // Reveal Fade-up
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => {
      gsap.fromTo(el, 
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 100%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });

    // Reveal Left
    const revealLeftElements = document.querySelectorAll('.reveal-left');
    revealLeftElements.forEach((el) => {
      gsap.fromTo(el, 
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 100%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });

    // Reveal Right
    const revealRightElements = document.querySelectorAll('.reveal-right');
    revealRightElements.forEach((el) => {
      gsap.fromTo(el, 
        { x: 30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 100%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });

    // Staggered Masonry / Product Cards
    const staggerContainers = document.querySelectorAll('.stagger-container');
    staggerContainers.forEach((container) => {
      const children = container.querySelectorAll('.stagger-item');
      gsap.fromTo(children, 
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: container,
            start: 'top bottom',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });

    // Clipping Mask Reveal
    const clipElements = document.querySelectorAll('.clip-reveal-trigger');
    clipElements.forEach((el) => {
      gsap.fromTo(el,
        { clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)' },
        {
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          duration: 0.9,
          ease: 'power4.inOut',
          scrollTrigger: {
            trigger: el,
            start: 'top 95%',
            toggleActions: 'play none none none', // Only play once
          }
        }
      );
    });

    // Force ScrollTrigger to recalculate positions after DOM updates
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timeout);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [location.pathname]);
}
