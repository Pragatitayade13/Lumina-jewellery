import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function ModelRenderer({ position, modelUrl, fallbackColor, category }) {
  const groupRef = useRef();
  const [model, setModel] = useState(null);
  
  // Interpolation targets for smooth movement
  const targetPos = new THREE.Vector3(0, 0, 0);

  // Default scales based on category
  let defaultScale = 1;
  if (category === 'Ring') defaultScale = 0.2;
  else if (category === 'Earrings' || category === 'Earring') defaultScale = 0.3;
  else if (category === 'Necklace') defaultScale = 1.2;
  else if (category === 'Bracelet' || category === 'Bangle') defaultScale = 0.6;

  // Try to load custom GLB, else we render a fallback primitive
  useEffect(() => {
    if (modelUrl) {
      try {
        const { scene } = useGLTF(modelUrl);
        setModel(scene.clone());
      } catch (e) {
        console.warn("Failed to load GLB model, using fallback", e);
      }
    }
  }, [modelUrl]);

  useFrame((state, delta) => {
    if (!groupRef.current || !position) return;
    
    // Smooth interpolation to avoid jitter
    targetPos.set(position[0], position[1], position[2]);
    groupRef.current.position.lerp(targetPos, 0.2);
    
    // Subtle auto-rotation for demo purposes if no exact rotation matrix is available
    if (category === 'Ring' || category === 'Bracelet' || category === 'Bangle') {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={groupRef} scale={[defaultScale, defaultScale, defaultScale]}>
      {model ? (
        <primitive object={model} />
      ) : (
        // Fallback placeholder shape
        <mesh>
          {category === 'Ring' || category === 'Bracelet' || category === 'Bangle' ? (
            <torusGeometry args={[1, 0.1, 16, 100]} />
          ) : category === 'Necklace' ? (
             <torusGeometry args={[2, 0.05, 16, 100]} />
          ) : (
             <sphereGeometry args={[0.5, 32, 32]} />
          )}
          <meshStandardMaterial color={fallbackColor} metalness={0.8} roughness={0.2} />
        </mesh>
      )}
    </group>
  );
}
