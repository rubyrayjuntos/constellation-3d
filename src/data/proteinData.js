import { generateHelixPositions } from './generateHelix';

// CPK-style colors for amino acid types
export const RESIDUE_TYPES = {
  ALA: { name: 'Alanine', code: 'A', color: '#8CFF8C', type: 'hydrophobic', sideChainLength: 0.15 },
  VAL: { name: 'Valine', code: 'V', color: '#8CFF8C', type: 'hydrophobic', sideChainLength: 0.25 },
  LEU: { name: 'Leucine', code: 'L', color: '#8CFF8C', type: 'hydrophobic', sideChainLength: 0.35 },
  ILE: { name: 'Isoleucine', code: 'I', color: '#8CFF8C', type: 'hydrophobic', sideChainLength: 0.3 },
  PHE: { name: 'Phenylalanine', code: 'F', color: '#FF8CFF', type: 'aromatic', sideChainLength: 0.4 },
  TRP: { name: 'Tryptophan', code: 'W', color: '#FF8CFF', type: 'aromatic', sideChainLength: 0.45 },
  GLU: { name: 'Glutamate', code: 'E', color: '#FF4444', type: 'charged-', sideChainLength: 0.35 },
  ASP: { name: 'Aspartate', code: 'D', color: '#FF4444', type: 'charged-', sideChainLength: 0.25 },
  LYS: { name: 'Lysine', code: 'K', color: '#4444FF', type: 'charged+', sideChainLength: 0.4 },
  ARG: { name: 'Arginine', code: 'R', color: '#4444FF', type: 'charged+', sideChainLength: 0.45 },
  SER: { name: 'Serine', code: 'S', color: '#FFFF44', type: 'polar', sideChainLength: 0.2 },
  THR: { name: 'Threonine', code: 'T', color: '#FFFF44', type: 'polar', sideChainLength: 0.25 },
  GLY: { name: 'Glycine', code: 'G', color: '#CCCCCC', type: 'special', sideChainLength: 0.05 },
};

// Helix-turn-helix sequence (30 residues)
const SEQUENCE = [
  'ALA','LEU','GLU','LYS','ALA','VAL','PHE','SER','LEU','ILE','ARG','ALA', // Helix 1
  'GLY','SER','ASP','THR','GLY','SER',                                      // Turn
  'ALA','LEU','LYS','VAL','TRP','GLU','ALA','ILE','PHE','LEU','ARG','ALA', // Helix 2
];

// Generate helix geometry
const helix = generateHelixPositions(30);

// Build residue data
export const RESIDUES = SEQUENCE.map((type, i) => {
  const props = RESIDUE_TYPES[type];
  return {
    id: `r${i}`,
    index: i,
    type,
    name: props.name,
    code: props.code,
    color: props.color,
    residueType: props.type,
    position: [helix.positions[i].x, helix.positions[i].y, helix.positions[i].z],
    sideChainDir: [helix.sideChainDirs[i].x, helix.sideChainDirs[i].y, helix.sideChainDirs[i].z],
    sideChainLength: props.sideChainLength,
    secondaryStructure: helix.secondaryStructure[i],
    breathingAmplitude: helix.secondaryStructure[i] === 'turn' ? 0.06 : 0.03,
    breathingPhase: i * 0.3,
  };
});

export const BACKBONE_POINTS = helix.backboneCurvePoints.map(p => [p.x, p.y, p.z]);

// Hydrogen bonds: i→i+4 for helix regions (standard alpha-helix H-bonds)
// wrappingCount: number of carbon atoms within 6.5A of H-bond midpoint
// Dehydrons have wrappingCount < 19
export const HYDROGEN_BONDS = [];

// Helix 1 H-bonds (residues 0-11, i→i+4)
for (let i = 0; i <= 7; i++) {
  const donor = i;
  const acceptor = i + 4;
  const midX = (RESIDUES[donor].position[0] + RESIDUES[acceptor].position[0]) / 2;
  const midY = (RESIDUES[donor].position[1] + RESIDUES[acceptor].position[1]) / 2;
  const midZ = (RESIDUES[donor].position[2] + RESIDUES[acceptor].position[2]) / 2;

  // Simulate wrapping: exposed positions get low wrapping
  let wrappingCount;
  if (i === 1 || i === 4 || i === 6) {
    wrappingCount = Math.floor(Math.random() * 5) + 12; // 12-16: dehydron
  } else {
    wrappingCount = Math.floor(Math.random() * 5) + 20; // 20-24: well-wrapped
  }

  HYDROGEN_BONDS.push({
    id: `hb${HYDROGEN_BONDS.length}`,
    donor,
    acceptor,
    donorId: RESIDUES[donor].id,
    acceptorId: RESIDUES[acceptor].id,
    midpoint: [midX, midY, midZ],
    wrappingCount,
    isDehydron: wrappingCount < 19,
    strength: wrappingCount >= 19 ? 1.0 : 0.5 + (wrappingCount / 38),
  });
}

