import { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import ProteinBackbone from './ProteinBackbone';
import HydrogenBondNetwork from './HydrogenBondNetwork';
import VoidVisualization from './VoidVisualization';
import WaterField from './WaterField';
import PlacedStabilizers from './PlacedStabilizers';
import OrphanProteinLoop from './OrphanProteinLoop';
import GOSPOverlay from './GOSPOverlay';
import useGOSPState from '../state/useGOSPState';
import { DEHYDRONS, STABILIZERS } from '../data/proteinData';

// Click handler — invisible sphere catches clicks for stabilizer placement
function ClickHandler({ state, actions }) {
  const handleClick = useCallback((event) => {
    if (state.activeTool !== 'place_stabilizer' || !state.selectedTemplate) return;

    // Get click point from the event
    const point = event.point;
    if (!point) return;

    const template = STABILIZERS[state.selectedTemplate];
    if (!template) return;

    // Find nearest unwrapped dehydron
    let nearest = null;
    let minDist = Infinity;

    DEHYDRONS.forEach(d => {
      if (state.wrappedDehydrons.has(d.id)) return;
      const mid = new THREE.Vector3(...d.midpoint);
      const dist = mid.distanceTo(point);
      if (dist < minDist) {
        minDist = dist;
        nearest = d;
      }
    });

    // Snap to dehydron if close enough
    if (nearest && minDist < 2) {
      actions.placeStabilizer({
        templateId: state.selectedTemplate,
        position: nearest.midpoint,
        effectRadius: template.effectRadius,
        targetDehydronId: nearest.id,
        color: template.color,
        atomCount: template.atomCount,
      });
    }
  }, [state.activeTool, state.selectedTemplate, state.wrappedDehydrons, actions]);

  return (
    <mesh
      visible={false}
      onClick={handleClick}
    >
      <sphereGeometry args={[50, 8, 8]} />
      <meshBasicMaterial side={THREE.BackSide} />
    </mesh>
  );
}

export default function GOSPScene() {
  const { state, actions } = useGOSPState();
  const [orphanLocked, setOrphanLocked] = useState(false);

  return (
    <>
      <Canvas>
        <color attach="background" args={['#020208']} />
        <fog attach="fog" args={['#020208', 8, 30]} />

        <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={55} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={20}
          autoRotate={state.activeTool !== 'place_stabilizer'}
          autoRotateSpeed={0.15}
        />

        <ProteinBackbone
          breathingEnabled={state.breathingEnabled}
          breathingSpeed={state.breathingSpeed}
          placedStabilizers={state.placedStabilizers}
          selectedResidue={state.selectedResidue}
          hoveredResidue={null}
          onSelectResidue={actions.selectResidue}
          onHoverResidue={() => {}}
          showBackbone={state.showBackbone}
          showSideChains={state.showSideChains}
        />

        <HydrogenBondNetwork
          wrappedDehydrons={state.wrappedDehydrons}
          showHBonds={state.showHBonds}
          showDehydrons={state.showDehydrons}
          selectedBond={state.selectedBond}
          onSelectBond={actions.selectBond}
        />

        <VoidVisualization
          placedStabilizers={state.placedStabilizers}
          showVoids={state.showVoids}
        />

        <WaterField
          placedStabilizers={state.placedStabilizers}
          showWater={state.showWater}
        />

        <PlacedStabilizers
          stabilizers={state.placedStabilizers}
          onRemove={actions.removeStabilizer}
        />

        <OrphanProteinLoop isLocked={orphanLocked} />

        <ClickHandler state={state} actions={actions} />

        {/* Lighting */}
        <ambientLight intensity={0.15} />
        <directionalLight position={[5, 8, 5]} intensity={0.4} color="#aabbcc" />
        <directionalLight position={[-3, -2, 4]} intensity={0.15} color="#445566" />

        <Environment preset="night" />

        <EffectComposer>
          <Bloom
            intensity={1.8}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      </Canvas>

      <GOSPOverlay 
        state={state} 
        actions={actions} 
        onOrphanLock={() => setOrphanLocked(true)}
      />
    </>
  );
}
