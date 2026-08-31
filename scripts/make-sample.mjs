// Generates public/sample/bbspin-bot.bbmodel: a small original robot with a
// procedurally painted texture, so the app ships a sample that is ours.
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';

const W = 64;
const H = 64;
const pixels = new Uint8Array(W * H * 4);

function put(x, y, [r, g, b, a = 255]) {
  const i = (y * W + x) * 4;
  pixels[i] = r;
  pixels[i + 1] = g;
  pixels[i + 2] = b;
  pixels[i + 3] = a;
}

function jitter(rng, value, amount) {
  return Math.max(0, Math.min(255, value + Math.floor((rng() - 0.5) * amount)));
}

// Deterministic little PRNG so the sample is reproducible.
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function paintRegion(x0, y0, x1, y1, base, border, seed) {
  const rng = mulberry32(seed);
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const edge = x === x0 || y === y0 || x === x1 - 1 || y === y1 - 1;
      const c = edge ? border : base;
      put(x, y, [jitter(rng, c[0], 14), jitter(rng, c[1], 14), jitter(rng, c[2], 14)]);
    }
  }
}

const amber = [227, 154, 77];
const amberDark = [160, 104, 48];
const amberLight = [240, 180, 110];
const steel = [82, 78, 88];
const steelDark = [54, 51, 60];
const visor = [30, 28, 36];
const cyan = [104, 220, 220];

paintRegion(0, 0, 16, 16, amber, amberDark, 1); // body
paintRegion(16, 0, 32, 16, amberLight, amberDark, 2); // head
paintRegion(32, 0, 48, 12, visor, steelDark, 3); // visor
paintRegion(0, 16, 8, 32, steel, steelDark, 4); // limbs
paintRegion(48, 0, 52, 4, cyan, cyan, 5); // antenna tip
paintRegion(52, 0, 56, 4, steelDark, steelDark, 6); // antenna rod

// Eyes on the visor.
for (const ex of [36, 43]) {
  put(ex, 4, cyan);
  put(ex + 1, 4, cyan);
  put(ex, 5, cyan);
  put(ex + 1, 5, cyan);
}
// Chest light.
put(7, 5, cyan);
put(8, 5, cyan);

// --- minimal PNG encoder (RGBA, no filtering) ---
function crc32(buf) {
  let crc = 0xffffffff;
  for (const byte of buf) {
    crc ^= byte;
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

function encodePNG() {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc(H * (1 + W * 4));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 4)] = 0;
    Buffer.from(pixels.subarray(y * W * 4, (y + 1) * W * 4)).copy(raw, y * (1 + W * 4) + 1);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const textureURI = `data:image/png;base64,${encodePNG().toString('base64')}`;

// --- the model ---
let uuidCounter = 0;
const uuid = () => `bot-${(uuidCounter++).toString().padStart(2, '0')}`;

const BODY = [0, 0, 16, 16];
const HEAD = [16, 0, 32, 16];
const VISOR = [32, 0, 48, 12];
const LIMB = [0, 16, 8, 32];
const TIP = [48, 0, 52, 4];
const ROD = [52, 0, 56, 4];

function cube(name, from, to, uvRect, overrides = {}) {
  const face = (rect) => ({ uv: rect, texture: 0 });
  return {
    uuid: uuid(),
    type: 'cube',
    name,
    from,
    to,
    origin: [0, 0, 0],
    rotation: [0, 0, 0],
    faces: {
      north: face(overrides.north ?? uvRect),
      south: face(uvRect),
      east: face(uvRect),
      west: face(uvRect),
      up: face(uvRect),
      down: face(uvRect),
    },
    ...overrides.extra,
  };
}

const elements = [
  cube('leg-left', [-3.5, 0, -1.5], [-0.5, 4, 1.5], LIMB),
  cube('leg-right', [0.5, 0, -1.5], [3.5, 4, 1.5], LIMB),
  cube('body', [-5, 4, -3], [5, 12, 3], BODY),
  cube('arm-left', [-7.5, 5, -1.5], [-5.5, 11, 1.5], LIMB),
  cube('arm-right', [5.5, 5, -1.5], [7.5, 11, 1.5], LIMB),
  cube('head', [-4, 12, -4], [4, 19, 4], HEAD, { north: VISOR }),
  cube('antenna', [-0.5, 19, -0.5], [0.5, 22, 0.5], ROD),
  cube('antenna-tip', [-1, 22, -1], [1, 24, 1], TIP),
];

const model = {
  meta: { format_version: '4.10', model_format: 'free', box_uv: false },
  name: 'bbspin-bot',
  resolution: { width: W, height: H },
  elements,
  outliner: [
    {
      name: 'bot',
      origin: [0, 0, 0],
      rotation: [0, 0, 0],
      children: elements.map((el) => el.uuid),
    },
  ],
  textures: [
    { name: 'bot', source: textureURI, uv_width: W, uv_height: H },
  ],
};

mkdirSync('public/sample', { recursive: true });
writeFileSync('public/sample/bbspin-bot.bbmodel', JSON.stringify(model, null, 2));
console.log('wrote public/sample/bbspin-bot.bbmodel');
