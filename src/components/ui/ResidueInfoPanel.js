const panelStyle = {
  position: 'absolute',
  top: 20,
  right: 20,
  fontFamily: 'monospace',
  fontSize: '11px',
  background: 'rgba(0,0,0,0.8)',
  padding: '14px',
  borderRadius: '4px',
  backdropFilter: 'blur(10px)',
  color: '#fff',
  maxWidth: '260px',
  userSelect: 'none',
};

export default function ResidueInfoPanel({ selectedResidue, selectedBond, wrappedDehydrons }) {
  if (!selectedResidue && !selectedBond) return null;

  if (selectedResidue) {
    return (
      <div style={{ ...panelStyle, border: `2px solid ${selectedResidue.color}` }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '6px', color: selectedResidue.color }}>
          {selectedResidue.name} ({selectedResidue.code})
        </div>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '6px' }}>
          Residue #{selectedResidue.index} — {selectedResidue.type}
        </div>
        <table style={{ fontSize: '10px', borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ padding: '2px 8px 2px 0', color: '#888' }}>Type</td>
              <td style={{ color: selectedResidue.color }}>{selectedResidue.residueType}</td>
            </tr>
            <tr>
              <td style={{ padding: '2px 8px 2px 0', color: '#888' }}>Structure</td>
              <td>{selectedResidue.secondaryStructure}</td>
            </tr>
            <tr>
              <td style={{ padding: '2px 8px 2px 0', color: '#888' }}>Breathing</td>
              <td>{selectedResidue.breathingAmplitude.toFixed(3)}Å</td>
            </tr>
            <tr>
              <td style={{ padding: '2px 8px 2px 0', color: '#888' }}>Position</td>
              <td style={{ fontSize: '9px' }}>
                [{selectedResidue.position.map(v => v.toFixed(2)).join(', ')}]
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (selectedBond) {
    const isWrapped = wrappedDehydrons?.has(selectedBond.id);
    const borderColor = selectedBond.isDehydron
      ? (isWrapped ? '#44ff88' : '#ff6622')
      : '#4488ff';

    return (
      <div style={{ ...panelStyle, border: `2px solid ${borderColor}` }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '6px', color: borderColor }}>
          {selectedBond.isDehydron ? 'DEHYDRON' : 'H-Bond'} {selectedBond.id}
        </div>
        <table style={{ fontSize: '10px', borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ padding: '2px 8px 2px 0', color: '#888' }}>Donor</td>
              <td>Residue {selectedBond.donor} ({selectedBond.donorId})</td>
            </tr>
            <tr>
              <td style={{ padding: '2px 8px 2px 0', color: '#888' }}>Acceptor</td>
              <td>Residue {selectedBond.acceptor} ({selectedBond.acceptorId})</td>
            </tr>
            <tr>
              <td style={{ padding: '2px 8px 2px 0', color: '#888' }}>Wrapping</td>
              <td style={{ color: borderColor }}>
                {isWrapped ? selectedBond.wrappingCount + 8 : selectedBond.wrappingCount}
                {selectedBond.isDehydron && !isWrapped && ' (under-wrapped!)'}
                {isWrapped && ' (stabilized)'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '2px 8px 2px 0', color: '#888' }}>Strength</td>
              <td>{(selectedBond.strength * 100).toFixed(0)}%</td>
            </tr>
            <tr>
              <td style={{ padding: '2px 8px 2px 0', color: '#888' }}>Status</td>
              <td style={{ color: borderColor }}>
                {selectedBond.isDehydron
                  ? (isWrapped ? 'Wrapped (stabilized)' : 'Exposed (vulnerable)')
                  : 'Normal H-bond'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}
