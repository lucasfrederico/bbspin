import { describe, expect, it } from 'vitest';
import { faceUV } from './uv';

describe('faceUV', () => {
  it('normalizes pixel rects into flipped-v texture space', () => {
    // A 4x4 face at the top-left corner of a 16x16 texture.
    const [tl, tr, bl, br] = faceUV([0, 0, 4, 4], 0, 16, 16);
    expect(tl).toEqual([0, 1]);
    expect(tr).toEqual([0.25, 1]);
    expect(bl).toEqual([0, 0.75]);
    expect(br).toEqual([0.25, 0.75]);
  });

  it('supports mirrored rects where x1 > x2', () => {
    const [tl, tr] = faceUV([4, 0, 0, 4], 0, 16, 16);
    expect(tl[0]).toBeCloseTo(0.25);
    expect(tr[0]).toBeCloseTo(0);
  });

  it('rotates the corner assignment clockwise', () => {
    const base = faceUV([0, 0, 4, 4], 0, 16, 16);
    const rot90 = faceUV([0, 0, 4, 4], 90, 16, 16);
    // After 90° the old bottom-left corner lands at the top-left slot.
    expect(rot90[0]).toEqual(base[2]);
    expect(rot90[1]).toEqual(base[0]);

    const rot360 = faceUV([0, 0, 4, 4], 0, 16, 16);
    expect(rot360).toEqual(base);
  });

  it('is a full cycle at 4 rotations', () => {
    let corners = faceUV([2, 4, 6, 8], 0, 32, 32);
    const start = corners;
    for (let i = 0; i < 4; i++) {
      corners = [corners[2], corners[0], corners[3], corners[1]];
    }
    expect(corners).toEqual(start);
  });
});
