import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VOIDS } from '../data/proteinData';

export default function VoidVisualization({ placedStabilizers = [], showVoids = true }) {
  const voidRefs = useRef({});

  useFrame((state) => {
    if (!showVoids) return;

    VOIDS.forEach(v => {
      const mesh = voidRefs.current[v.id];
      if (!mesh) return;

      // Check if a stabilizer covers this void
      let stabilized = false;
      for (const stab of placedStabilizers) {
        const dx = v.center[0] - stab.position[0];
        const dy = v.center[1] - stab.position[1];
        const dz = v.center[2] - stab.position[2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < stab.effectRadius) {
          stabilized = true;
          break;
        }
      }

      // Pulse animation (like Sun.js pattern)
      const pulse = Math.sin(state.clock.elapsedTime * 1.5 + v.center[0]) * 0.15 + 1;

      if (stabilized) {
        // Shrink and fade when stabilized
        const targetScale = 0.3;
        mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.02);
        mesh.material.opacity = THREE.MathUtils.lerp(mesh.material.opacity, 0.05, 0.02);
      } else {
        mesh.scale.setScalar(pulse);
        mesh.material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 2 + v.center[1]) * 0.05;
      }
    });
  });

  if (!showVoids) return null;

  return (
    <group>
      {VOIDS.map(v => (
        <group key={v.id}>
          {/* Void cavity sphere */}
          <mesh
            ref={(el) => { if (el) voidRefs.current[v.id] = el; }}
            position={v.center}
          >
            <sphereGeometry args={[v.radius, 24, 24]} />
            <meshBasicMaterial
              color="#ff4400"
              transparent
              opacity={0.15}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>

          {/* Inner glow core */}
          <mesh position={v.center}>
            <sphereGeometry args={[v.radius * 0.4, 16, 16]} />
            <meshBasicMaterial
              color="#ff6633"
              transparent
              opacity={0.25}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>

          {/* Soft light at void center */}
          <pointLight
            position={v.center}
            color="#ff4400"
            intensity={0.5}
            distance={v.radius * 3}
          />
        </group>
      ))}
    </group>
  );
}
