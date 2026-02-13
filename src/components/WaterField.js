import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VOIDS, RESIDUES } from '../data/proteinData';

// Generate bulk water shell and frustrated water in voids
function generateWaterParticles() {
  const bulkPositions = [];
  const bulkColors = [];
  const frustratedPositions = [];
  const frustratedColors = [];
  const frustratedVoidIndices = [];

  // Compute protein center and extent
  const center = new THREE.Vector3();
  RESIDUES.forEach(r => center.add(new THREE.Vector3(...r.position)));
  center.divideScalar(RESIDUES.length);

  // Bulk water: shell around protein (~800 particles)
  for (let i = 0; i < 800; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 3 + Math.random() * 4; // shell from radius 3 to 7

    bulkPositions.push(
      center.x + r * Math.sin(phi) * Math.cos(theta),
      center.y + r * Math.sin(phi) * Math.sin(theta),
      center.z + r * Math.cos(phi)
    );

    // Light blue with slight variation
    const blue = new THREE.Color();
    blue.setHSL(0.55 + Math.random() * 0.05, 0.6, 0.6 + Math.random() * 0.1);
    bulkColors.push(blue.r, blue.g, blue.b);
  }

  // Frustrated water: inside voids (~50 total)
  VOIDS.forEach((v, vi) => {
    for (let i = 0; i < v.frustratedWaterCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.random() * v.radius * 0.8;

      frustratedPositions.push(
        v.center[0] + r * Math.sin(phi) * Math.cos(theta),
        v.center[1] + r * Math.sin(phi) * Math.sin(theta),
        v.center[2] + r * Math.cos(phi)
      );

      // Red/orange for frustrated water
      const red = new THREE.Color();
      red.setHSL(0.05 + Math.random() * 0.05, 0.8, 0.55 + Math.random() * 0.1);
      frustratedColors.push(red.r, red.g, red.b);
      frustratedVoidIndices.push(vi);
    }
  });

  return {
    bulkPositions: new Float32Array(bulkPositions),
    bulkColors: new Float32Array(bulkColors),
    frustratedPositions: new Float32Array(frustratedPositions),
    frustratedColors: new Float32Array(frustratedColors),
    frustratedBasePositions: new Float32Array(frustratedPositions), // copy for animation
    frustratedVoidIndices,
  };
}

export default function WaterField({ placedStabilizers = [], showWater = true }) {
  const frustratedRef = useRef();
  const displacementRef = useRef(new Float32Array(150)); // enough for ~50 waters * 3 coords

  const waterData = useMemo(() => generateWaterParticles(), []);

  useFrame((state) => {
    if (!frustratedRef.current || !showWater) return;

    const positions = frustratedRef.current.geometry.attributes.position;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < waterData.frustratedVoidIndices.length; i++) {
      const vi = waterData.frustratedVoidIndices[i];
      const v = VOIDS[vi];
      const baseX = waterData.frustratedBasePositions[i * 3];
      const baseY = waterData.frustratedBasePositions[i * 3 + 1];
      const baseZ = waterData.frustratedBasePositions[i * 3 + 2];

      // Check if this void's water should be displaced
      let displaced = false;
      for (const stab of placedStabilizers) {
        const dx = v.center[0] - stab.position[0];
        const dy = v.center[1] - stab.position[1];
        const dz = v.center[2] - stab.position[2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < stab.effectRadius * 1.5) {
          displaced = true;
          break;
        }
      }

      if (displaced) {
        // Animate outward displacement
        const dispDir = new THREE.Vector3(
          baseX - v.center[0],
          baseY - v.center[1],
          baseZ - v.center[2]
        ).normalize();

        const targetDist = 3 + Math.random() * 0.5;
        const currentDisp = displacementRef.current[i] || 0;
        displacementRef.current[i] = THREE.MathUtils.lerp(currentDisp, targetDist, 0.02);

        positions.setXYZ(i,
          v.center[0] + dispDir.x * displacementRef.current[i],
          v.center[1] + dispDir.y * displacementRef.current[i],
          v.center[2] + dispDir.z * displacementRef.current[i]
        );
      } else {
        // Confined drift within void
        const drift = 0.03;
        positions.setXYZ(i,
          baseX + Math.sin(t * 0.5 + i) * drift,
          baseY + Math.cos(t * 0.7 + i * 1.3) * drift,
          baseZ + Math.sin(t * 0.3 + i * 0.7) * drift
        );
        displacementRef.current[i] = 0;
      }
    }

    positions.needsUpdate = true;
  });

  if (!showWater) return null;

  return (
    <group>
      {/* Bulk water shell */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={waterData.bulkPositions.length / 3}
            array={waterData.bulkPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={waterData.bulkColors.length / 3}
            array={waterData.bulkColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          vertexColors
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* Frustrated water in voids */}
      <points ref={frustratedRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={waterData.frustratedPositions.length / 3}
            array={waterData.frustratedPositions.slice()} // clone for mutation
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={waterData.frustratedColors.length / 3}
            array={waterData.frustratedColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          vertexColors
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
