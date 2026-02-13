import { STABILIZERS } from '../../data/proteinData';

const toolbarStyle = {
  position: 'absolute',
  bottom: 20,
  left: '50%',
  transform: 'translateX(-50%)',
  fontFamily: 'monospace',
  fontSize: '11px',
  background: 'rgba(0,0,0,0.8)',
  padding: '8px 12px',
  borderRadius: '4px',
  border: '1px solid #44ffaa',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  userSelect: 'none',
};

export default function StabilizerToolbar({ selectedTemplate, onSelectTemplate, onCancel, placedCount }) {
  const templates = Object.values(STABILIZERS);

  return (
    <div style={toolbarStyle}>
      <span style={{ color: '#44ffaa', fontSize: '10px', fontWeight: 'bold', marginRight: '4px' }}>
        STABILIZERS ({placedCount}/3)
      </span>
      {templates.map(template => {
        const isSelected = selectedTemplate === template.id;
        return (
          <button
            key={template.id}
            onClick={() => isSelected ? onCancel() : onSelectTemplate(template.id)}
            title={template.description}
            style={{
              background: isSelected ? template.color : 'rgba(255,255,255,0.05)',
              border: `1px solid ${template.color}`,
              color: isSelected ? '#000' : template.color,
              fontFamily: 'monospace',
              fontSize: '10px',
              padding: '4px 10px',
              borderRadius: '3px',
              cursor: 'pointer',
              fontWeight: isSelected ? 'bold' : 'normal',
              boxShadow: isSelected ? `0 0 10px ${template.color}` : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {template.name}
          </button>
        );
      })}
      {selectedTemplate && (
        <span style={{ color: '#888', fontSize: '9px', marginLeft: '4px' }}>
          Click near a dehydron to place
        </span>
      )}
    </div>
  );
}
