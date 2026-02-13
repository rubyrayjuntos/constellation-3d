import * as THREE from 'three';

// Alpha-helix parameters (angstroms)
const HELIX_RISE = 1.5;       // rise per residue along axis
const HELIX_TURN = 100;       // degrees per residue
const HELIX_RADIUS = 2.3;     // backbone radius

// Generate a helix-turn-helix motif (~30 residues)
// Helix 1: residues 0-11, Turn: 12-17, Helix 2: 18-29
export function generateHelixPositions(residueCount = 30) {
  const positions = [];
  const sideChainDirs = [];
  const backboneCurvePoints = [];
  const secondaryStructure = [];

  for (let i = 0; i < residueCount; i++) {
    let pos, sideDir, ss;

    if (i < 12) {
      // Helix 1
      const angle = THREE.MathUtils.degToRad(HELIX_TURN * i);
      const y = i * HELIX_RISE;
      pos = new THREE.Vector3(
        HELIX_RADIUS * Math.cos(angle),
        y,
        HELIX_RADIUS * Math.sin(angle)
      );
      sideDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).normalize();
      ss = 'helix';
    } else if (i < 18) {
      // Turn region - smooth arc connecting helix 1 to helix 2
      const turnIndex = i - 12;
      const turnFraction = turnIndex / 5; // 0 to 1 over 6 residues
      const helix1End = new THREE.Vector3(
        HELIX_RADIUS * Math.cos(THREE.MathUtils.degToRad(HELIX_TURN * 11)),
        11 * HELIX_RISE,
        HELIX_RADIUS * Math.sin(THREE.MathUtils.degToRad(HELIX_TURN * 11))
      );
      const helix2Start = new THREE.Vector3(
        -HELIX_RADIUS * Math.cos(THREE.MathUtils.degToRad(HELIX_TURN * 18)) + 6,
        18 * HELIX_RISE,
        -HELIX_RADIUS * Math.sin(THREE.MathUtils.degToRad(HELIX_TURN * 18))
      );
      // Bezier midpoint lifted up
      const mid = new THREE.Vector3().lerpVectors(helix1End, helix2Start, 0.5);
      mid.y += 3;
      mid.x += 2;

      // Quadratic bezier
      const t = turnFraction;
      pos = new THREE.Vector3(
        (1-t)*(1-t)*helix1End.x + 2*(1-t)*t*mid.x + t*t*helix2Start.x,
        (1-t)*(1-t)*helix1End.y + 2*(1-t)*t*mid.y + t*t*helix2Start.y,
        (1-t)*(1-t)*helix1End.z + 2*(1-t)*t*mid.z + t*t*helix2Start.z
      );
      sideDir = new THREE.Vector3(0, 1, 0)
        .applyAxisAngle(new THREE.Vector3(0, 0, 1), turnFraction * Math.PI * 0.5)
        .normalize();
      ss = 'turn';
    } else {
      // Helix 2 - offset and reversed direction
      const localIndex = i - 18;
      const angle = THREE.MathUtils.degToRad(HELIX_TURN * localIndex + 180);
      const y = 18 * HELIX_RISE + localIndex * HELIX_RISE;
      pos = new THREE.Vector3(
        -HELIX_RADIUS * Math.cos(angle) + 6,
        y,
        -HELIX_RADIUS * Math.sin(angle)
      );
      sideDir = new THREE.Vector3(-Math.cos(angle), 0, -Math.sin(angle)).normalize();
      ss = 'helix';
    }

    positions.push(pos);
    sideChainDirs.push(sideDir);
    backboneCurvePoints.push(pos.clone());
    secondaryStructure.push(ss);
  }

  // Center the structure
  const center = new THREE.Vector3();
  positions.forEach(p => center.add(p));
  center.divideScalar(positions.length);
  positions.forEach(p => p.sub(center));
  backboneCurvePoints.forEach(p => p.sub(center));

  // Scale down to fit nicely in scene (helix spans ~45 angstroms, we want ~10 units)
  const scale = 0.2;
  positions.forEach(p => p.multiplyScalar(scale));
  backboneCurvePoints.forEach(p => p.multiplyScalar(scale));

  return { positions, sideChainDirs, backboneCurvePoints, secondaryStructure };
}
