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
          src="https://template.canva.com/EAGsXwSDdUk/2/document_1440w-Fjnbdu4HcPk.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUH7DHWAQDT%2F20260608%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260608T203948Z&X-Amz-Expires=75672&X-Amz-Signature=1bb3b3a331874f056f9e4630b9435b590ae83bbe31b60f934b4bd38fa60c6e5a&X-Amz-SignedHeaders=host%3Bx-amz-expected-bucket-owner&response-expires=Tue%2C%2009%20Jun%202026%2017%3A41%3A00%20GMT"
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
