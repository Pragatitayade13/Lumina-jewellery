import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import ErrorBoundary from './ErrorBoundary';

// Occlusion material writes to depth buffer but not color buffer
const occlusionMaterial = new THREE.MeshBasicMaterial({
  colorWrite: false,
  depthWrite: true,
});

function GLTFModel({ url, isEarring }) {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    // Enable shadows and enhance materials for PBR
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          // If the material is a standard material, boost its metalness/roughness for jewelry
          if (child.material.isMeshStandardMaterial) {
             child.material.envMapIntensity = 2.0; // Boost reflection
             child.material.needsUpdate = true;
          }
        }
      }
    });
    return clone;
  }, [scene]);

  return <primitive object={clonedScene} />;
}

function ImageFallback({ imageUrl, isNecklace, isEarring }) {
  const texture = useTexture(imageUrl);
  // Scale the 2D plane so it looks like a piece of jewellery
  // Necklaces are typically wider, earrings smaller
  const w = isNecklace ? 4.5 : isEarring ? 1.5 : 3;
  const h = isNecklace ? 4.5 : isEarring ? 1.5 : 3;
  
  return (
    <mesh position={[0, isNecklace ? -1.5 : 0, 0.5]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={texture} transparent={true} side={THREE.DoubleSide} alphaTest={0.05} depthWrite={false} />
    </mesh>
  );
}

function ProceduralNecklace() {
  return (
    <group scale={[1.2, 1.2, 1.2]} position={[0, -1, 0]} rotation={[0.4, 0, 0]}>
      {/* Main Choker Band */}
      <mesh rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[1.5, 0.15, 32, 100, Math.PI]} />
        <meshPhysicalMaterial color="#FFD700" metalness={1} roughness={0.1} />
      </mesh>
      {/* Central Pendant */}
      <mesh position={[0, -1.5, 0.2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} rotation={[Math.PI/2, 0, 0]} />
        <meshPhysicalMaterial color="#FFD700" metalness={1} roughness={0.2} />
      </mesh>
      {/* Ruby Gem */}
      <mesh position={[0, -1.5, 0.25]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshPhysicalMaterial color="#E0115F" metalness={0.2} roughness={0.1} clearcoat={1} transmission={0.5} />
      </mesh>
      {/* Dangling Pearl */}
      <mesh position={[0, -2.1, 0.2]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshPhysicalMaterial color="#FFFFFF" metalness={0.1} roughness={0.2} clearcoat={1} />
      </mesh>
      <mesh position={[0, -1.8, 0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
        <meshPhysicalMaterial color="#FFD700" metalness={1} roughness={0.1} />
      </mesh>
    </group>
  );
}

function ProceduralEarring() {
  return (
    <group scale={[0.8, 0.8, 0.8]} position={[0, -0.5, 0]}>
      {/* Stud */}
      <mesh>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshPhysicalMaterial color="#FFD700" metalness={1} roughness={0.1} />
      </mesh>
      {/* Chain */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshPhysicalMaterial color="#FFD700" metalness={1} roughness={0.1} />
      </mesh>
      {/* Bottom Drop Gem */}
      <mesh position={[0, -1, 0]}>
        <octahedronGeometry args={[0.3, 2]} />
        <meshPhysicalMaterial color="#00FF00" metalness={0.3} roughness={0.1} clearcoat={1} transmission={0.6} />
      </mesh>
    </group>
  );
}

function ProceduralTikka() {
  return (
    <group scale={[0.8, 0.8, 0.8]}>
      {/* Chain resting on hair */}
      <mesh position={[0, 1, -0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
        <meshPhysicalMaterial color="#FFD700" metalness={1} roughness={0.1} />
      </mesh>
      {/* Main Tikka Pendant */}
      <mesh position={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} rotation={[Math.PI/2, 0, 0]} />
        <meshPhysicalMaterial color="#FFD700" metalness={1} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.15]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshPhysicalMaterial color="#E0115F" metalness={0.2} roughness={0.1} clearcoat={1} transmission={0.5} />
      </mesh>
    </group>
  );
}

function ProceduralRing() {
  return (
    <group scale={[0.5, 0.5, 0.5]}>
      <mesh rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[1, 0.2, 32, 100]} />
        <meshPhysicalMaterial color="#FFD700" metalness={1} roughness={0.1} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <octahedronGeometry args={[0.5, 2]} />
        <meshPhysicalMaterial color="#FFFFFF" metalness={0.1} roughness={0} clearcoat={1} transmission={0.9} />
      </mesh>
    </group>
  );
}

export default function ModelRenderer({ 
  poseRef, 
  modelUrl, 
  fallbackColor, 
  product, 
  isOccluder = false, // If true, this just renders the invisible head/finger mask
  occluderType = 'head' // 'head', 'finger', 'neck'
}) {
  const groupRef = useRef();
  
  const cat = (product?.category || '').toLowerCase();
  const subcat = (product?.subcategory || '').toLowerCase();
  const name = (product?.name || '').toLowerCase();
  
  const isRing = cat.includes('ring') || subcat.includes('ring') || name.includes('ring') || 
                 cat.includes('bracelet') || subcat.includes('bracelet') || name.includes('bracelet') ||
                 cat.includes('bangle') || subcat.includes('bangle') || name.includes('bangle');
                 
  const isEarring = cat.includes('earring') || subcat.includes('earring') || name.includes('earring');
  const isNecklace = cat.includes('necklace') || subcat.includes('necklace') || name.includes('necklace') || cat.includes('choker') || name.includes('choker');
  const isTikka = cat.includes('tikka') || subcat.includes('tikka') || name.includes('tikka');
  
  // Base scale from product AR configuration or defaults
  const baseScale = product?.arScale || (isRing ? 0.2 : isEarring ? 0.3 : isNecklace ? 1.2 : isTikka ? 0.6 : 1);
  
  // Interpolation targets for smooth movement (EMA handled in Tracker, but slight lerp here for render-frame smoothness)
  const targetPos = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const targetQuat = useMemo(() => new THREE.Quaternion(), []);
  const targetScale = useMemo(() => new THREE.Vector3(1, 1, 1), []);

  useFrame((state, delta) => {
    if (!groupRef.current || !poseRef || !poseRef.current) return;
    
    const pose = poseRef.current;
    
    // Hide if not tracking
    if (!pose.visible || pose.position[1] <= -1000) {
      groupRef.current.visible = false;
      return;
    }
    
    groupRef.current.visible = true;

    // Apply Position
    targetPos.set(
      pose.position[0] + (product?.arOffsetX || 0), 
      pose.position[1] + (product?.arOffsetY || 0), 
      pose.position[2] + (product?.arOffsetZ || 0)
    );
    groupRef.current.position.lerp(targetPos, 0.4);
    
    // Apply Rotation (Quaternion)
    if (pose.quaternion) {
      targetQuat.set(pose.quaternion[0], pose.quaternion[1], pose.quaternion[2], pose.quaternion[3]);
      
      // Apply product specific rotation offsets
      if (product?.arRotX || product?.arRotY || product?.arRotZ) {
        const offsetEuler = new THREE.Euler(
          THREE.MathUtils.degToRad(product.arRotX || 0),
          THREE.MathUtils.degToRad(product.arRotY || 0),
          THREE.MathUtils.degToRad(product.arRotZ || 0)
        );
        const offsetQuat = new THREE.Quaternion().setFromEuler(offsetEuler);
        targetQuat.multiply(offsetQuat);
      }
      
      groupRef.current.quaternion.slerp(targetQuat, 0.4);
    }
    
    // Apply Scale (dynamic scale factor from tracker * base scale)
    const dynamicScale = (pose.scaleFactor || 1) * baseScale;
    targetScale.set(dynamicScale, dynamicScale, dynamicScale);
    groupRef.current.scale.lerp(targetScale, 0.4);
  });

  if (isOccluder) {
    return (
      <group ref={groupRef}>
        <mesh material={occlusionMaterial}>
          {occluderType === 'head' && <sphereGeometry args={[1.8, 32, 32]} />}
          {occluderType === 'finger' && <cylinderGeometry args={[0.5, 0.5, 4, 16]} rotation={[Math.PI/2, 0, 0]} />}
          {occluderType === 'neck' && <cylinderGeometry args={[3, 4, 5, 32]} />}
        </mesh>
      </group>
    );
  }

  const fallbackMesh = (
    <group>
      {product?.image ? (
        <ErrorBoundary fallback={
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshPhysicalMaterial color={fallbackColor} />
          </mesh>
        }>
          <ImageFallback imageUrl={product.image} isNecklace={isNecklace} isEarring={isEarring} />
        </ErrorBoundary>
      ) : isNecklace ? <ProceduralNecklace /> : 
       isEarring ? <ProceduralEarring /> : 
       isTikka ? <ProceduralTikka /> : 
       isRing ? <ProceduralRing /> : 
       (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshPhysicalMaterial color={fallbackColor} metalness={1} roughness={0.2} />
        </mesh>
       )}
    </group>
  );

  return (
    <group ref={groupRef}>
      {modelUrl && !modelUrl.includes('...') ? (
        <ErrorBoundary fallback={fallbackMesh}>
          <GLTFModel url={modelUrl} isEarring={isEarring} />
        </ErrorBoundary>
      ) : (
        // Fallback placeholder shape
        fallbackMesh
      )}
    </group>
  );
}
