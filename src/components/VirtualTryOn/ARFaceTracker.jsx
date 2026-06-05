import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import ModelRenderer from './ModelRenderer';

export default function ARFaceTracker({ videoRef, product, onLoaded }) {
  const { size, camera } = useThree();
  const faceMeshRef = useRef(null);
  const cameraUtilsRef = useRef(null);
  
  const [landmarks, setLandmarks] = useState(null);

  useEffect(() => {
    if (!videoRef.current) return;

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
        setLandmarks(results.multiFaceLandmarks[0]);
      } else {
        setLandmarks(null);
      }
      onLoaded();
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
  }, [videoRef, onLoaded]);

  if (!landmarks) return null;

  // Map MediaPipe landmarks (0-1) to Three.js coordinates
  // MediaPipe: 0,0 is top-left. Threejs: 0,0 is center
  const mapLandmark = (point) => {
    const x = (point.x - 0.5) * -10; // Mirror X
    const y = -(point.y - 0.5) * 10 * (size.height / size.width);
    const z = -point.z * 10;
    return [x, y, z];
  };

  // Determine attachment point based on category
  let position = [0,0,0];
  if (product?.category === 'Earrings' || product?.category === 'Earring') {
    // Earlobe roughly
    const leftEarlobe = landmarks[132]; 
    const rightEarlobe = landmarks[361];
    // For simplicity, attach to left ear
    position = mapLandmark(leftEarlobe);
  } else {
    // Necklace (Neck base roughly)
    const chin = landmarks[152];
    position = mapLandmark(chin);
    position[1] -= 2; // Shift down to neck
  }

  return (
    <ModelRenderer 
      position={position}
      modelUrl={product?.modelUrl} 
      fallbackColor="gold"
      category={product?.category}
    />
  );
}
