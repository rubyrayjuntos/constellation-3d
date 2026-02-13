import { DSM_STATE_LIST, DSM_TRANSITIONS } from '../../data/dsmStates';

const panelStyle = {
  position: 'absolute',
  top: 20,
  left: 20,
  fontFamily: 'monospace',
  fontSize: '11px',
  background: 'rgba(0,0,0,0.8)',
  padding: '12px',
  borderRadius: '4px',
  border: '1px solid #44aaff',
  backdropFilter: 'blur(10px)',
  color: '#fff',
  userSelect: 'none',
};

export default function DSMStateGraph({ currentState, onTransition }) {
  const nodeWidth = 80;
  const nodeHeight = 30;
  const gap = 12;
  const totalWidth = DSM_STATE_LIST.length * (nodeWidth + gap) - gap;
  const svgHeight = 70;

  return (
    <div style={panelStyle}>
      <div style={{ marginBottom: '6px', color: '#44aaff', fontWeight: 'bold', fontSize: '10px' }}>
        DSM STATE GRAPH
      </div>
      <svg width={totalWidth} height={svgHeight} style={{ display: 'block' }}>
        {/* Transition arrows */}
        {DSM_STATE_LIST.map((state) => {
          const fromIdx = state.index;
          const targets = DSM_TRANSITIONS[state.id] || [];
          return targets.map(targetId => {
            const target = DSM_STATE_LIST.find(s => s.id === targetId);
            if (!target) return null;
            const toIdx = target.index;
            const x1 = fromIdx * (nodeWidth + gap) + nodeWidth;
            const x2 = toIdx * (nodeWidth + gap);
            const y = 20;

            // Forward arrow (top), backward arrow (bottom)
            const isForward = toIdx > fromIdx;
            const arrowY = isForward ? y - 2 : y + nodeHeight + 8;
            const midX = (x1 + x2) / 2;

            return (
              <g key={`${state.id}-${targetId}`}>
                <path
                  d={isForward
                    ? `M ${x1} ${y + nodeHeight/2} Q ${midX} ${arrowY - 10} ${x2} ${y + nodeHeight/2}`
                    : `M ${x1} ${y + nodeHeight/2} Q ${midX} ${arrowY + 10} ${x2} ${y + nodeHeight/2}`
                  }
                  fill="none"
                  stroke={state.color}
                  strokeWidth={1}
                  opacity={0.5}
                  markerEnd="url(#arrowhead)"
                />
              </g>
            );
          });
        })}

        {/* Arrowhead marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="6"
            markerHeight="4"
            refX="6"
            refY="2"
            orient="auto"
          >
            <polygon points="0 0, 6 2, 0 4" fill="#88aacc" />
          </marker>
        </defs>

        {/* State nodes */}
        {DSM_STATE_LIST.map((state) => {
          const x = state.index * (nodeWidth + gap);
          const y = 20;
          const isCurrent = currentState === state.id;
          const isReachable = DSM_TRANSITIONS[currentState]?.includes(state.id);

          return (
            <g
              key={state.id}
              onClick={() => isReachable && onTransition(state.id)}
              style={{ cursor: isReachable ? 'pointer' : 'default' }}
            >
              <rect
                x={x}
                y={y}
                width={nodeWidth}
                height={nodeHeight}
                rx={4}
                fill={isCurrent ? state.color : 'rgba(30,30,40,0.9)'}
                stroke={state.color}
                strokeWidth={isCurrent ? 2 : 1}
                opacity={isCurrent ? 1 : isReachable ? 0.8 : 0.4}
              />
              {isCurrent && (
                <rect
                  x={x - 2}
                  y={y - 2}
                  width={nodeWidth + 4}
                  height={nodeHeight + 4}
                  rx={6}
                  fill="none"
                  stroke={state.color}
                  strokeWidth={1}
                  opacity={0.4}
                />
              )}
              <text
                x={x + nodeWidth / 2}
                y={y + nodeHeight / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isCurrent ? '#000' : state.color}
                fontSize="9"
                fontFamily="monospace"
                fontWeight={isCurrent ? 'bold' : 'normal'}
              >
                {state.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
