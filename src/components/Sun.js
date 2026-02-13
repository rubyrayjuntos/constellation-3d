import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function Sun() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
      const pulse = Math.sin(state.clock.elapsedTime) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial
          color="#ffff00"
          toneMapped={false}
        />
      </mesh>
      <pointLight color="#ffff00" intensity={3} distance={10} />
      
      {/* Corona glow */}
      <mesh>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
