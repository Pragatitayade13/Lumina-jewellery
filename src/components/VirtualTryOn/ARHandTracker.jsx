import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import ModelRenderer from './ModelRenderer';

const Hands = window.Hands;
const Camera = window.Camera;

export default function ARHandTracker({ videoRef, product, onLoaded }) {
  const { size } = useThree();
  const handsRef = useRef(null);
  const cameraUtilsRef = useRef(null);
  
  const positionRef = useRef([0, -10, -50]);
  const hasLoadedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    const mapLandmark = (point) => {
      const x = (point.x - 0.5) * -10; 
      const y = -(point.y - 0.5) * 10 * (size.height / size.width);
      const z = -point.z * 10;
      return [x, y, z];
    };

    handsRef.current = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    handsRef.current.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    handsRef.current.onResults((results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        if (product?.category === 'Ring') {
          positionRef.current = mapLandmark(landmarks[13]);
        } else {
          positionRef.current = mapLandmark(landmarks[0]);
        }
        
        if (!hasLoadedRef.current) {
          hasLoadedRef.current = true;
          setIsReady(true);
          onLoaded();
        }
      }
    });

    cameraUtilsRef.current = new Camera(videoRef.current, {
      onFrame: async () => {
        if (handsRef.current && videoRef.current) {
          await handsRef.current.send({ image: videoRef.current });
        }
      },
      width: 1280,
      height: 720
    });

    cameraUtilsRef.current.start();

    return () => {
      if (cameraUtilsRef.current) {
        cameraUtilsRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, [videoRef, product, onLoaded, size.width, size.height]);

  if (!isReady) return null;

  return (
    <ModelRenderer 
      positionRef={positionRef}
      modelUrl={product?.modelUrl} 
      fallbackColor="silver"
      category={product?.category}
    />
  );
}
