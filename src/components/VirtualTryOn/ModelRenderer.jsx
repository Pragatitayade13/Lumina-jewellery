import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function GLTFModel({ url }) {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  return <primitive object={clonedScene} />;
}

export default function ModelRenderer({ positionRef, modelUrl, fallbackColor, category }) {
  const groupRef = useRef();
  
  // Interpolation targets for smooth movement
  const targetPos = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  // Default scales based on category
  let defaultScale = 1;
  if (category === 'Ring') defaultScale = 0.2;
  else if (category === 'Earrings' || category === 'Earring') defaultScale = 0.3;
  else if (category === 'Necklace') defaultScale = 1.2;
  else if (category === 'Bracelet' || category === 'Bangle') defaultScale = 0.6;

  useFrame((state, delta) => {
    if (!groupRef.current || !positionRef || !positionRef.current) return;
    
    // Smooth interpolation to avoid jitter
    targetPos.set(positionRef.current[0], positionRef.current[1], positionRef.current[2]);
    groupRef.current.position.lerp(targetPos, 0.2);
    
    // Subtle auto-rotation for demo purposes if no exact rotation matrix is available
    if (category === 'Ring' || category === 'Bracelet' || category === 'Bangle') {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={groupRef} scale={[defaultScale, defaultScale, defaultScale]}>
      {modelUrl ? (
        <GLTFModel url={modelUrl} />
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
