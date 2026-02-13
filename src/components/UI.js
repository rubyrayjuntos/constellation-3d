import { MEDIUM_COLORS } from '../data/projectData';

export default function UI({ selectedProject, projectCount, facetCount }) {
  return (
    <>
      {/* Top left info */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: '#00ff00',
        fontFamily: 'monospace',
        fontSize: '12px',
        background: 'rgba(0,0,0,0.7)',
        padding: '12px',
        borderRadius: '4px',
        border: '1px solid #00ff00',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
          CONSTELLATION V1
        </div>
        <div>Projects: {projectCount}</div>
        <div>Facets: {facetCount}</div>
        <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.7 }}>
          Click nodes to select<br/>
          Drag to orbit<br/>
          Scroll to zoom
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        color: '#00ff00',
        fontFamily: 'monospace',
        fontSize: '10px',
        display: 'flex',
        gap: '16px'
      }}>
        {Object.entries(MEDIUM_COLORS).map(([medium, color]) => (
          <div key={medium} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              background: color,
              boxShadow: `0 0 10px ${color}`
            }} />
            <span style={{ textTransform: 'capitalize' }}>{medium}</span>
          </div>
        ))}
      </div>

      {/* Selected project panel */}
      {selectedProject && (
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          color: '#fff',
          fontFamily: 'monospace',
          fontSize: '12px',
          background: 'rgba(0,0,0,0.8)',
          padding: '16px',
          borderRadius: '4px',
          border: `2px solid ${MEDIUM_COLORS[selectedProject.medium]}`,
          backdropFilter: 'blur(10px)',
          maxWidth: '300px'
        }}>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            marginBottom: '8px',
            color: MEDIUM_COLORS[selectedProject.medium]
          }}>
            {selectedProject.title}
          </div>
          <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>
            {selectedProject.medium.toUpperCase()}
          </div>
          <div style={{ marginBottom: '12px' }}>
            {selectedProject.description}
          </div>
          <div style={{ fontSize: '10px', opacity: 0.7 }}>
            <strong>Facets:</strong> {selectedProject.facets.join(', ')}
          </div>
        </div>
      )}
    </>
  );
}
