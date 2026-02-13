import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Generates a small molecular cluster (atoms + bonds) for the stabilizer
function generateAtomLayout(atomCount) {
  const atoms = [{ pos: [0, 0, 0] }]; // central atom
  const bonds = [];

  for (let i = 1; i < atomCount; i++) {
    const angle = (i / (atomCount - 1)) * Math.PI * 2;
    const r = 0.12 + Math.random() * 0.06;
    const y = (Math.random() - 0.5) * 0.1;
    const pos = [Math.cos(angle) * r, y, Math.sin(angle) * r];
    atoms.push({ pos });
    bonds.push({ from: 0, to: i });
    // Add some cross-bonds
    if (i > 1 && Math.random() > 0.5) {
      bonds.push({ from: i - 1, to: i });
    }
  }
  return { atoms, bonds };
}

export default function StabilizerMolecule({ stabilizer, onRemove }) {
  const groupRef = useRef();
  const scaleRef = useRef(0.01); // start tiny for scale-in animation

  const layout = useRef(generateAtomLayout(stabilizer.atomCount)).current;

  useFrame((state) => {
    if (!groupRef.current) return;

    // Scale-in animation
    if (scaleRef.current < 1) {
      scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, 1, 0.05);
      groupRef.current.scale.setScalar(scaleRef.current);
    }

    // Gentle rotation
    groupRef.current.rotation.y += 0.003;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });

  return (
    <group
      ref={groupRef}
      position={stabilizer.position}
      scale={0.01}
      onClick={(e) => { e.stopPropagation(); onRemove?.(stabilizer.id); }}
    >
      {/* Atom spheres with glass material */}
      {layout.atoms.map((atom, i) => (
        <mesh key={`atom-${i}`} position={atom.pos}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <MeshTransmissionMaterial
            transmission={0.9}
            thickness={0.2}
            roughness={0.05}
            chromaticAberration={0.3}
            ior={1.4}
            color={stabilizer.color}
          />
        </mesh>
      ))}

      {/* Bond cylinders */}
      {layout.bonds.map((bond, i) => {
        const from = layout.atoms[bond.from].pos;
        const to = layout.atoms[bond.to].pos;
        const mid = [
          (from[0] + to[0]) / 2,
          (from[1] + to[1]) / 2,
          (from[2] + to[2]) / 2,
        ];
        const dir = new THREE.Vector3(
          to[0] - from[0],
          to[1] - from[1],
          to[2] - from[2]
        );
        const length = dir.length();
        dir.normalize();

        // Compute rotation to align cylinder with bond direction
        const up = new THREE.Vector3(0, 1, 0);
        const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
        const euler = new THREE.Euler().setFromQuaternion(quat);

        return (
          <mesh key={`bond-${i}`} position={mid} rotation={euler}>
            <cylinderGeometry args={[0.01, 0.01, length, 6]} />
            <meshStandardMaterial
              color={stabilizer.color}
              emissive={stabilizer.color}
              emissiveIntensity={0.3}
              transparent
              opacity={0.7}
            />
          </mesh>
        );
      })}

      {/* Glow sphere */}
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial
          color={stabilizer.color}
          transparent
          opacity={0.2}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Point light */}
      <pointLight color={stabilizer.color} intensity={1} distance={1} />
    </group>
  );
}
