import { useState, useRef, useEffect, Suspense } from 'react';
import { Camera, X, Download, ShoppingBag, Heart, ShieldAlert } from 'lucide-react';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useApp } from '../../context/AppContext';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import ARFaceTracker from './ARFaceTracker';
import ARHandTracker from './ARHandTracker';
import { db } from '../../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import './VirtualTryOn.css';

export default function VirtualTryOn({ isOpen, onClose, product }) {
  useScrollLock(isOpen);
  const { addToCart, toggleWishlist, isWishlisted, user, showToast } = useApp();
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const videoRef = useRef(null);
  const canvasContainerRef = useRef(null);

  // Track AR usage analytics
  useEffect(() => {
    if (isOpen && product) {
      logARUsage();
    }
    
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => stopCamera();
  }, [isOpen, product]);

  const logARUsage = async () => {
    try {
      await addDoc(collection(db, 'arAnalytics'), {
        productId: product.id || product.sku,
        productName: product.name,
        category: product.category,
        userId: user ? user.uid : 'anonymous',
        timestamp: new Date().toISOString(),
        device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
      });
    } catch (e) {
      console.error("Failed to log AR usage", e);
    }
  };

  const startCamera = async () => {
    setError('');
    setIsLoadingModel(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError('Camera access denied or unavailable. Please enable camera permissions to use Virtual Try-On.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = async () => {
    // Composite the video feed and the 3D canvas
    if (!videoRef.current || !canvasContainerRef.current) return;
    
    try {
      const video = videoRef.current;
      const threeCanvas = canvasContainerRef.current.querySelector('canvas');
      
      const compositeCanvas = document.createElement('canvas');
      compositeCanvas.width = video.videoWidth;
      compositeCanvas.height = video.videoHeight;
      const ctx = compositeCanvas.getContext('2d');
      
      // Draw video
      ctx.drawImage(video, 0, 0, compositeCanvas.width, compositeCanvas.height);
      
      // Draw 3D overlay if exists
      if (threeCanvas) {
         ctx.drawImage(threeCanvas, 0, 0, compositeCanvas.width, compositeCanvas.height);
      }
      
      const dataUrl = compositeCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `lumina-tryon-${product.sku || 'capture'}.png`;
      link.href = dataUrl;
      link.click();
      showToast('Snapshot saved!');
    } catch (e) {
      console.error("Snapshot failed", e);
      showToast('Failed to save snapshot', 'error');
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    showToast(`${product.name} added to cart from AR Try-On!`);
  };

  if (!isOpen) return null;

  const isFaceProduct = ['Necklace', 'Earrings', 'Earring'].includes(product?.category);
  const isHandProduct = ['Ring', 'Bracelet', 'Bangle'].includes(product?.category);

  return (
    <div className="vto-overlay">
      <div className="vto-modal">
        <div className="vto-header">
          <div className="vto-title">
            <Camera size={20} className="vto-icon" />
            <h3>Live AR Try-On</h3>
          </div>
          <button className="vto-close" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="vto-content">
          {error ? (
            <div className="vto-error">
              <ShieldAlert size={48} style={{ marginBottom: '1rem', color: '#e74c3c' }} />
              <p>{error}</p>
              <button className="btn btn-outline mt-1" onClick={startCamera}>Try Again</button>
            </div>
          ) : (
            <div className="vto-video-container" ref={canvasContainerRef}>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="vto-video"
                style={{ transform: 'scaleX(-1)' }} // Mirror video
              />
              
              {stream && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}>
                  <Canvas
                    camera={{ position: [0, 0, 10], fov: 50 }}
                    style={{ background: 'transparent', pointerEvents: 'none' }}
                    gl={{ alpha: true, preserveDrawingBuffer: true }}
                  >
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <Environment preset="city" />
                    
                    <Suspense fallback={null}>
                      {isFaceProduct && <ARFaceTracker videoRef={videoRef} product={product} onLoaded={() => setIsLoadingModel(false)} />}
                      {isHandProduct && <ARHandTracker videoRef={videoRef} product={product} onLoaded={() => setIsLoadingModel(false)} />}
                      {!isFaceProduct && !isHandProduct && (
                        // Fallback if category doesn't match
                        <ARFaceTracker videoRef={videoRef} product={product} onLoaded={() => setIsLoadingModel(false)} />
                      )}
                    </Suspense>
                  </Canvas>
                </div>
              )}

              {isLoadingModel && !error && (
                <div className="vto-loading-overlay">
                  <div className="spinner"></div>
                  <p>Loading AR Model...</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="vto-footer">
          <div className="vto-product-info">
            <h4>{product?.name}</h4>
            <div className="vto-price">₹{product?.price?.toLocaleString()}</div>
          </div>
          <div className="vto-actions" style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={capturePhoto} title="Take Snapshot">
              <Download size={18} /> Snapshot
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => toggleWishlist(product)}
              title={isWishlisted(product?.id) ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart size={18} fill={isWishlisted(product?.id) ? "var(--gold)" : "none"} color={isWishlisted(product?.id) ? "var(--gold)" : "currentColor"} />
            </button>
            <button className="btn btn-gold" onClick={handleAddToCart}>
              <ShoppingBag size={18} /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
