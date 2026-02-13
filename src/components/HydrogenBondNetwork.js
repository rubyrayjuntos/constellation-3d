import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { RESIDUES, HYDROGEN_BONDS } from '../data/proteinData';

export default function HydrogenBondNetwork({
  wrappedDehydrons = new Set(),
  showHBonds = true,
  showDehydrons = true,
  selectedBond = null,
  onSelectBond,
  breathingOffsets = null,
}) {
  const dehydronRefs = useRef({});
  const pulseRef = useRef(0);

  useFrame((state) => {
    pulseRef.current = state.clock.elapsedTime;

    // Pulse dehydrons
    HYDROGEN_BONDS.forEach(bond => {
      if (bond.isDehydron && dehydronRefs.current[bond.id]) {
        const mesh = dehydronRefs.current[bond.id];
        if (!wrappedDehydrons.has(bond.id)) {
          const pulse = Math.sin(state.clock.elapsedTime * 3 + bond.donor) * 0.3 + 0.7;
          mesh.material.opacity = pulse;
        }
      }
    });
  });

  // Compute bond geometry
  const bondData = useMemo(() => {
    return HYDROGEN_BONDS.map(bond => {
      const donorPos = RESIDUES[bond.donor].position;
      const acceptorPos = RESIDUES[bond.acceptor].position;
      return { ...bond, donorPos, acceptorPos };
    });
  }, []);

  if (!showHBonds && !showDehydrons) return null;

  return (
    <group>
      {bondData.map(bond => {
        const isWrapped = wrappedDehydrons.has(bond.id);
        const isSelected = selectedBond?.id === bond.id;

        // Get positions (with breathing offsets if available)
        const dPos = breathingOffsets?.[bond.donor]
          ? [
              bond.donorPos[0] + breathingOffsets[bond.donor][0],
              bond.donorPos[1] + breathingOffsets[bond.donor][1],
              bond.donorPos[2] + breathingOffsets[bond.donor][2],
            ]
          : bond.donorPos;
        const aPos = breathingOffsets?.[bond.acceptor]
          ? [
              bond.acceptorPos[0] + breathingOffsets[bond.acceptor][0],
              bond.acceptorPos[1] + breathingOffsets[bond.acceptor][1],
              bond.acceptorPos[2] + breathingOffsets[bond.acceptor][2],
            ]
          : bond.acceptorPos;

        if (bond.isDehydron && !showDehydrons) return null;
        if (!bond.isDehydron && !showHBonds) return null;

        let color, opacity, lineWidth;
        if (bond.isDehydron) {
          if (isWrapped) {
            color = '#44ff88'; // green when wrapped
            opacity = 0.9;
          } else {
            color = '#ff6622'; // orange/red pulsing
            opacity = 0.8;
          }
          lineWidth = 2;
        } else {
          color = '#4488ff'; // blue for normal H-bonds
          opacity = 0.3;
          lineWidth = 1;
        }

        return (
          <group key={bond.id}>
            {/* Bond line */}
            <line
              ref={bond.isDehydron ? (el) => { if (el) dehydronRefs.current[bond.id] = el; } : undefined}
              onClick={(e) => { e.stopPropagation(); onSelectBond?.(bond); }}
            >
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([
                    dPos[0], dPos[1], dPos[2],
                    aPos[0], aPos[1], aPos[2],
                  ])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial
                color={color}
                transparent
                opacity={opacity}
                blending={bond.isDehydron ? THREE.AdditiveBlending : THREE.NormalBlending}
                linewidth={lineWidth}
              />
            </line>

            {/* Dehydron glow tube */}
            {bond.isDehydron && !isWrapped && (
              <mesh position={[
                (dPos[0] + aPos[0]) / 2,
                (dPos[1] + aPos[1]) / 2,
                (dPos[2] + aPos[2]) / 2,
              ]}>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshBasicMaterial
                  color="#ff4400"
                  transparent
                  opacity={0.4}
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>
            )}

            {/* Wrapping count label at midpoint */}
            {(bond.isDehydron || isSelected) && (
              <Text
                position={[
                  (dPos[0] + aPos[0]) / 2 + 0.1,
                  (dPos[1] + aPos[1]) / 2 + 0.1,
                  (dPos[2] + aPos[2]) / 2,
                ]}
                fontSize={0.06}
                color={bond.isDehydron ? (isWrapped ? '#44ff88' : '#ff8844') : '#88aaff'}
                anchorX="left"
                anchorY="middle"
              >
                {`w:${isWrapped ? bond.wrappingCount + 8 : bond.wrappingCount}`}
              </Text>
            )}

            {/* Selection highlight */}
            {isSelected && (
              <mesh position={[
                (dPos[0] + aPos[0]) / 2,
                (dPos[1] + aPos[1]) / 2,
                (dPos[2] + aPos[2]) / 2,
              ]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial
                  color="#ffffff"
                  transparent
                  opacity={0.2}
                  depthWrite={false}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
