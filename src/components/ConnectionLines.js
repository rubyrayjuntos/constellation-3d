import { useMemo } from 'react';
import * as THREE from 'three';

export default function ConnectionLines({ projects, facets }) {
  const lines = useMemo(() => {
    const connections = [];

    projects.forEach(project => {
      const projectPos = new THREE.Vector3(...project.position);

      project.facets.forEach(facetId => {
        const facet = facets.find(f => f.id === facetId);
        if (!facet) return;

        const facetPos = new THREE.Vector3(...facet.position);
        const distance = projectPos.distanceTo(facetPos);

        connections.push({
          start: projectPos,
          end: facetPos,
          opacity: Math.max(0.1, 1 - (distance / 5))
        });
      });
    });

    return connections;
  }, [projects, facets]);

  return (
    <>
      {lines.map((line, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([
                line.start.x, line.start.y, line.start.z,
                line.end.x, line.end.y, line.end.z
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#4488ff"
            transparent
            opacity={line.opacity * 0.3}
            blending={THREE.AdditiveBlending}
          />
        </line>
      ))}
    </>
  );
}
