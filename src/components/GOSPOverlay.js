import { useState } from 'react';
import DSMStateGraph from './ui/DSMStateGraph';
import VDEMCascadePanel from './ui/VDEMCascadePanel';
import StabilizerToolbar from './ui/StabilizerToolbar';
import ResidueInfoPanel from './ui/ResidueInfoPanel';
import VisualizationControls from './ui/VisualizationControls';
import GOSPLockPanel from './ui/GOSPLockPanel';

export default function GOSPOverlay({ state, actions, orphanMode = false, onOrphanLock }) {
  const [showOrphanDemo, setShowOrphanDemo] = useState(orphanMode);

  return (
    <>
      <button
        onClick={() => setShowOrphanDemo(!showOrphanDemo)}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          fontFamily: 'monospace',
          fontSize: '10px',
          background: showOrphanDemo ? '#00ffff' : 'rgba(0,0,0,0.8)',
          color: showOrphanDemo ? '#000' : '#fff',
          border: '1px solid ' + (showOrphanDemo ? '#00ffff' : '#666'),
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          zIndex: 1000
        }}
      >
        {showOrphanDemo ? '🔬 YBR032W MODE' : '🧬 DEMO MODE'}
      </button>

      {showOrphanDemo ? (
        <GOSPLockPanel onLockComplete={onOrphanLock} />
      ) : (
        <>
          <DSMStateGraph
            currentState={state.dsmState}
            onTransition={actions.transitionDSM}
          />

      <VDEMCascadePanel
        steps={state.vdemSteps}
        currentStep={state.vdemCurrentStep}
        onAdvance={actions.advanceVDEM}
      />

      <StabilizerToolbar
        selectedTemplate={state.selectedTemplate}
        onSelectTemplate={actions.selectTemplate}
        onCancel={actions.cancelPlacement}
        placedCount={state.placedStabilizers.length}
      />

      <ResidueInfoPanel
        selectedResidue={state.selectedResidue}
        selectedBond={state.selectedBond}
        wrappedDehydrons={state.wrappedDehydrons}
      />

      <VisualizationControls
        state={state}
        onToggle={actions.toggleVis}
        breathingSpeed={state.breathingSpeed}
        onSpeedChange={actions.setBreathingSpeed}
        onReset={actions.reset}
      />

          {state.activeTool === 'place_stabilizer' && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#44ffaa',
              background: 'rgba(0,0,0,0.6)',
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid #44ffaa',
              pointerEvents: 'none',
              animation: 'pulse 2s ease-in-out infinite',
            }}>
              PLACEMENT MODE — Click near a dehydron
            </div>
          )}
        </>
      )}
    </>
  );
}
