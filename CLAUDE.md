# CLAUDE.md — Constellation-3D

## Project Overview

A 3D interactive protein structure visualization and simulation app built with React and Three.js. The primary scene (GOSPScene) renders a 30-residue helix-turn-helix protein, visualizes hydrogen bond networks and dehydrons (under-wrapped hydrogen bonds), and lets users place stabilizer molecules to wrap dehydrons and lock protein structure. A secondary scene (Scene) renders a 3D knowledge graph of projects as glass sphere nodes.

**GOSP** = Generative Ontology of Structural Properties — a framework for deterministic protein verification using stabilizer placement.

## Tech Stack

- **React 19** — UI framework
- **Three.js 0.182** via **React Three Fiber 9.5** — 3D rendering
- **React Three Drei 10.7** — Helper components (OrbitControls, Text, MeshTransmissionMaterial, etc.)
- **React Three Postprocessing 3.0** — Post-processing effects (Bloom)
- **XState 5.26** — State machine for YBR032W orphan protein verification (SEARCH → ALIGN → LOCK)
- **Create React App (react-scripts 5.0.1)** — Build toolchain (Webpack/Babel)
- **Jest + React Testing Library** — Testing (minimal coverage currently)

## Commands

```bash
npm start          # Dev server at http://localhost:3000
npm run build      # Production build to /build
npm test           # Jest in watch mode
```

No TypeScript. No additional linting or formatting tools beyond CRA defaults. ESLint config extends `react-app` and `react-app/jest` (configured in package.json).

## Directory Structure

```
src/
├── App.js                          # Root — renders GOSPScene
├── index.js                        # React entry point
├── components/
│   ├── GOSPScene.js                # Main scene: Canvas, 3D components, overlay
│   ├── ProteinBackbone.js          # 30-residue backbone with tube geometry + breathing animation
│   ├── ResidueNode.js              # Individual residue sphere (CPK-colored)
│   ├── HydrogenBondNetwork.js      # H-bond cylinders, dehydron highlighting
│   ├── VoidVisualization.js        # Packing void spheres around dehydrons
│   ├── WaterField.js               # Frustrated water particles near dehydrons
│   ├── PlacedStabilizers.js        # Container for placed stabilizer molecules
│   ├── StabilizerMolecule.js       # Individual stabilizer (Trehalose/Glycerol/TMAO)
│   ├── OrphanProteinLoop.js        # YBR032W low-confidence loop visualization
│   ├── GOSPOverlay.js              # HTML overlay: toolbar, panels, controls
│   ├── ui/
│   │   ├── DSMStateGraph.js        # State machine diagram
│   │   ├── VDEMCascadePanel.js     # Void Dynamics cascade steps
│   │   ├── StabilizerToolbar.js    # Stabilizer template selector
│   │   ├── ResidueInfoPanel.js     # Selected residue/bond info
│   │   ├── VisualizationControls.js # Toggle visibility, breathing speed
│   │   └── GOSPLockPanel.js        # YBR032W verification UI
│   ├── Scene.js                    # Secondary constellation scene
│   ├── GlassNode.js                # Glass sphere project node
│   ├── FacetNode.js                # Facet category node
│   ├── ConnectionLines.js          # Lines connecting nodes
│   ├── ParticleField.js            # Background particle effect
│   ├── Sun.js                      # Light source
│   └── UI.js                       # Overlay for constellation scene
├── data/
│   ├── proteinData.js              # Residue definitions, H-bonds, dehydrons, stabilizer templates
│   ├── dsmStates.js                # DSM states/transitions (UNFOLDED→FOLDING→NATIVE→BREATHING→STABILIZED)
│   ├── projectData.js              # Constellation project/facet data
│   ├── generateHelix.js            # Helical coordinate generator
│   └── ybr032wData.js              # YBR032W orphan protein data (120 residues, pLDDT scores)
├── state/
│   ├── useGOSPState.js             # Central useReducer hook — all GOSP simulation state + actions
│   └── gospLockMachine.js          # XState machine for SEARCH→ALIGN→LOCK verification
├── App.test.js                     # Placeholder test (needs updating)
├── setupTests.js                   # Jest DOM matchers setup
└── index.css                       # Global styles (dark theme, monospace, full viewport)
```

## Architecture

### State Management

Two state systems coexist:

1. **`useGOSPState` hook** (`src/state/useGOSPState.js`) — useReducer-based. Manages all interactive simulation state: DSM state, placed stabilizers, wrapped dehydrons, animation settings, tool selection, visualization toggles, and VDEM cascade progress. This is the primary state store, passed as `state` + `actions` props from GOSPScene downward.

2. **`gospLockMachine`** (`src/state/gospLockMachine.js`) — XState state machine for YBR032W orphan protein verification. Three states: SEARCH → ALIGN → LOCK. Used via `@xstate/react` in GOSPLockPanel.

### Data Flow

```
App → GOSPScene
        ├── useGOSPState() → { state, actions }
        ├── 3D Canvas
        │   ├── ProteinBackbone ← state (breathing, toggles)
        │   ├── HydrogenBondNetwork ← state (dehydrons, wrapping, selection)
        │   ├── VoidVisualization ← state (toggle, dehydron positions)
        │   ├── WaterField ← state (toggle, stabilizer positions)
        │   ├── PlacedStabilizers ← state.placedStabilizers
        │   └── ClickHandler ← state + actions (stabilizer placement)
        └── GOSPOverlay ← state + actions
            ├── DSMStateGraph ← state.dsmState
            ├── StabilizerToolbar ← state + actions
            ├── VDEMCascadePanel ← state.vdemSteps
            ├── ResidueInfoPanel ← state.selectedResidue/Bond
            ├── VisualizationControls ← state toggles + actions
            └── GOSPLockPanel ← gospLockMachine (independent XState)
```

