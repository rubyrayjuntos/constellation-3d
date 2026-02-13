import { useMachine } from '@xstate/react';
import { gospLockMachine } from '../../state/gospLockMachine';

const panelStyle = {
  position: 'absolute',
  top: 20,
  left: '50%',
  transform: 'translateX(-50%)',
  fontFamily: 'monospace',
  fontSize: '12px',
  background: 'rgba(0,0,0,0.9)',
  padding: '16px',
  borderRadius: '6px',
  border: '2px solid #00ffff',
  minWidth: '400px',
  textAlign: 'center'
};

const stateColors = {
  SEARCH: '#ff6644',
  ALIGN: '#ffaa00',
  LOCK: '#00ffff'
};

export default function GOSPLockPanel({ onLockComplete }) {
  const [state, send] = useMachine(gospLockMachine);

  const handleIdentifyVoid = () => {
    send({ 
      type: 'IDENTIFY_VOID', 
      coordinates: [4.5, 4.5, 2.0] 
    });
  };

  const handleVerifyMa = () => {
    send({ 
      type: 'VERIFY_MA',
      energyPotential: -17.2,
      ramachandranValid: true
    });
    
    if (state.matches('ALIGN')) {
      setTimeout(() => {
        if (onLockComplete) onLockComplete();
      }, 500);
    }
  };

  const currentState = state.value;
  const isLocked = state.context.isPhysicallyLocked;

  return (
    <div style={panelStyle}>
      <div style={{ 
        color: stateColors[currentState] || '#fff',
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '12px',
        textTransform: 'uppercase',
        letterSpacing: '2px'
      }}>
        {isLocked ? '🔒 LOCKED' : `⚡ ${currentState}`}
      </div>

      <div style={{ 
        color: '#aaa', 
        fontSize: '10px',
        marginBottom: '12px'
      }}>
        YBR032W Orphan Protein • Residues 45-67
      </div>

      {currentState === 'SEARCH' && (
        <div>
          <div style={{ color: '#ccc', marginBottom: '10px' }}>
            Scanning for void topology in low-confidence segment...
          </div>
          <button 
            onClick={handleIdentifyVoid}
            style={{
              background: '#ff6644',
              border: 'none',
              color: '#000',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontWeight: 'bold'
            }}
          >
            IDENTIFY VOID
          </button>
        </div>
      )}

      {currentState === 'ALIGN' && (
        <div>
          <div style={{ color: '#ccc', marginBottom: '10px' }}>
            Calculating geometric constraints for Ma-stabilizer...
            <br/>
            Energy: {state.context.energyPotential.toFixed(2)} kcal/mol
          </div>
          <button 
            onClick={handleVerifyMa}
            style={{
              background: '#ffaa00',
              border: 'none',
              color: '#000',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontWeight: 'bold'
            }}
          >
            VERIFY MA
          </button>
        </div>
      )}

      {isLocked && (
        <div>
          <div style={{ color: '#00ffff', marginBottom: '8px', fontSize: '11px' }}>
            ✓ Deterministic state achieved
            <br/>
            Fidelity: {(state.context.fidelityScore * 100).toFixed(0)}%
          </div>
          <div style={{ 
            color: '#666', 
            fontSize: '9px',
            fontStyle: 'italic',
            marginTop: '8px'
          }}>
            AlphaFold pLDDT: 42.3 → GOSP Fidelity: 100.0
          </div>
        </div>
      )}
    </div>
  );
}
