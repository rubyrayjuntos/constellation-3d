import { createMachine, assign } from 'xstate';

// GOSP LOCK State Machine for YBR032W orphan protein verification
// Implements SEARCH → ALIGN → LOCK deterministic state transitions
export const gospLockMachine = createMachine({
  id: 'gospVerification',
  initial: 'SEARCH',
  context: {
    coordinates: null,
    maStabilizerId: 'ma_01_ybr032w',
    fidelityScore: 0,
    isPhysicallyLocked: false,
    energyPotential: 0,
    ramachandranValid: false
  },
  states: {
    SEARCH: {
      on: {
        IDENTIFY_VOID: {
          target: 'ALIGN',
          actions: assign(({ event }) => ({
            coordinates: event.coordinates
          }))
        }
      }
    },
    ALIGN: {
      entry: assign(() => ({
        energyPotential: Math.random() * -20
      })),
      on: {
        VERIFY_MA: [
          {
            target: 'LOCK',
            guard: 'isValidRamachandranState',
            actions: 'applyDeterministicConstraint'
          },
          { 
            target: 'SEARCH',
            actions: 'rejectBiologicalGhost'
          }
        ]
      }
    },
    LOCK: {
      type: 'final',
      entry: assign({
        isPhysicallyLocked: true,
        fidelityScore: 1.0
      })
    }
  }
}, {
  guards: {
    isValidRamachandranState: ({ event }) => {
      return event.energyPotential < -15.5 && event.ramachandranValid;
    }
  },
  actions: {
    applyDeterministicConstraint: ({ context }) => {
      console.log(`✓ Locking Ma-Stabilizer ${context.maStabilizerId} into deterministic state.`);
    },
    rejectBiologicalGhost: () => {
      console.log('✗ Rejected: Biological Ghost detected. Returning to SEARCH.');
    }
  }
});
