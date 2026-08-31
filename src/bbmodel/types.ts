// The subset of the Blockbench .bbmodel format that bbspin renders.

export type Vec3 = [number, number, number];
export type UVRect = [number, number, number, number];

export type FaceName = 'north' | 'south' | 'east' | 'west' | 'up' | 'down';

export interface Face {
  uv: UVRect;
  texture: number | null;
  rotation: 0 | 90 | 180 | 270;
}

export interface Cube {
  name: string;
  from: Vec3;
  to: Vec3;
  origin: Vec3;
  rotation: Vec3;
  inflate: number;
  faces: Partial<Record<FaceName, Face>>;
}

export interface GroupNode {
  name: string;
  origin: Vec3;
  rotation: Vec3;
  children: OutlinerNode[];
}

export type OutlinerNode = GroupNode | { cube: Cube };

export interface Texture {
  name: string;
  /** data URI straight from the file; .bbmodel embeds textures as base64 */
  source: string;
  width: number;
  height: number;
}

export interface Model {
  name: string;
  textureWidth: number;
  textureHeight: number;
  textures: Texture[];
  root: OutlinerNode[];
}
