const panelStyle = {
  position: 'absolute',
  top: 120,
  right: 20,
  fontFamily: 'monospace',
  fontSize: '10px',
  background: 'rgba(0,0,0,0.8)',
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #666',
  backdropFilter: 'blur(10px)',
  color: '#fff',
  userSelect: 'none',
};

const toggles = [
  { key: 'showBackbone', label: 'Backbone', color: '#667788' },
  { key: 'showSideChains', label: 'Side Chains', color: '#88cc88' },
  { key: 'showHBonds', label: 'H-Bonds', color: '#4488ff' },
  { key: 'showDehydrons', label: 'Dehydrons', color: '#ff6622' },
  { key: 'showVoids', label: 'Voids', color: '#ff4400' },
  { key: 'showWater', label: 'Water', color: '#4488ff' },
];

export default function VisualizationControls({
  state,
  onToggle,
  breathingSpeed,
  onSpeedChange,
  onReset,
}) {
  return (
    <div style={panelStyle}>
      <div style={{ marginBottom: '6px', color: '#888', fontWeight: 'bold', fontSize: '9px' }}>
        VISUALIZATION
      </div>

      {toggles.map(({ key, label, color }) => (
        <label
          key={key}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '3px',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={state[key]}
            onChange={() => onToggle(key)}
            style={{ accentColor: color }}
          />
          <span style={{ color: state[key] ? color : '#555' }}>{label}</span>
        </label>
      ))}

      <div style={{ marginTop: '8px', borderTop: '1px solid #333', paddingTop: '6px' }}>
        <div style={{ marginBottom: '3px', color: '#888', fontSize: '9px' }}>
          BREATHING SPEED
        </div>
        <input
          type="range"
          min={0}
          max={3}
          step={0.1}
          value={breathingSpeed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#ff6644' }}
        />
        <div style={{ textAlign: 'center', color: '#666', fontSize: '9px' }}>
          {breathingSpeed.toFixed(1)}x
        </div>
      </div>

      <button
        onClick={onReset}
        style={{
          marginTop: '6px',
          width: '100%',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid #555',
          color: '#888',
          fontFamily: 'monospace',
          fontSize: '9px',
          padding: '4px',
          borderRadius: '3px',
          cursor: 'pointer',
        }}
      >
        Reset All
      </button>
    </div>
  );
}
