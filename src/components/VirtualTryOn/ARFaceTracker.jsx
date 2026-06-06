import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ModelRenderer from './ModelRenderer';

const FaceMesh = window.FaceMesh;
const Camera = window.Camera;

// Exponential Moving Average filter for smooth tracking
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

// Helper to interpolate quaternions
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

export default function ARFaceTracker({ videoRef, product, onLoaded }) {
  const { size } = useThree();
  const faceMeshRef = useRef(null);
  const cameraUtilsRef = useRef(null);
  
  // Trackers
  const leftEarPose = useRef({ position: [0, -1000, 0], quaternion: [0,0,0,1], scaleFactor: 1, visible: false });
  const rightEarPose = useRef({ position: [0, -1000, 0], quaternion: [0,0,0,1], scaleFactor: 1, visible: false });
  const neckPose = useRef({ position: [0, -1000, 0], quaternion: [0,0,0,1], scaleFactor: 1, visible: false });
  const tikkaPose = useRef({ position: [0, -1000, 0], quaternion: [0,0,0,1], scaleFactor: 1, visible: false });
  const headOccluderPose = useRef({ position: [0, -1000, 0], quaternion: [0,0,0,1], scaleFactor: 1, visible: false });
  
  const hasLoadedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  
  const isEarring = (product?.category || '').toLowerCase().includes('earring') || (product?.subcategory || '').toLowerCase().includes('earring');
  const isTikka = (product?.category || '').toLowerCase().includes('tikka') || (product?.name || '').toLowerCase().includes('tikka');

  // Filters
  const posFilterLeft = useRef(new EMAFilter(0.3));
  const posFilterRight = useRef(new EMAFilter(0.3));
  const posFilterNeck = useRef(new EMAFilter(0.3));
  const posFilterTikka = useRef(new EMAFilter(0.3));
  const posFilterHead = useRef(new EMAFilter(0.3));
  const quatFilter = useRef(new QuatFilter(0.3));
  const scaleFilter = useRef(new EMAFilter(0.2));

  // Initialize MediaPipe once
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

    cameraUtilsRef.current = new Camera(videoRef.current, {
      onFrame: async () => {
        if (faceMeshRef.current && videoRef.current) {
          try {
            await faceMeshRef.current.send({ image: videoRef.current });
          } catch (e) {
            console.error("FaceMesh Error:", e);
          }
        }
      },
      width: 1280,
      height: 720
    });

    cameraUtilsRef.current.start();

    return () => {
      if (cameraUtilsRef.current) cameraUtilsRef.current.stop();
      if (faceMeshRef.current) faceMeshRef.current.close();
    };
  }, [videoRef]);

  // Update logic on frame
  useEffect(() => {
    if (!faceMeshRef.current) return;

    const mapLandmark = (point) => {
      const x = (point.x - 0.5) * -10; 
      const y = -(point.y - 0.5) * 10 * (size.height / size.width);
      const z = -point.z * 10;
      return new THREE.Vector3(x, y, z);
    };

    faceMeshRef.current.onResults((results) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        
        // Key landmarks
        const leftEye = mapLandmark(landmarks[33]);
        const rightEye = mapLandmark(landmarks[263]);
        const nose = mapLandmark(landmarks[1]);
        const chin = mapLandmark(landmarks[152]);
        const leftEar = mapLandmark(landmarks[132]);
        const rightEar = mapLandmark(landmarks[361]);
        const forehead = mapLandmark(landmarks[9]);
        
        // 1. Calculate Scale Factor based on interpupillary distance
        const eyeDist = leftEye.distanceTo(rightEye);
        // Assume default eye dist at z=0 is approx 1.5 units in our coordinates.
        const rawScale = eyeDist / 1.5;
        const smoothScale = scaleFilter.current.update([rawScale])[0];
        
        // 2. Calculate Head Rotation (Pitch, Yaw, Roll)
        // X axis points right (from user perspective)
        const xAxis = new THREE.Vector3().subVectors(rightEye, leftEye).normalize();
        // Y axis points up (from chin to nose)
        const yAxis = new THREE.Vector3().subVectors(nose, chin).normalize();
        // Z axis points forward (cross product)
        const zAxis = new THREE.Vector3().crossVectors(xAxis, yAxis).normalize();
        // Re-orthogonalize Y to ensure proper matrix
        yAxis.crossVectors(zAxis, xAxis).normalize();

        const rotMatrix = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis);
        const rawQuat = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);
        const smoothQuatArray = quatFilter.current.update(rawQuat);

        // 3. Earring Placement
        if (isEarring) {
          const lPos = posFilterLeft.current.update([leftEar.x, leftEar.y, leftEar.z]);
          const rPos = posFilterRight.current.update([rightEar.x, rightEar.y, rightEar.z]);
          
          leftEarPose.current = { position: lPos, quaternion: smoothQuatArray, scaleFactor: smoothScale, visible: true };
          
          // Mirror rotation for right ear
          const rEuler = new THREE.Euler().setFromQuaternion(rawQuat);
          rEuler.y = -rEuler.y; // Flip yaw
          rEuler.z = -rEuler.z; // Flip roll
          const rQuat = new THREE.Quaternion().setFromEuler(rEuler);
          
          rightEarPose.current = { position: rPos, quaternion: [rQuat.x, rQuat.y, rQuat.z, rQuat.w], scaleFactor: smoothScale, visible: true };
          neckPose.current.visible = false;
          tikkaPose.current.visible = false;
        } else if (isTikka) {
          // Tikka placement on forehead
          const tPos = posFilterTikka.current.update([forehead.x, forehead.y, forehead.z]);
          
          tikkaPose.current = { position: tPos, quaternion: smoothQuatArray, scaleFactor: smoothScale, visible: true };
          leftEarPose.current.visible = false;
          rightEarPose.current.visible = false;
          neckPose.current.visible = false;
        } else {
          // Necklace / Other placement
          // Position relative to lower chin/neck
          const neckTarget = chin.clone().sub(new THREE.Vector3(0, 1.5 * smoothScale, 0));
          const nPos = posFilterNeck.current.update([neckTarget.x, neckTarget.y, neckTarget.z]);
          
          neckPose.current = { position: nPos, quaternion: smoothQuatArray, scaleFactor: smoothScale, visible: true };
          leftEarPose.current.visible = false;
          rightEarPose.current.visible = false;
          tikkaPose.current.visible = false;
        }
        
        // Occluder (Head Mask) Position - roughly behind nose/eyes
        // We push it significantly back on the Z axis so it doesn't swallow forehead geometry
        const hPos = posFilterHead.current.update([nose.x, nose.y, nose.z - (4 * smoothScale)]);
        headOccluderPose.current = { position: hPos, quaternion: smoothQuatArray, scaleFactor: smoothScale, visible: true };
        
        if (!hasLoadedRef.current) {
          hasLoadedRef.current = true;
          setIsReady(true);
          onLoaded();
        }
      } else {
        // Hide models when no face is detected
        leftEarPose.current.visible = false;
        rightEarPose.current.visible = false;
        neckPose.current.visible = false;
        tikkaPose.current.visible = false;
        headOccluderPose.current.visible = false;
      }
    });
  }, [size.width, size.height, product, onLoaded, isEarring]);

  if (!isReady) return null;

  return (
    <>
      {/* Invisible mask to hide geometry behind the head/neck */}
      <ModelRenderer 
        poseRef={headOccluderPose} 
        isOccluder={true} 
        occluderType="head" 
      />

      {isEarring ? (
        <>
          <ModelRenderer poseRef={leftEarPose} modelUrl={product?.modelUrl} fallbackColor="gold" product={product} />
          <ModelRenderer poseRef={rightEarPose} modelUrl={product?.modelUrl} fallbackColor="gold" product={product} />
        </>
      ) : isTikka ? (
        <ModelRenderer poseRef={tikkaPose} modelUrl={product?.modelUrl} fallbackColor="gold" product={product} />
      ) : (
        <ModelRenderer poseRef={neckPose} modelUrl={product?.modelUrl} fallbackColor="silver" product={product} />
      )}
    </>
  );
}
