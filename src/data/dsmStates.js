// DSM (Deterministic State Machine) for protein folding states
// Five states with enforced valid transitions

export const DSM_STATES = {
  UNFOLDED: {
    id: 'UNFOLDED',
    label: 'Unfolded',
    color: '#888888',
    description: 'Disordered polypeptide chain',
    index: 0,
  },
  FOLDING: {
    id: 'FOLDING',
    label: 'Folding',
    color: '#ffaa44',
    description: 'Secondary structure forming',
    index: 1,
  },
  NATIVE: {
    id: 'NATIVE',
    label: 'Native',
    color: '#44aaff',
    description: 'Folded structure with breathing dynamics',
    index: 2,
  },
  BREATHING: {
    id: 'BREATHING',
    label: 'Breathing',
    color: '#ff6644',
    description: 'Conformational fluctuations expose dehydrons',
    index: 3,
  },
  STABILIZED: {
    id: 'STABILIZED',
    label: 'Stabilized',
    color: '#44ff88',
    description: 'All dehydrons wrapped — structure locked',
    index: 4,
  },
};

// Valid transitions: from → [allowed targets]
export const DSM_TRANSITIONS = {
  UNFOLDED: ['FOLDING'],
  FOLDING: ['NATIVE', 'UNFOLDED'],
  NATIVE: ['BREATHING', 'UNFOLDED'],
  BREATHING: ['STABILIZED', 'NATIVE'],
  STABILIZED: ['BREATHING'],
};

export const DSM_STATE_LIST = Object.values(DSM_STATES);

export function canTransition(from, to) {
  return DSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getValidTransitions(from) {
  return DSM_TRANSITIONS[from] || [];
}