Props are passed directly — no React Context or global store.

### DSM (Deterministic State Machine)

The protein simulation follows enforced state transitions:

```
UNFOLDED → FOLDING → NATIVE → BREATHING → STABILIZED
                                    ↕            ↕
                                  NATIVE    BREATHING
```

Transitions are validated via `canTransition()` in `src/data/dsmStates.js`. The system auto-transitions to STABILIZED when all dehydrons are wrapped.

### 3D Component Patterns

- **`useFrame`** for per-frame animation loops (breathing, water movement, particle drift)
- **`useRef`** for direct Three.js object access (geometry vertices, material properties)
- **`useMemo`** for expensive geometry/position calculations
- **`useCallback`** for event handlers passed as props
- **Breathing animation**: Time-based sine/cosine waves per residue, damped by proximity to placed stabilizers (inverse distance attenuation)
- **Click interaction**: Invisible sphere mesh catches onClick events; snap-to-nearest-dehydron logic (2A threshold)
- **Materials**: MeshTransmissionMaterial (glass), meshStandardMaterial (emissive glow), meshBasicMaterial (overlays)

### Protein Data Model

Defined in `src/data/proteinData.js`:

- **30 residues** in helix-turn-helix arrangement with CPK color coding
- **16 hydrogen bonds** (i→i+4 alpha-helix pattern)
- **Dehydrons**: H-bonds with `wrappingCount < 19` (under-wrapped, vulnerable to hydration)
- **3 stabilizer templates**: Trehalose (disaccharide, +8 wrapping), Glycerol (polyol, +5), TMAO (osmolyte, +6)
- Each stabilizer placement adds its wrapping bonus; when total >= 19, dehydron is "wrapped"

## Code Conventions

- **JavaScript only** — no TypeScript
- **Functional components** exclusively — no class components
- **Inline styles** — no CSS-in-JS library, no CSS modules; styles are objects in JSX `style` props
- **Named exports** for data/utilities, **default exports** for components
- **File naming**: PascalCase for components (`GOSPScene.js`), camelCase for hooks/data (`useGOSPState.js`, `proteinData.js`)
- **No routing** — single-page app with manual mode toggling via UI buttons
- **Dark theme**: backgrounds `#020208` / `#000510`, bright neon accents, monospace fonts
- **Comments**: Sparse, used for section headers and non-obvious logic
- **Constants**: UPPER_SNAKE_CASE for exported data objects (`RESIDUES`, `DEHYDRONS`, `STABILIZERS`, `DSM_STATES`)

## Key Domain Concepts

| Term | Meaning |
|------|---------|
| **Dehydron** | Under-wrapped hydrogen bond (wrapping count < 19), vulnerable to water attack |
| **Wrapping** | Nonpolar groups shielding an H-bond from solvent; count determines bond stability |
| **Stabilizer** | Molecule (Trehalose/Glycerol/TMAO) placed near dehydrons to increase wrapping |
| **DSM** | Deterministic State Machine — enforced protein folding state transitions |
| **VDEM** | Void Dynamics Energetic Mechanics — cascade of events when stabilizer is placed |
| **GOSP** | Generative Ontology of Structural Properties — verification framework |
| **YBR032W** | Saccharomyces cerevisiae orphan protein used for verification testing |
| **Ma-Stabilizer** | Molecular Anchor stabilizer for orphan protein locking |
| **pLDDT** | Predicted Local Distance Difference Test — per-residue confidence score |
| **Breathing** | Conformational fluctuations of the protein backbone over time |

## Testing

Current test coverage is minimal — one placeholder test in `App.test.js` that does not match the current UI. When adding tests:

- Place test files alongside source files or in `src/` as `*.test.js`
- Use `@testing-library/react` for component tests
- Run with `npm test` (Jest watch mode)
- Three.js Canvas components require mocking `@react-three/fiber` and `three`

## Common Tasks

### Adding a new stabilizer template
Add entry to `STABILIZERS` object in `src/data/proteinData.js` with: id, label, color, effectRadius, atomCount, wrappingBonus.

### Adding a new DSM state
1. Add state definition to `DSM_STATES` in `src/data/dsmStates.js`
2. Add transitions to `DSM_TRANSITIONS`
3. Handle in `gospReducer` TRANSITION_DSM case in `src/state/useGOSPState.js`
4. Update `DSMStateGraph.js` visualization

### Adding a new 3D visualization component
1. Create component in `src/components/` using React Three Fiber patterns
2. Accept `state` and/or `actions` as props
3. Add visibility toggle to `useGOSPState` initialState if needed
4. Render inside the Canvas in `GOSPScene.js`
5. Add toggle control in `VisualizationControls.js`

### Adding a new UI panel
1. Create component in `src/components/ui/`
2. Use inline styles matching the dark theme (`background: rgba(0,0,0,0.8)`, monospace font)
3. Render inside `GOSPOverlay.js`, pass state/actions as needed
