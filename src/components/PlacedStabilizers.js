import StabilizerMolecule from './StabilizerMolecule';

export default function PlacedStabilizers({ stabilizers = [], onRemove }) {
  return (
    <group>
      {stabilizers.map(stab => (
        <StabilizerMolecule
          key={stab.id}
          stabilizer={stab}
          onRemove={onRemove}
        />
      ))}
    </group>
  );
}
