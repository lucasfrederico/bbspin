import { describe, expect, it } from 'vitest';
import { parseModel, ParseError } from './parse';

const cubeElement = {
  uuid: 'aaa',
  name: 'body',
  type: 'cube',
  from: [-2, 0, -2],
  to: [2, 4, 2],
  origin: [0, 0, 0],
  rotation: [0, 45, 0],
  inflate: 0.25,
  faces: {
    north: { uv: [0, 0, 4, 4], texture: 0 },
    up: { uv: [4, 0, 8, 4], texture: 0, rotation: 180 },
    down: { uv: [0, 0, 4, 4], texture: null },
  },
};

const base = {
  name: 'crab',
  resolution: { width: 32, height: 32 },
  textures: [{ name: 'skin', source: 'data:image/png;base64,xyz', uv_width: 32, uv_height: 32 }],
  elements: [cubeElement],
  outliner: [{ name: 'root', origin: [0, 0, 0], rotation: [0, 0, 0], children: ['aaa'] }],
};

describe('parseModel', () => {
  it('parses cubes, faces and textures', () => {
    const model = parseModel(JSON.stringify(base));
    expect(model.name).toBe('crab');
    expect(model.textureWidth).toBe(32);
    expect(model.textures).toHaveLength(1);

    const group = model.root[0];
    if (!('children' in group)) throw new Error('expected group');
    const node = group.children[0];
    if (!('cube' in node)) throw new Error('expected cube');

    expect(node.cube.inflate).toBe(0.25);
    expect(node.cube.faces.north?.uv).toEqual([0, 0, 4, 4]);
    expect(node.cube.faces.up?.rotation).toBe(180);
    // texture: null means the face is not rendered
    expect(node.cube.faces.down).toBeUndefined();
  });

  it('keeps cubes that the outliner never references', () => {
    const model = parseModel(
      JSON.stringify({ ...base, outliner: [] }),
    );
    expect(model.root).toHaveLength(1);
    expect('cube' in model.root[0]).toBe(true);
  });

  it('skips mesh elements without failing', () => {
    const model = parseModel(
      JSON.stringify({
        ...base,
        elements: [cubeElement, { uuid: 'bbb', type: 'mesh', vertices: {} }],
        outliner: [],
      }),
    );
    expect(model.root).toHaveLength(1);
  });

  it('rejects non-json and non-bbmodel input', () => {
    expect(() => parseModel('not json')).toThrow(ParseError);
    expect(() => parseModel('{"hello":1}')).toThrow(ParseError);
  });

  it('normalizes bad face rotations to 0', () => {
    const el = {
      ...cubeElement,
      faces: { north: { uv: [0, 0, 4, 4], texture: 0, rotation: 45 } },
    };
    const model = parseModel(JSON.stringify({ ...base, elements: [el], outliner: [] }));
    const node = model.root[0];
    if (!('cube' in node)) throw new Error('expected cube');
    expect(node.cube.faces.north?.rotation).toBe(0);
  });
});
