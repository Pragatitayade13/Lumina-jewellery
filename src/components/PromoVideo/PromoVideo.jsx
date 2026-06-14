import { useRef, useEffect } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './PromoVideo.css';

export default function PromoVideo() {
  const videoRef = useRef(null);
  useScrollReveal();

  useEffect(() => {
    if (videoRef.current) {
      // Autoplay with intersection observer
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            videoRef.current.play().catch(e => console.log('Autoplay prevented:', e));
          } else {
            videoRef.current.pause();
          }
        },
        { threshold: 0.5 }
      );
      observer.observe(videoRef.current);
      return () => observer.disconnect();
    }
  }, []);

  return (
    <section className="promo-video-section">
      <div className="promo-video-container reveal">
        <video 
          ref={videoRef}
          className="promo-video"
          src="/hero_video_2.mp4"
          muted 
          loop 
          playsInline
          poster=""
        />
        <div className="promo-video-overlay">
          {/* Removed overlay content to prevent overlap with baked-in video text */}
        </div>
      </div>
    </section>
  );
}
