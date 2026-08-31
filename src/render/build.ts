import * as THREE from 'three';
import type { Cube, FaceName, Model, OutlinerNode, Vec3 } from '../bbmodel/types';
import { faceUV } from './uv';

// BoxGeometry face order is +x, -x, +y, -y, +z, -z.
const FACE_ORDER: FaceName[] = ['east', 'west', 'up', 'down', 'south', 'north'];

const DEG = Math.PI / 180;
const FALLBACK_COLOR = 0x8a8a8a;

export interface BuiltModel {
  group: THREE.Group;
  dispose: () => void;
}

export async function buildModel(model: Model): Promise<BuiltModel> {
  const disposables: { dispose(): void }[] = [];

  const materials = await Promise.all(
    model.textures.map(async (texture) => {
      if (!texture.source.startsWith('data:')) return fallbackMaterial();
      const image = await loadImage(texture.source);
      const map = new THREE.Texture(image);
      map.magFilter = THREE.NearestFilter;
      map.minFilter = THREE.NearestFilter;
      map.colorSpace = THREE.SRGBColorSpace;
      map.needsUpdate = true;
      const material = new THREE.MeshLambertMaterial({
        map,
        transparent: true,
        alphaTest: 0.05,
        side: THREE.DoubleSide,
      });
      disposables.push(map, material);
      return material;
    }),
  );
  const fallback = fallbackMaterial();
  disposables.push(fallback);

  const group = new THREE.Group();
  for (const node of model.root) {
    group.add(buildNode(node, [0, 0, 0], model, materials, fallback, disposables));
  }

  return {
    group,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

function buildNode(
  node: OutlinerNode,
  parentOrigin: Vec3,
  model: Model,
  materials: THREE.Material[],
  fallback: THREE.Material,
  disposables: { dispose(): void }[],
): THREE.Object3D {
  if ('cube' in node) {
    return buildCube(node.cube, parentOrigin, model, materials, fallback, disposables);
  }
  const group = new THREE.Group();
  group.name = node.name;
  group.position.set(...sub(node.origin, parentOrigin));
  group.rotation.set(node.rotation[0] * DEG, node.rotation[1] * DEG, node.rotation[2] * DEG, 'ZYX');
  for (const child of node.children) {
    group.add(buildNode(child, node.origin, model, materials, fallback, disposables));
  }
  return group;
}

function buildCube(
  cube: Cube,
  parentOrigin: Vec3,
  model: Model,
  materials: THREE.Material[],
  fallback: THREE.Material,
  disposables: { dispose(): void }[],
): THREE.Object3D {
  const size: Vec3 = [
    cube.to[0] - cube.from[0] + cube.inflate * 2,
    cube.to[1] - cube.from[1] + cube.inflate * 2,
    cube.to[2] - cube.from[2] + cube.inflate * 2,
  ];
  const geometry = new THREE.BoxGeometry(...size.map((s) => Math.max(s, 0.001)) as Vec3);
  disposables.push(geometry);

  const uv = geometry.getAttribute('uv') as THREE.BufferAttribute;
  const faceMaterials: THREE.Material[] = [];
  const invisible = new THREE.MeshBasicMaterial({ visible: false });
  disposables.push(invisible);

  FACE_ORDER.forEach((name, faceIndex) => {
    const face = cube.faces[name];
    if (!face) {
      faceMaterials.push(invisible);
      return;
    }
    const material =
      face.texture !== null && materials[face.texture] ? materials[face.texture] : fallback;
    faceMaterials.push(material);

    const texture = face.texture !== null ? model.textures[face.texture] : undefined;
    const corners = faceUV(
      face.uv,
      face.rotation,
      texture?.width ?? model.textureWidth,
      texture?.height ?? model.textureHeight,
    );
    corners.forEach(([u, v], corner) => {
      uv.setXY(faceIndex * 4 + corner, u, v);
    });
  });
  uv.needsUpdate = true;

  const mesh = new THREE.Mesh(geometry, faceMaterials);
  mesh.name = cube.name;

  const center: Vec3 = [
    (cube.from[0] + cube.to[0]) / 2,
    (cube.from[1] + cube.to[1]) / 2,
    (cube.from[2] + cube.to[2]) / 2,
  ];

  // The cube rotates around its own origin, so pivot there.
  const pivot = new THREE.Group();
  pivot.position.set(...sub(cube.origin, parentOrigin));
  pivot.rotation.set(cube.rotation[0] * DEG, cube.rotation[1] * DEG, cube.rotation[2] * DEG, 'ZYX');
  mesh.position.set(...sub(center, cube.origin));
  pivot.add(mesh);
  return pivot;
}

function fallbackMaterial(): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({ color: FALLBACK_COLOR, side: THREE.DoubleSide });
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('texture failed to decode'));
    image.src = src;
  });
}
