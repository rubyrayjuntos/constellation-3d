export const MEDIUM_COLORS = {
  film: '#ff6644',
  code: '#44ff88',
  design: '#ff44cc',
  music: '#ffcc44',
  writing: '#44aaff',
};

export const PROJECTS = [
  {
    id: 'p1',
    title: 'Luminance',
    description: 'An experimental short film exploring light and shadow.',
    medium: 'film',
    position: [3, 1, -1],
    facets: ['narrative', 'visual'],
  },
  {
    id: 'p2',
    title: 'Synth Garden',
    description: 'Generative audio-visual installation driven by live data.',
    medium: 'code',
    position: [-2, 2, 1],
    facets: ['interactive', 'audio', 'visual'],
  },
  {
    id: 'p3',
    title: 'Typeface Atlas',
    description: 'A curated collection of variable fonts mapped to emotions.',
    medium: 'design',
    position: [1, -2, 3],
    facets: ['visual', 'narrative'],
  },
  {
    id: 'p4',
    title: 'Resonance',
    description: 'Ambient album composed from field recordings.',
    medium: 'music',
    position: [-3, -1, -2],
    facets: ['audio', 'narrative'],
  },
  {
    id: 'p5',
    title: 'Marginalia',
    description: 'Interactive fiction set in an infinite library.',
    medium: 'writing',
    position: [2, 0, -3],
    facets: ['narrative', 'interactive'],
  },
  {
    id: 'p6',
    title: 'Particle Dreams',
    description: 'Real-time particle simulation controlled by gesture.',
    medium: 'code',
    position: [-1, 3, 0],
    facets: ['interactive', 'visual'],
  },
  {
    id: 'p7',
    title: 'Solstice',
    description: 'Documentary about seasonal rituals around the world.',
    medium: 'film',
    position: [0, -3, 2],
    facets: ['narrative', 'visual', 'audio'],
  },
];

export const FACETS = [
  { id: 'narrative', name: 'Narrative', position: [1, 1, 1], connections: 5 },
  { id: 'visual', name: 'Visual', position: [-1, 1, -1], connections: 5 },
  { id: 'interactive', name: 'Interactive', position: [1, -1, -1], connections: 3 },
  { id: 'audio', name: 'Audio', position: [-1, -1, 1], connections: 3 },
];
