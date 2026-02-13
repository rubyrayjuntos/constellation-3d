import { useReducer, useCallback } from 'react';
import { canTransition } from '../data/dsmStates';
import { DEHYDRONS } from '../data/proteinData';

const initialState = {
  // DSM
  dsmState: 'BREATHING',

  // Stabilizers
  placedStabilizers: [], // { id, templateId, position, effectRadius, targetDehydronId }
  wrappedDehydrons: new Set(),

  // Animation
  breathingEnabled: true,
  breathingSpeed: 1,

  // Selection
  selectedResidue: null,
  selectedBond: null,

  // Tool
  activeTool: 'inspect', // 'inspect' | 'place_stabilizer'
  selectedTemplate: null, // stabilizer template id

  // Visualization toggles
  showBackbone: true,
  showSideChains: true,
  showHBonds: true,
  showDehydrons: true,
  showVoids: true,
  showWater: true,

  // VDEM cascade
  vdemSteps: [],
  vdemCurrentStep: -1,
};

function gospReducer(state, action) {
  switch (action.type) {
    case 'TRANSITION_DSM': {
      if (!canTransition(state.dsmState, action.target)) return state;
      const newState = { ...state, dsmState: action.target };
      if (action.target === 'BREATHING') {
        newState.breathingEnabled = true;
      } else if (action.target === 'STABILIZED') {
        newState.breathingEnabled = false;
      }
      return newState;
    }

    case 'SELECT_TEMPLATE':
      return {
        ...state,
        activeTool: 'place_stabilizer',
        selectedTemplate: action.template,
      };

    case 'CANCEL_PLACEMENT':
      return {
        ...state,
        activeTool: 'inspect',
        selectedTemplate: null,
      };

    case 'PLACE_STABILIZER': {
      if (state.placedStabilizers.length >= 3) return state; // max 3

      const newWrapped = new Set(state.wrappedDehydrons);
      newWrapped.add(action.targetDehydronId);

      const newStabilizers = [...state.placedStabilizers, {
        id: `stab_${Date.now()}`,
        templateId: action.templateId,
        position: action.position,
        effectRadius: action.effectRadius,
        targetDehydronId: action.targetDehydronId,
        color: action.color,
        atomCount: action.atomCount,
      }];

      // Check if all dehydrons are wrapped → auto-transition to STABILIZED
      const allWrapped = DEHYDRONS.every(d => newWrapped.has(d.id));
      let newDsmState = state.dsmState;
      if (allWrapped && canTransition(state.dsmState, 'STABILIZED')) {
        newDsmState = 'STABILIZED';
      }

      // VDEM cascade steps
      const vdemSteps = [
        `Stabilizer wraps dehydron ${action.targetDehydronId}`,
        'Frustrated water expelled from void',
        'H-bond strengthened (wrapping +8)',
        'Local rigidity increases',
        'Breathing arrested near stabilizer',
      ];

      return {
        ...state,
        placedStabilizers: newStabilizers,
        wrappedDehydrons: newWrapped,
        activeTool: 'inspect',
        selectedTemplate: null,
        dsmState: newDsmState,
        breathingEnabled: newDsmState !== 'STABILIZED',
        vdemSteps,
        vdemCurrentStep: 0,
      };
    }

    case 'REMOVE_STABILIZER': {
      const stab = state.placedStabilizers.find(s => s.id === action.id);
      if (!stab) return state;

      const newWrapped = new Set(state.wrappedDehydrons);
      newWrapped.delete(stab.targetDehydronId);

      const newStabilizers = state.placedStabilizers.filter(s => s.id !== action.id);

      // If was stabilized, go back to breathing
      let newDsmState = state.dsmState;
      if (state.dsmState === 'STABILIZED' && canTransition('STABILIZED', 'BREATHING')) {
        newDsmState = 'BREATHING';
      }

      return {
        ...state,
        placedStabilizers: newStabilizers,
        wrappedDehydrons: newWrapped,
        dsmState: newDsmState,
        breathingEnabled: newDsmState === 'BREATHING',
        vdemSteps: [],
        vdemCurrentStep: -1,
      };
    }

    case 'ADVANCE_VDEM':
      if (state.vdemCurrentStep >= state.vdemSteps.length - 1) return state;
      return { ...state, vdemCurrentStep: state.vdemCurrentStep + 1 };

    case 'SELECT_RESIDUE':
      return { ...state, selectedResidue: action.residue, selectedBond: null };

    case 'SELECT_BOND':
      return { ...state, selectedBond: action.bond, selectedResidue: null };

    case 'SET_BREATHING_SPEED':
      return { ...state, breathingSpeed: action.speed };

    case 'TOGGLE_VIS':
      return { ...state, [action.key]: !state[action.key] };

    case 'RESET': {
      return {
        ...initialState,
        wrappedDehydrons: new Set(),
      };
    }

    default:
      return state;
  }
}

export default function useGOSPState() {
  const [state, dispatch] = useReducer(gospReducer, initialState);

  const actions = {
    transitionDSM: useCallback((target) =>
      dispatch({ type: 'TRANSITION_DSM', target }), []),
    selectTemplate: useCallback((template) =>
      dispatch({ type: 'SELECT_TEMPLATE', template }), []),
    cancelPlacement: useCallback(() =>
      dispatch({ type: 'CANCEL_PLACEMENT' }), []),
    placeStabilizer: useCallback((data) =>
      dispatch({ type: 'PLACE_STABILIZER', ...data }), []),
    removeStabilizer: useCallback((id) =>
      dispatch({ type: 'REMOVE_STABILIZER', id }), []),
    advanceVDEM: useCallback(() =>
      dispatch({ type: 'ADVANCE_VDEM' }), []),
    selectResidue: useCallback((residue) =>
      dispatch({ type: 'SELECT_RESIDUE', residue }), []),
    selectBond: useCallback((bond) =>
      dispatch({ type: 'SELECT_BOND', bond }), []),
    setBreathingSpeed: useCallback((speed) =>
      dispatch({ type: 'SET_BREATHING_SPEED', speed }), []),
    toggleVis: useCallback((key) =>
      dispatch({ type: 'TOGGLE_VIS', key }), []),
    reset: useCallback(() =>
      dispatch({ type: 'RESET' }), []),
  };

  return { state, actions };
}
