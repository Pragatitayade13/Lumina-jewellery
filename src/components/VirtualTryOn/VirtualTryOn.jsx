import { useState, useRef, useEffect } from 'react';
import { Camera, X, ZoomIn, ZoomOut, Move, Download } from 'lucide-react';
import { useScrollLock } from '../../hooks/useScrollLock';
import './VirtualTryOn.css';

export default function VirtualTryOn({ isOpen, onClose, product }) {
  useScrollLock(isOpen);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [scale, setScale] = useState(1);
  
  // Dragging state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      startCamera();
      // Center the item initially
      setPosition({ x: 0, y: 0 });
      setScale(1);
    } else {
      stopCamera();
    }
    
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
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

  // Drag Handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Handlers for mobile
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame (flipped horizontally if facingMode is user)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // We can't easily draw the HTML overlay onto the canvas securely without html2canvas,
    // so for this demo we'll just flash the screen to indicate a photo was taken.
    
    // Visual flash effect
    const flash = document.createElement('div');
    flash.style.position = 'absolute';
    flash.style.top = 0; flash.style.left = 0; flash.style.right = 0; flash.style.bottom = 0;
    flash.style.backgroundColor = 'white';
    flash.style.opacity = 0.8;
    flash.style.transition = 'opacity 0.5s ease';
    flash.style.zIndex = 1000;
    containerRef.current.appendChild(flash);
    
    setTimeout(() => {
      flash.style.opacity = 0;
      setTimeout(() => flash.remove(), 500);
    }, 100);

    // Optional: trigger download of the video frame
    // const dataUrl = canvas.toDataURL('image/png');
    // const link = document.createElement('a');
    // link.download = 'lumina-tryon.png';
    // link.href = dataUrl;
    // link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="vto-overlay">
      <div className="vto-container" ref={containerRef}>
        <div className="vto-header">
          <div className="vto-title">
            <Camera size={20} /> Virtual Try-On
          </div>
          <button className="vto-close" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="vto-body">
          {error ? (
            <div className="vto-error">
              <Camera size={48} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
              <p>{error}</p>
              <button className="btn btn-outline" onClick={startCamera} style={{ marginTop: '1rem' }}>Retry Camera Access</button>
            </div>
          ) : (
            <div 
              className="vto-viewport"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            >
              {/* Live Video Feed */}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="vto-video"
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              {/* Loading State for Camera */}
              {!stream && <div className="vto-loading">Starting camera...</div>}

              {/* Jewellery Overlay */}
              {stream && product?.image && (
                <div 
                  className="vto-item-overlay"
                  style={{
                    transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`,
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                >
                  <img src={product.image} alt={product.name} draggable="false" />
                </div>
              )}
            </div>
          )}
        </div>

        {!error && stream && (
          <div className="vto-controls">
            <div className="vto-controls-left">
              <span className="vto-instruction"><Move size={14} /> Drag to position</span>
            </div>
            
            <div className="vto-scale-control">
              <button onClick={() => setScale(s => Math.max(0.2, s - 0.1))} title="Scale Down"><ZoomOut size={18} /></button>
              <input 
                type="range" 
                min="0.2" max="3" step="0.1" 
                value={scale} 
                onChange={(e) => setScale(parseFloat(e.target.value))} 
              />
              <button onClick={() => setScale(s => Math.min(3, s + 0.1))} title="Scale Up"><ZoomIn size={18} /></button>
            </div>

            <div className="vto-controls-right">
              <button className="btn btn-gold vto-capture" onClick={capturePhoto}>
                <Camera size={18} /> Snap
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
