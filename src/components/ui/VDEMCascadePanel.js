const panelStyle = {
  position: 'absolute',
  bottom: 80,
  left: 20,
  fontFamily: 'monospace',
  fontSize: '11px',
  background: 'rgba(0,0,0,0.8)',
  padding: '12px',
  borderRadius: '4px',
  border: '1px solid #ff6644',
  backdropFilter: 'blur(10px)',
  color: '#fff',
  maxWidth: '320px',
  userSelect: 'none',
};

const stepIcons = ['🧬', '💧', '🔗', '🏗️', '🛑'];

export default function VDEMCascadePanel({ steps, currentStep, onAdvance }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div style={panelStyle}>
      <div style={{ marginBottom: '8px', color: '#ff6644', fontWeight: 'bold', fontSize: '10px' }}>
        VDEM CASCADE
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {steps.map((step, i) => {
          const isActive = i <= currentStep;
          const isCurrent = i === currentStep;
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isActive ? 1 : 0.3,
                transition: 'opacity 0.3s ease',
              }}
            >
              <span style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: `1px solid ${isActive ? '#ff6644' : '#444'}`,
                background: isActive ? '#ff6644' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8px',
                flexShrink: 0,
                boxShadow: isCurrent ? '0 0 8px #ff6644' : 'none',
              }}>
                {isActive ? stepIcons[i] || '✓' : (i + 1)}
              </span>
              <span style={{
                fontSize: '10px',
                color: isActive ? '#fff' : '#666',
              }}>
                {step}
              </span>
              {i < steps.length - 1 && isActive && (
                <span style={{ color: '#ff6644', fontSize: '10px' }}>→</span>
              )}
            </div>
          );
        })}
      </div>
      {currentStep < steps.length - 1 && (
        <button
          onClick={onAdvance}
          style={{
            marginTop: '8px',
            background: 'rgba(255,102,68,0.2)',
            border: '1px solid #ff6644',
            color: '#ff6644',
            fontFamily: 'monospace',
            fontSize: '10px',
            padding: '4px 12px',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
        >
          Next Step →
        </button>
      )}
    </div>
  );
}
