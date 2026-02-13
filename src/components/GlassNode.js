import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Text } from '@react-three/drei';
import { MEDIUM_COLORS } from '../data/projectData';

export default function GlassNode({ project, onClick, isSelected }) {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.9;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  const color = MEDIUM_COLORS[project.medium];
  const scale = isSelected ? 1.3 : 1;

  return (
    <group position={project.position} onClick={onClick}>
      {/* Outer glass sphere */}
      <mesh ref={meshRef} scale={scale}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <MeshTransmissionMaterial
          transmission={0.95}
          thickness={0.3}
          roughness={0.05}
          chromaticAberration={0.5}
          anisotropy={1}
          distortion={0.1}
          distortionScale={0.2}
          temporalDistortion={0.1}
          ior={1.5}
          color={color}
        />
      </mesh>

      {/* Inner glow sphere */}
      <mesh ref={glowRef} scale={0.6}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.6}
          toneMapped={false}
        />
      </mesh>

      {/* Label */}
      {isSelected && (
        <>
          <Text
            position={[0, 0.6, 0]}
            fontSize={0.15}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {project.title}
          </Text>
          <Text
            position={[0, 0.4, 0]}
            fontSize={0.08}
            color="#888888"
            anchorX="center"
            anchorY="middle"
            maxWidth={2}
          >
            {project.description}
          </Text>
        </>
      )}

      {/* Rim light */}
      <pointLight position={[0, 0, 0]} color={color} intensity={2} distance={1.5} />
    </group>
  );
}
