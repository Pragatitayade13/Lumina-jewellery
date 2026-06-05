import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function GLTFModel({ url }) {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  return <primitive object={clonedScene} />;
}

export default function ModelRenderer({ positionRef, modelUrl, fallbackColor, product }) {
  const groupRef = useRef();
  
  const cat = (product?.category || '').toLowerCase();
  const subcat = (product?.subcategory || '').toLowerCase();
  const name = (product?.name || '').toLowerCase();
  
  const isRing = cat.includes('ring') || subcat.includes('ring') || name.includes('ring') || 
                 cat.includes('bracelet') || subcat.includes('bracelet') || name.includes('bracelet') ||
                 cat.includes('bangle') || subcat.includes('bangle') || name.includes('bangle');
                 
  const isEarring = cat.includes('earring') || subcat.includes('earring') || name.includes('earring');
  const isNecklace = cat.includes('necklace') || subcat.includes('necklace') || name.includes('necklace');
  
  // Interpolation targets for smooth movement
  const targetPos = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  // Default scales based on category
  let defaultScale = 1;
  if (isRing) defaultScale = 0.2;
  else if (isEarring) defaultScale = 0.3;
  else if (isNecklace) defaultScale = 1.2;

  useFrame((state, delta) => {
    if (!groupRef.current || !positionRef || !positionRef.current) return;
    
    // Smooth interpolation to avoid jitter
    targetPos.set(positionRef.current[0], positionRef.current[1], positionRef.current[2]);
    groupRef.current.position.lerp(targetPos, 0.2);
    
    // Subtle auto-rotation for demo purposes if no exact rotation matrix is available
    if (isRing) {
      groupRef.current.rotation.y += delta * 0.5;
    }
    
    // Hide if position is set to the 'hidden' default
    if (positionRef.current[1] === -1000) {
      groupRef.current.visible = false;
    } else {
      groupRef.current.visible = true;
    }
  });

  return (
    <group ref={groupRef} scale={[defaultScale, defaultScale, defaultScale]}>
      {modelUrl ? (
        <GLTFModel url={modelUrl} />
      ) : (
        // Fallback placeholder shape
        <mesh rotation={isNecklace ? [0.5, 0, 0] : [0, 0, 0]}>
          {isRing ? (
            <torusGeometry args={[1, 0.1, 16, 100]} />
          ) : isNecklace ? (
             <torusGeometry args={[1.5, 0.08, 16, 100]} />
          ) : (
             <sphereGeometry args={[0.5, 32, 32]} />
          )}
          <meshStandardMaterial color={fallbackColor} metalness={0.8} roughness={0.2} />
        </mesh>
      )}
    </group>
  );
}
