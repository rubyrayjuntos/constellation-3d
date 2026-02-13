import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function ResidueNode({ residue, isSelected, isHovered, onClick, onPointerOver, onPointerOut, breathingOffset }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current && breathingOffset) {
      groupRef.current.position.set(
        residue.position[0] + breathingOffset[0],
        residue.position[1] + breathingOffset[1],
        residue.position[2] + breathingOffset[2]
      );
    }
  });

  const scale = isSelected ? 1.4 : isHovered ? 1.2 : 1;
  const sideChainEnd = [
    residue.sideChainDir[0] * residue.sideChainLength,
    residue.sideChainDir[1] * residue.sideChainLength,
    residue.sideChainDir[2] * residue.sideChainLength,
  ];

  return (
    <group
      ref={groupRef}
      position={residue.position}
      onClick={(e) => { e.stopPropagation(); onClick?.(residue); }}
      onPointerOver={(e) => { e.stopPropagation(); onPointerOver?.(residue); }}
      onPointerOut={(e) => { e.stopPropagation(); onPointerOut?.(residue); }}
    >
      {/* Alpha carbon */}
      <mesh scale={scale}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color={residue.color}
          emissive={residue.color}
          emissiveIntensity={isSelected ? 0.8 : isHovered ? 0.5 : 0.2}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Side chain cylinder */}
      {residue.sideChainLength > 0.1 && (
        <group position={[sideChainEnd[0]/2, sideChainEnd[1]/2, sideChainEnd[2]/2]}>
          <mesh
            rotation={[
              Math.atan2(
                Math.sqrt(residue.sideChainDir[0]**2 + residue.sideChainDir[2]**2),
                residue.sideChainDir[1]
              ),
              0,
              Math.atan2(residue.sideChainDir[0], residue.sideChainDir[2])
            ]}
          >
            <cylinderGeometry args={[0.025, 0.035, residue.sideChainLength, 8]} />
            <meshStandardMaterial
              color={residue.color}
              emissive={residue.color}
              emissiveIntensity={0.1}
              roughness={0.5}
            />
          </mesh>
          {/* Side chain tip */}
          <mesh position={[sideChainEnd[0]/2, sideChainEnd[1]/2, sideChainEnd[2]/2]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial
              color={residue.color}
              emissive={residue.color}
              emissiveIntensity={0.15}
            />
          </mesh>
        </group>
      )}

      {/* Selection glow */}
      {isSelected && (
        <mesh>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial
            color={residue.color}
            transparent
            opacity={0.3}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}
