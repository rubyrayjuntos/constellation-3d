import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

export default function FacetNode({ facet }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  // Size based on connection count
  const size = 0.1 + (facet.connections * 0.02);

  return (
    <group position={facet.position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color="#0066ff"
          emissive="#0044aa"
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
        />
      </mesh>

      <Text
        position={[0, -size - 0.15, 0]}
        fontSize={0.1}
        color="#00aaff"
        anchorX="center"
        anchorY="middle"
      >
        {facet.name}
      </Text>

      {/* Gravity well visualization */}
      <mesh>
        <sphereGeometry args={[size * 3, 16, 16]} />
        <meshBasicMaterial
          color="#0066ff"
          transparent
          opacity={0.05}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
