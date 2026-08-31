import type { UVRect } from '../bbmodel/types';

export type UVCorners = [
  [number, number],
  [number, number],
  [number, number],
  [number, number],
];

/**
 * Converts a Blockbench face UV rect (pixels, y-down) into the four texture
 * coordinates of a three.js BoxGeometry face, whose vertex order maps to
 * top-left, top-right, bottom-left, bottom-right.
 */
export function faceUV(
  rect: UVRect,
  rotation: 0 | 90 | 180 | 270,
  texWidth: number,
  texHeight: number,
): UVCorners {
  const u0 = rect[0] / texWidth;
  const v1 = 1 - rect[1] / texHeight;
  const u1 = rect[2] / texWidth;
  const v0 = 1 - rect[3] / texHeight;

  let corners: UVCorners = [
    [u0, v1], // top-left
    [u1, v1], // top-right
    [u0, v0], // bottom-left
    [u1, v0], // bottom-right
  ];
  for (let step = 0; step < rotation / 90; step++) {
    corners = [corners[2], corners[0], corners[3], corners[1]];
  }
  return corners;
}
