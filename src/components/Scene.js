import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import GlassNode from './GlassNode';
import FacetNode from './FacetNode';
import Sun from './Sun';
import ConnectionLines from './ConnectionLines';
import ParticleField from './ParticleField';
import UI from './UI';
import { PROJECTS, FACETS } from '../data/projectData';

export default function Scene() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <>
      <Canvas>
        <color attach="background" args={['#000510']} />
        <fog attach="fog" args={['#000510', 5, 25]} />

        <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={60} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={3}
          maxDistance={25}
          autoRotate
          autoRotateSpeed={0.3}
        />

        <Sun />
        <ParticleField />

        {PROJECTS.map(project => (
          <GlassNode
            key={project.id}
            project={project}
            isSelected={selectedProject?.id === project.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProject(project);
            }}
          />
        ))}

        {FACETS.map((facet) => (
          <FacetNode key={facet.id} facet={facet} />
        ))}

        <ConnectionLines projects={PROJECTS} facets={FACETS} />

        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />

        <Environment preset="night" />

        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      </Canvas>

      <UI 
        selectedProject={selectedProject}
        projectCount={PROJECTS.length}
        facetCount={FACETS.length}
      />
    </>
  );
}
