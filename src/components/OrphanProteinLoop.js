import { useRef } from 'react';
import { Line } from '@react-three/drei';
import { useMachine } from '@xstate/react';
import { gospLockMachine } from '../state/gospLockMachine';
import { YBR032W_DATA } from '../data/ybr032wData';

export default function OrphanProteinLoop({ isLocked = false }) {
  const groupRef = useRef();
  const [state, send] = useMachine(gospLockMachine);
  
  const loopPoints = YBR032W_DATA.disorderedLoop;
  const machineIsLocked = state.context.isPhysicallyLocked || isLocked;
  
  const ghostColor = machineIsLocked ? '#00ffff' : '#ff6644';
  const opacity = machineIsLocked ? 1.0 : 0.3;
  const lineWidth = machineIsLocked ? 3 : 1;

  return (
    <group ref={groupRef}>
      {/* Backbone trace */}
      <Line
        points={loopPoints}
        color={ghostColor}
        lineWidth={lineWidth}
        opacity={opacity}
        transparent
        dashed={!isLocked}
        dashScale={50}
        dashSize={0.1}
        gapSize={0.05}
      />

      {/* Residue markers */}
      {loopPoints.map((pos, i) => (
        <mesh 
          key={i} 
          position={pos}
          onClick={() => {
            if (state.matches('SEARCH')) {
              send({ type: 'IDENTIFY_VOID', coordinates: pos });
            }
          }}
        >
          <sphereGeometry args={[machineIsLocked ? 0.08 : 0.05, 8, 8]} />
          <meshStandardMaterial 
            color={ghostColor}
            transparent
            opacity={opacity}
            emissive={machineIsLocked ? '#00ffff' : '#000'}
            emissiveIntensity={machineIsLocked ? 0.5 : 0}
          />
        </mesh>
      ))}

      {/* Ma-stabilizer void visualization */}
      {!machineIsLocked && (
        <mesh position={YBR032W_DATA.maStabilizerTarget.position}>
          <sphereGeometry args={[YBR032W_DATA.maStabilizerTarget.radius, 16, 16]} />
          <meshStandardMaterial
            color="#ffaa00"
            transparent
            opacity={0.15}
            wireframe
          />
        </mesh>
      )}

      {/* Locked state: Ma-stabilizer placed */}
      {machineIsLocked && (
        <group position={YBR032W_DATA.maStabilizerTarget.position}>
          {/* Central stabilizer molecule */}
          <mesh>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.8}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          
          {/* Stabilizing tendrils to H-bonds */}
          {YBR032W_DATA.maStabilizerTarget.potentialHBonds.map((bond, i) => {
            const targetPos = loopPoints[bond.donor - 45] || loopPoints[0];
            return (
              <Line
                key={i}
                points={[
                  [0, 0, 0],
                  [
                    targetPos[0] - YBR032W_DATA.maStabilizerTarget.position[0],
                    targetPos[1] - YBR032W_DATA.maStabilizerTarget.position[1],
                    targetPos[2] - YBR032W_DATA.maStabilizerTarget.position[2]
                  ]
                ]}
                color="#00ffff"
                lineWidth={2}
                opacity={0.6}
                transparent
              />
            );
          })}
        </group>
      )}
    </group>
  );
}
