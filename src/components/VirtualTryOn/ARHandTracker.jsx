import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ModelRenderer from './ModelRenderer';

const Hands = window.Hands;
const Camera = window.Camera;

// Exponential Moving Average filter
class EMAFilter {
  constructor(alpha = 0.4) {
    this.alpha = alpha;
    this.value = null;
  }
  update(newValue) {
    if (this.value === null) {
      this.value = [...newValue];
    } else {
      for (let i = 0; i < newValue.length; i++) {
        this.value[i] = this.alpha * newValue[i] + (1 - this.alpha) * this.value[i];
      }
    }
    return this.value;
  }
}

class QuatFilter {
  constructor(alpha = 0.4) {
    this.alpha = alpha;
    this.value = new THREE.Quaternion();
    this.isInit = false;
  }
  update(newQuat) {
    if (!this.isInit) {
      this.value.copy(newQuat);
      this.isInit = true;
    } else {
      this.value.slerp(newQuat, this.alpha);
    }
    return [this.value.x, this.value.y, this.value.z, this.value.w];
  }
}

export default function ARHandTracker({ videoRef, product, onLoaded }) {
  const { size } = useThree();
  const handsRef = useRef(null);
  const cameraUtilsRef = useRef(null);
  
  const targetPose = useRef({ position: [0, -1000, 0], quaternion: [0,0,0,1], scaleFactor: 1, visible: false });
  const fingerOccluderPose = useRef({ position: [0, -1000, 0], quaternion: [0,0,0,1], scaleFactor: 1, visible: false });
  
  const hasLoadedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  const posFilter = useRef(new EMAFilter(0.3));
  const occFilter = useRef(new EMAFilter(0.3));
  const quatFilter = useRef(new QuatFilter(0.3));
  const scaleFilter = useRef(new EMAFilter(0.2));

  // Initialize MediaPipe once
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

    cameraUtilsRef.current = new Camera(videoRef.current, {
      onFrame: async () => {
        if (handsRef.current && videoRef.current) {
          try {
            await handsRef.current.send({ image: videoRef.current });
          } catch (e) {
            console.error("Hands Error:", e);
          }
        }
      },
      width: 1280,
      height: 720
    });

    cameraUtilsRef.current.start();

    return () => {
      if (cameraUtilsRef.current) cameraUtilsRef.current.stop();
      if (handsRef.current) handsRef.current.close();
    };
  }, [videoRef]);

  // Update logic on resize or product change
  useEffect(() => {
    if (!handsRef.current) return;

    const mapLandmark = (point) => {
      const x = (point.x - 0.5) * -10; 
      const y = -(point.y - 0.5) * 10 * (size.height / size.width);
      const z = -point.z * 10;
      return new THREE.Vector3(x, y, z);
    };

    handsRef.current.onResults((results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const cat = (product?.category || '').toLowerCase();
        
        const wrist = mapLandmark(landmarks[0]);
        const indexMcp = mapLandmark(landmarks[5]); // Knuckle
        const pinkyMcp = mapLandmark(landmarks[17]);
        
        // Dynamic scale based on hand width (index knuckle to pinky knuckle)
        const handWidth = indexMcp.distanceTo(pinkyMcp);
        const rawScale = handWidth / 1.0; // Baseline width roughly 1 unit in our scale
        const smoothScale = scaleFilter.current.update([rawScale])[0];

        let targetPosVec, dirVector;
        
        if (cat.includes('ring')) {
          // Ring finger logic
          const ringMcp = mapLandmark(landmarks[13]); // Knuckle
          const ringPip = mapLandmark(landmarks[14]); // Joint
          
          // Position between knuckle and first joint
          targetPosVec = new THREE.Vector3().lerpVectors(ringMcp, ringPip, 0.4);
          
          // Direction vector along the finger
          dirVector = new THREE.Vector3().subVectors(ringPip, ringMcp).normalize();
        } else {
          // Bracelet / Bangle logic
          targetPosVec = mapLandmark(landmarks[0]); // Wrist
          
          // Direction from wrist up arm (approximated backwards from hand)
          const midHand = new THREE.Vector3().lerpVectors(indexMcp, pinkyMcp, 0.5);
          dirVector = new THREE.Vector3().subVectors(midHand, wrist).normalize();
        }
        
        // Calculate Rotation (align Y axis of the ring to the finger direction)
        const up = new THREE.Vector3(0, 1, 0);
        const rawQuat = new THREE.Quaternion().setFromUnitVectors(up, dirVector);
        
        // For rings, we also want to orient the gem upwards relative to the back of the hand.
        // We can approximate the normal of the back of the hand:
        const handX = new THREE.Vector3().subVectors(indexMcp, pinkyMcp).normalize();
        const handNormal = new THREE.Vector3().crossVectors(handX, dirVector).normalize();
        
        // Adjust quaternion to align local Z to handNormal
        const currentZ = new THREE.Vector3(0, 0, 1).applyQuaternion(rawQuat);
        const twistQuat = new THREE.Quaternion().setFromUnitVectors(currentZ, handNormal);
        rawQuat.premultiply(twistQuat);

        const smoothQuatArray = quatFilter.current.update(rawQuat);
        const smoothPosArray = posFilter.current.update([targetPosVec.x, targetPosVec.y, targetPosVec.z]);

        targetPose.current = { position: smoothPosArray, quaternion: smoothQuatArray, scaleFactor: smoothScale, visible: true };
        
        // Set up the occluder to hide the back half of the ring
        // Positioned slightly behind the front of the finger
        const occTarget = targetPosVec.clone().sub(handNormal.clone().multiplyScalar(0.2 * smoothScale));
        const occPosArray = occFilter.current.update([occTarget.x, occTarget.y, occTarget.z]);
        fingerOccluderPose.current = { position: occPosArray, quaternion: smoothQuatArray, scaleFactor: smoothScale, visible: true };

        if (!hasLoadedRef.current) {
          hasLoadedRef.current = true;
          setIsReady(true);
          onLoaded();
        }
      } else {
        // Hide model when no hands are detected
        targetPose.current.visible = false;
        fingerOccluderPose.current.visible = false;
      }
    });
  }, [size.width, size.height, product, onLoaded]);

  if (!isReady) return null;

  return (
    <>
      <ModelRenderer 
        poseRef={fingerOccluderPose} 
        isOccluder={true} 
        occluderType="finger" 
      />
      <ModelRenderer 
        poseRef={targetPose}
        modelUrl={product?.modelUrl} 
        fallbackColor="gold"
        product={product}
      />
    </>
  );
}