// Helix 2 H-bonds (residues 18-29, i→i+4)
for (let i = 18; i <= 25; i++) {
  const donor = i;
  const acceptor = i + 4;
  const midX = (RESIDUES[donor].position[0] + RESIDUES[acceptor].position[0]) / 2;
  const midY = (RESIDUES[donor].position[1] + RESIDUES[acceptor].position[1]) / 2;
  const midZ = (RESIDUES[donor].position[2] + RESIDUES[acceptor].position[2]) / 2;

  let wrappingCount;
  if (i === 19 || i === 23) {
    wrappingCount = Math.floor(Math.random() * 5) + 12; // dehydron
  } else {
    wrappingCount = Math.floor(Math.random() * 5) + 20; // well-wrapped
  }

  HYDROGEN_BONDS.push({
    id: `hb${HYDROGEN_BONDS.length}`,
    donor,
    acceptor,
    donorId: RESIDUES[donor].id,
    acceptorId: RESIDUES[acceptor].id,
    midpoint: [midX, midY, midZ],
    wrappingCount,
    isDehydron: wrappingCount < 19,
    strength: wrappingCount >= 19 ? 1.0 : 0.5 + (wrappingCount / 38),
  });
}

// Dehydron IDs for easy lookup
export const DEHYDRONS = HYDROGEN_BONDS.filter(hb => hb.isDehydron);

// Void cavities near dehydrons
export const VOIDS = [
  {
    id: 'v0',
    center: [
      (RESIDUES[1].position[0] + RESIDUES[5].position[0]) / 2 + 0.3,
      (RESIDUES[1].position[1] + RESIDUES[5].position[1]) / 2,
      (RESIDUES[1].position[2] + RESIDUES[5].position[2]) / 2 + 0.3,
    ],
    radius: 0.5,
    nearbyDehydrons: DEHYDRONS.filter(d => d.donor <= 7).slice(0, 2).map(d => d.id),
    frustratedWaterCount: 12,
  },
  {
    id: 'v1',
    center: [
      (RESIDUES[4].position[0] + RESIDUES[8].position[0]) / 2 - 0.2,
      (RESIDUES[4].position[1] + RESIDUES[8].position[1]) / 2 + 0.3,
      (RESIDUES[4].position[2] + RESIDUES[8].position[2]) / 2,
    ],
    radius: 0.4,
    nearbyDehydrons: DEHYDRONS.filter(d => d.donor >= 3 && d.donor <= 8).slice(0, 2).map(d => d.id),
    frustratedWaterCount: 8,
  },
  {
    id: 'v2',
    center: [
      (RESIDUES[19].position[0] + RESIDUES[23].position[0]) / 2 + 0.2,
      (RESIDUES[19].position[1] + RESIDUES[23].position[1]) / 2,
      (RESIDUES[19].position[2] + RESIDUES[23].position[2]) / 2 - 0.3,
    ],
    radius: 0.45,
    nearbyDehydrons: DEHYDRONS.filter(d => d.donor >= 18).slice(0, 2).map(d => d.id),
    frustratedWaterCount: 10,
  },
];

// Stabilizer templates
export const STABILIZERS = {
  trehalose: {
    id: 'trehalose',
    name: 'Trehalose',
    color: '#44ffaa',
    effectRadius: 1.5,
    wrappingBonus: 8,
    atomCount: 6,
    description: 'Disaccharide — wraps exposed backbone, expels frustrated water',
  },
  glycerol: {
    id: 'glycerol',
    name: 'Glycerol',
    color: '#ffaa44',
    effectRadius: 1.0,
    wrappingBonus: 5,
    atomCount: 4,
    description: 'Polyol — fills small voids, enhances local H-bond network',
  },
  tmao: {
    id: 'tmao',
    name: 'TMAO',
    color: '#aa44ff',
    effectRadius: 1.2,
    wrappingBonus: 6,
    atomCount: 5,
    description: 'Osmolyte — strengthens water structure around protein',
  },
};
