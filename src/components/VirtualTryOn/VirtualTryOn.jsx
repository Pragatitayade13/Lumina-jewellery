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
import { useProducts } from '../../hooks/useProducts';
import './VirtualTryOn.css';

export default function VirtualTryOn({ isOpen, onClose, product }) {
  useScrollLock(isOpen);
  const { addToCart, toggleWishlist, isWishlisted, user, showToast } = useApp();
  const { products } = useProducts();
  const [activeProduct, setActiveProduct] = useState(product);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [fps, setFps] = useState(0);
  const videoRef = useRef(null);
  const canvasContainerRef = useRef(null);

  // Fallback viewer component
  const StaticFallbackViewer = ({ product }) => (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#fff', position: 'relative' }}>
      <img src={product?.image} alt={product?.name} style={{ maxWidth: '80%', maxHeight: '60%', objectFit: 'contain', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }} />
      <div style={{ marginTop: '2rem', textAlign: 'center', padding: '0 2rem' }}>
        <h3 style={{ color: '#c9a84c', marginBottom: '0.5rem' }}>Static Preview</h3>
        <p style={{ fontSize: '0.9rem', color: '#aaa', maxWidth: '300px', margin: '0 auto' }}>
          Live AR is currently unavailable or unsupported on this device. Showing 2D preview.
        </p>
      </div>
    </div>
  );

  // Sync prop changes (if any external changes happen)
  useEffect(() => {
    if (product) setActiveProduct(product);
  }, [product]);

  // Track AR usage analytics
  useEffect(() => {
    if (isOpen && activeProduct) {
      logARUsage();
    }
    
    if (isOpen) {
      startCamera();
      
      // Safety: if model never calls onLoaded, clear loading state after 8s
      const safetyTimer = setTimeout(() => {
        setIsLoadingModel(false);
      }, 8000);
      
      // FPS Calculation
      let frameCount = 0;
      let lastTime = performance.now();
      const calcFps = () => {
        const now = performance.now();
        frameCount++;
        if (now - lastTime >= 1000) {
          setFps(Math.round((frameCount * 1000) / (now - lastTime)));
          frameCount = 0;
          lastTime = now;
        }
        if (isOpen) requestAnimationFrame(calcFps);
      };
      requestAnimationFrame(calcFps);
      return () => { stopCamera(); clearTimeout(safetyTimer); };
    } else {
      stopCamera();
    }
    
    return () => stopCamera();
  }, [isOpen, product]);

  const logARUsage = async () => {
    try {
      await addDoc(collection(db, 'arAnalytics'), {
        productId: activeProduct.id || activeProduct.sku,
        productName: activeProduct.name,
        category: activeProduct.category,
        userId: user ? user.uid : 'anonymous',
        timestamp: new Date().toISOString(),
        device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
      });
    } catch (e) {
      console.error("Failed to log AR usage", e);
    }
  };

  const checkCompatibility = () => {
    try {
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      // If WebGL is not supported, or it's a very low-end mobile device
      if (!gl || (isMobile && navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4)) {
        return false;
      }
      return true;
    } catch (e) {
      return false; // Fallback safely
    }
  };

  const startCamera = async () => {
    setError('');
    setIsLoadingModel(true);
    setUseFallback(false);

    if (!checkCompatibility()) {
      setUseFallback(true);
      setIsLoadingModel(false);
      return;
    }

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
      // Improve permission denied message
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings to use Virtual Try-On, or use the static preview.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found on this device. Showing static preview.');
        setUseFallback(true);
        setError(''); // Clear error to show fallback
      } else {
        setError('Camera access unavailable. Showing static preview.');
        setUseFallback(true);
        setError(''); // Clear error to show fallback
      }
      setIsLoadingModel(false);
    }
  };

  const handleModelLoad = (err) => {
    setIsLoadingModel(false);
    if (err) {
      console.warn("AR Model failed to load, switching to fallback.");
      setUseFallback(true);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
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
      link.download = `lumina-tryon-${activeProduct.sku || 'capture'}.png`;
      link.href = dataUrl;
      link.click();
      showToast('Snapshot saved!');
    } catch (e) {
      console.error("Snapshot failed", e);
      showToast('Failed to save snapshot', 'error');
    }
  };

  const handleAddToCart = () => {
    addToCart(activeProduct);
  };

  if (!isOpen) return null;

  const cat = (activeProduct?.category || '').toLowerCase();
  const subcat = (activeProduct?.subcategory || '').toLowerCase();
  const name = (activeProduct?.name || '').toLowerCase();
  
  const isFaceProduct = cat.includes('necklace') || cat.includes('earring') || cat.includes('tikka') || cat.includes('choker') ||
                        subcat.includes('necklace') || subcat.includes('earring') || subcat.includes('tikka') || subcat.includes('choker') ||
                        name.includes('necklace') || name.includes('earring') || name.includes('tikka') || name.includes('choker');
                        
  const isHandProduct = cat.includes('ring') || cat.includes('bracelet') || cat.includes('bangle') ||
                        subcat.includes('ring') || subcat.includes('bracelet') || subcat.includes('bangle') ||
                        name.includes('ring') || name.includes('bracelet') || name.includes('bangle');

  return (
    <div className="vto-overlay">
      <div className="vto-container">
        <div className="vto-header">
          <div className="vto-title" onDoubleClick={() => setShowDebug(!showDebug)}>
            <Camera size={20} className="vto-icon" />
            <h3>Live AR Try-On</h3>
          </div>
          <button 
            className="vto-close" 
            onClick={() => {
              console.log("Closing VTO");
              onClose();
            }}
            style={{ position: 'relative', zIndex: 99999, pointerEvents: 'auto', padding: '10px' }}
          >
            <X size={24} />
          </button>
        </div>
        
        {showDebug && (
          <div style={{ position: 'absolute', top: '70px', left: '10px', background: 'rgba(0,0,0,0.8)', padding: '10px', borderRadius: '8px', zIndex: 100, fontSize: '0.75rem', color: '#0f0', fontFamily: 'monospace' }}>
            <strong>AR DEBUG PANEL</strong><br/>
            FPS: {fps}<br/>
            Engine: {isFaceProduct ? 'FaceMesh' : isHandProduct ? 'Hands' : 'FaceMesh (Fallback)'}<br/>
            Product ID: {activeProduct?.sku || activeProduct?.id}<br/>
            Scale Multiplier: {activeProduct?.arScale || 1}<br/>
            Offset: X:{activeProduct?.arOffsetX || 0} Y:{activeProduct?.arOffsetY || 0} Z:{activeProduct?.arOffsetZ || 0}<br/>
            Occlusion: Active<br/>
            PBR Rendering: Active
          </div>
        )}

        <div className="vto-body">
          {error ? (
            <div className="vto-error">
              <ShieldAlert size={48} style={{ marginBottom: '1rem', color: '#e74c3c' }} />
              <p style={{ maxWidth: '400px', margin: '0 auto 1.5rem auto', lineHeight: '1.5' }}>{error}</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn btn-outline" onClick={startCamera}>Try Again</button>
                <button className="btn btn-gold" onClick={() => { setError(''); setUseFallback(true); }}>Use Static Preview</button>
              </div>
            </div>
          ) : (
            <div className="vto-viewport" ref={canvasContainerRef}>
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
                    shadows
                    camera={{ position: [0, 0, 10], fov: 50 }}
                    style={{ background: 'transparent', pointerEvents: 'none' }}
                    gl={{ alpha: true, preserveDrawingBuffer: true, antialias: true }}
                  >
                    <ambientLight intensity={0.8} />
                    <directionalLight castShadow position={[10, 10, 5]} intensity={1} shadow-mapSize={[1024, 1024]} />
                    <Environment preset="city" />
                    
                    <Suspense fallback={null}>
                      {isFaceProduct && <ARFaceTracker videoRef={videoRef} product={activeProduct} onLoaded={handleModelLoad} />}
                      {isHandProduct && <ARHandTracker videoRef={videoRef} product={activeProduct} onLoaded={handleModelLoad} />}
                      {!isFaceProduct && !isHandProduct && (
                        // Fallback if category doesn't match
                        <ARFaceTracker videoRef={videoRef} product={activeProduct} onLoaded={handleModelLoad} />
                      )}
                    </Suspense>
                  </Canvas>
                </div>
              )}

              {useFallback && <StaticFallbackViewer product={activeProduct} />}

              {isLoadingModel && !error && (
                <div className="vto-loading-overlay">
                  <div className="spinner"></div>
                  <p>Loading AR Model...</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="vto-footer" style={{ flexDirection: 'column', gap: '1rem' }}>
          
          {/* Product Carousel */}
          <div className="vto-carousel">
            {products?.map(p => (
              <div 
                key={p.id || p.sku} 
                className={`vto-carousel-item ${activeProduct?.id === p.id ? 'active' : ''}`}
                onClick={() => {
                  setIsLoadingModel(true);
                  setActiveProduct(p);
                }}
              >
                <img src={p.image} alt={p.name} />
              </div>
            ))}
          </div>
          
          <div className="vto-footer-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
            <div className="vto-product-info">
              <h4>{activeProduct?.name}</h4>
              <div className="vto-price">₹{activeProduct?.price?.toLocaleString()}</div>
            </div>
            <div className="vto-actions" style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <button className="btn btn-outline" onClick={capturePhoto} title="Take Snapshot">
                <Download size={18} /> Snapshot
              </button>
              <button 
                className="btn btn-outline" 
                onClick={() => toggleWishlist(activeProduct)}
                title={isWishlisted(activeProduct?.id) ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart size={18} fill={isWishlisted(activeProduct?.id) ? "var(--gold)" : "none"} color={isWishlisted(activeProduct?.id) ? "var(--gold)" : "currentColor"} />
              </button>
              <button className="btn btn-gold" onClick={handleAddToCart}>
                <ShoppingBag size={18} /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
