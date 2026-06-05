import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import ModelRenderer from './ModelRenderer';

const FaceMesh = window.FaceMesh;
const Camera = window.Camera;

export default function ARFaceTracker({ videoRef, product, onLoaded }) {
  const { size } = useThree();
  const faceMeshRef = useRef(null);
  const cameraUtilsRef = useRef(null);
  
  const positionRef = useRef([0, -10, -50]); // Default hidden far away
  const hasLoadedRef = useRef(false);
  const [isReady, setIsReady] = useState(false); // Only toggle once to mount renderer

  useEffect(() => {
    if (!videoRef.current) return;

    const mapLandmark = (point) => {
      const x = (point.x - 0.5) * -10; 
      const y = -(point.y - 0.5) * 10 * (size.height / size.width);
      const z = -point.z * 10;
      return [x, y, z];
    };

    faceMeshRef.current = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMeshRef.current.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMeshRef.current.onResults((results) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        
        let newPos = [0, 0, 0];
        if (product?.category === 'Earrings' || product?.category === 'Earring') {
          newPos = mapLandmark(landmarks[132]);
        } else {
          newPos = mapLandmark(landmarks[152]);
          newPos[1] -= 2; 
        }
        positionRef.current = newPos;
        
        if (!hasLoadedRef.current) {
          hasLoadedRef.current = true;
          setIsReady(true);
          onLoaded();
        }
      }
    });

    cameraUtilsRef.current = new Camera(videoRef.current, {
      onFrame: async () => {
        if (faceMeshRef.current && videoRef.current) {
          await faceMeshRef.current.send({ image: videoRef.current });
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
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
      }
    };
  }, [videoRef, product, onLoaded, size.width, size.height]);

  if (!isReady) return null;

  return (
    <ModelRenderer 
      positionRef={positionRef}
      modelUrl={product?.modelUrl} 
      fallbackColor="gold"
      category={product?.category}
    />
  );
}
