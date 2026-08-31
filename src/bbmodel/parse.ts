import type {
  Cube,
  Face,
  FaceName,
  GroupNode,
  Model,
  OutlinerNode,
  Texture,
  UVRect,
  Vec3,
} from './types';

const FACE_NAMES: FaceName[] = ['north', 'south', 'east', 'west', 'up', 'down'];

export class ParseError extends Error {}

/** Parses the JSON text of a .bbmodel file into the subset bbspin renders. */
export function parseModel(text: string): Model {
  let raw: any;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new ParseError('not valid JSON; is this a .bbmodel file?');
  }
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.elements)) {
    throw new ParseError('missing elements; is this a .bbmodel file?');
  }

  const resolution = raw.resolution ?? {};
  const textureWidth = num(resolution.width, 16);
  const textureHeight = num(resolution.height, 16);

  const textures: Texture[] = (raw.textures ?? []).map((t: any, i: number) => ({
    name: str(t?.name, `texture ${i}`),
    source: str(t?.source, ''),
    width: num(t?.uv_width ?? t?.width, textureWidth),
    height: num(t?.uv_height ?? t?.height, textureHeight),
  }));

  const cubesById = new Map<string, Cube>();
  for (const el of raw.elements) {
    if (el?.type && el.type !== 'cube') continue; // meshes are out of scope for now
    const cube = parseCube(el);
    if (cube && typeof el.uuid === 'string') {
      cubesById.set(el.uuid, cube);
    }
  }

  const root = parseOutliner(raw.outliner ?? [], cubesById);

  // Cubes never referenced by the outliner still belong to the model.
  const used = new Set<Cube>();
  collectCubes(root, used);
  for (const cube of cubesById.values()) {
    if (!used.has(cube)) root.push({ cube });
  }

  return {
    name: str(raw.name ?? raw.model_identifier, 'model'),
    textureWidth,
    textureHeight,
    textures,
    root,
  };
}

function parseCube(el: any): Cube | null {
  if (!Array.isArray(el?.from) || !Array.isArray(el?.to)) return null;
  const faces: Partial<Record<FaceName, Face>> = {};
  for (const name of FACE_NAMES) {
    const f = el.faces?.[name];
    if (!f || f.texture === null || f.texture === undefined) continue;
    if (!Array.isArray(f.uv) || f.uv.length !== 4) continue;
    faces[name] = {
      uv: f.uv.map(Number) as UVRect,
      texture: typeof f.texture === 'number' ? f.texture : 0,
      rotation: ([0, 90, 180, 270].includes(f.rotation) ? f.rotation : 0) as Face['rotation'],
    };
  }
  return {
    name: str(el.name, 'cube'),
    from: vec3(el.from),
    to: vec3(el.to),
    origin: vec3(el.origin ?? [0, 0, 0]),
    rotation: vec3(el.rotation ?? [0, 0, 0]),
    inflate: num(el.inflate, 0),
    faces,
  };
}

function parseOutliner(nodes: any[], cubes: Map<string, Cube>): OutlinerNode[] {
  const out: OutlinerNode[] = [];
  for (const node of nodes) {
    if (typeof node === 'string') {
      const cube = cubes.get(node);
      if (cube) out.push({ cube });
      continue;
    }
    if (node && typeof node === 'object') {
      const group: GroupNode = {
        name: str(node.name, 'group'),
        origin: vec3(node.origin ?? [0, 0, 0]),
        rotation: vec3(node.rotation ?? [0, 0, 0]),
        children: parseOutliner(node.children ?? [], cubes),
      };
      out.push(group);
    }
  }
  return out;
}

function collectCubes(nodes: OutlinerNode[], into: Set<Cube>): void {
  for (const node of nodes) {
    if ('cube' in node) into.add(node.cube);
    else collectCubes(node.children, into);
  }
}

function vec3(v: any): Vec3 {
  return [num(v?.[0], 0), num(v?.[1], 0), num(v?.[2], 0)];
}

function num(v: any, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function str(v: any, fallback: string): string {
  return typeof v === 'string' && v !== '' ? v : fallback;
}
