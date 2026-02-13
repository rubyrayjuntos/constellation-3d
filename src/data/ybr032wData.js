// YBR032W orphan protein data
// Low pLDDT segment: residues 45-67 (disordered loop region)
export const YBR032W_DATA = {
  proteinId: 'YBR032W',
  organism: 'Saccharomyces cerevisiae',
  description: 'Orphan protein with low AlphaFold confidence',
  totalResidues: 120,
  lowConfidenceSegment: {
    start: 45,
    end: 67,
    avgPLDDT: 42.3,
    reason: 'No homologous sequences available'
  },
  // Simplified coordinates for the disordered segment
  disorderedLoop: [
    [5.2, 3.1, 0.8],
    [5.8, 3.5, 1.2],
    [6.1, 4.2, 1.8],
    [6.0, 5.0, 2.3],
    [5.5, 5.6, 2.9],
    [4.8, 6.0, 3.2],
    [4.0, 6.2, 3.0],
    [3.3, 5.9, 2.5],
    [2.8, 5.3, 1.9],
    [2.6, 4.5, 1.3],
    [2.8, 3.7, 0.8],
    [3.4, 3.2, 0.5],
    [4.1, 3.0, 0.6],
    [4.8, 3.1, 0.9],
    [5.3, 3.4, 1.3],
    [5.6, 3.9, 1.8],
    [5.7, 4.6, 2.4],
    [5.5, 5.3, 2.9],
    [5.0, 5.8, 3.2],
    [4.3, 6.0, 3.1],
    [3.6, 5.8, 2.7],
    [3.1, 5.2, 2.1],
    [3.0, 4.4, 1.5]
  ],
  // Potential Ma-stabilizer placement (void center)
  maStabilizerTarget: {
    position: [4.5, 4.5, 2.0],
    radius: 1.8,
    potentialHBonds: [
      { donor: 47, acceptor: 63 },
      { donor: 51, acceptor: 59 },
      { donor: 54, acceptor: 56 }
    ]
  }
};
