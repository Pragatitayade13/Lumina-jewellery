import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import ModelRenderer from './ModelRenderer';

export default function ARHandTracker({ videoRef, product, onLoaded }) {
  const { size } = useThree();
  const handsRef = useRef(null);
  const cameraUtilsRef = useRef(null);
  
  const [landmarks, setLandmarks] = useState(null);

  useEffect(() => {
    if (!videoRef.current) return;

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
        setLandmarks(results.multiHandLandmarks[0]);
      } else {
        setLandmarks(null);
      }
      onLoaded();
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
  }, [videoRef, onLoaded]);

  if (!landmarks) return null;

  const mapLandmark = (point) => {
    const x = (point.x - 0.5) * -10; 
    const y = -(point.y - 0.5) * 10 * (size.height / size.width);
    const z = -point.z * 10;
    return [x, y, z];
  };

  let position = [0,0,0];
  if (product?.category === 'Ring') {
    // Ring finger base (landmark 13)
    position = mapLandmark(landmarks[13]);
  } else {
    // Bracelet/Bangle (Wrist - landmark 0)
    position = mapLandmark(landmarks[0]);
  }

  return (
    <ModelRenderer 
      position={position}
      modelUrl={product?.modelUrl} 
      fallbackColor="silver"
      category={product?.category}
    />
  );
}
