import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ResidueNode from './ResidueNode';
import { RESIDUES, BACKBONE_POINTS } from '../data/proteinData';

export default function ProteinBackbone({
  breathingEnabled = false,
  breathingSpeed = 1,
  placedStabilizers = [],
  selectedResidue = null,
  hoveredResidue = null,
  onSelectResidue,
  onHoverResidue,
  showBackbone = true,
  showSideChains = true,
}) {
  const tubeRef = useRef();
  const breathingOffsetsRef = useRef(RESIDUES.map(() => [0, 0, 0]));

  // Build backbone curve
  const tubeGeometry = useMemo(() => {
    const points = BACKBONE_POINTS.map(p => new THREE.Vector3(p[0], p[1], p[2]));
    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
    return new THREE.TubeGeometry(curve, 120, 0.03, 8, false);
  }, []);

  // Breathing animation
  useFrame((state) => {
    if (!breathingEnabled) {
      breathingOffsetsRef.current = RESIDUES.map(() => [0, 0, 0]);
      return;
    }

    const t = state.clock.elapsedTime * breathingSpeed;

    RESIDUES.forEach((residue, i) => {
      let amplitude = residue.breathingAmplitude;

      // Damping from nearby stabilizers
      for (const stab of placedStabilizers) {
        const dx = residue.position[0] - stab.position[0];
        const dy = residue.position[1] - stab.position[1];
        const dz = residue.position[2] - stab.position[2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < stab.effectRadius) {
          const dampFactor = dist / stab.effectRadius;
          amplitude *= dampFactor;
        }
      }

      const phase = residue.breathingPhase;
      breathingOffsetsRef.current[i] = [
        Math.sin(t + phase) * amplitude * 0.5,
        Math.sin(t * 1.3 + phase * 1.2) * amplitude,
        Math.cos(t * 0.7 + phase) * amplitude * 0.3,
      ];
    });

    // Update tube geometry vertices for breathing
    if (tubeRef.current && breathingEnabled) {
      const positions = tubeRef.current.geometry.attributes.position;
      const originalGeo = tubeGeometry;
      const origPositions = originalGeo.attributes.position;

      for (let vi = 0; vi < positions.count; vi++) {
        const ox = origPositions.getX(vi);
        const oy = origPositions.getY(vi);
        const oz = origPositions.getZ(vi);

        // Find nearest residue to this vertex
        let minDist = Infinity;
        let nearestIdx = 0;
        for (let ri = 0; ri < RESIDUES.length; ri++) {
          const r = RESIDUES[ri];
          const d = (ox - r.position[0])**2 + (oy - r.position[1])**2 + (oz - r.position[2])**2;
          if (d < minDist) { minDist = d; nearestIdx = ri; }
        }

        const off = breathingOffsetsRef.current[nearestIdx];
        positions.setXYZ(vi, ox + off[0], oy + off[1], oz + off[2]);
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Backbone tube */}
      {showBackbone && (
        <mesh ref={tubeRef}>
          <primitive object={tubeGeometry.clone()} attach="geometry" />
          <meshStandardMaterial
            color="#667788"
            emissive="#334455"
            emissiveIntensity={0.3}
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>
      )}

      {/* Residue nodes */}
      {RESIDUES.map((residue) => (
        <ResidueNode
          key={residue.id}
          residue={residue}
          isSelected={selectedResidue?.id === residue.id}
          isHovered={hoveredResidue?.id === residue.id}
          onClick={onSelectResidue}
          onPointerOver={showSideChains ? onHoverResidue : undefined}
          onPointerOut={showSideChains ? () => onHoverResidue?.(null) : undefined}
          breathingOffset={breathingOffsetsRef.current[residue.index]}
        />
      ))}
    </group>
  );
}
