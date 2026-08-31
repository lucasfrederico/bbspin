import { GIFEncoder, quantize, applyPalette } from 'gifenc';

export interface GifOptions {
  frames: number;
  durationMs: number;
  transparent: boolean;
  onProgress?: (done: number, total: number) => void;
}

/**
 * Encodes a spinning-model GIF by asking the caller to render each angle and
 * reading the pixels back from the canvas.
 */
export async function encodeTurntableGif(
  canvas: HTMLCanvasElement,
  renderAngle: (angleRad: number) => void,
  options: GifOptions,
): Promise<Blob> {
  const { frames, durationMs, transparent } = options;
  const delay = Math.max(Math.round(durationMs / frames / 10) * 10, 20);
  const gif = GIFEncoder();

  const read = document.createElement('canvas');
  read.width = canvas.width;
  read.height = canvas.height;
  const ctx = read.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('2d context unavailable');

  for (let i = 0; i < frames; i++) {
    renderAngle((i / frames) * Math.PI * 2);
    ctx.clearRect(0, 0, read.width, read.height);
    ctx.drawImage(canvas, 0, 0);
    const { data } = ctx.getImageData(0, 0, read.width, read.height);

    if (transparent) {
      const format = 'rgba4444';
      const palette = quantize(data, 255, { format });
      let transparentIndex = palette.findIndex((c: number[]) => c[3] === 0);
      if (transparentIndex === -1) {
        palette.push([0, 0, 0, 0]);
        transparentIndex = palette.length - 1;
      }
      const index = applyPalette(data, palette, format);
      // Pixels the renderer left transparent must map to the clear slot.
      for (let p = 3, px = 0; p < data.length; p += 4, px++) {
        if (data[p] < 128) index[px] = transparentIndex;
      }
      gif.writeFrame(index, read.width, read.height, {
        palette,
        delay,
        transparent: true,
        transparentIndex,
        dispose: 2,
      });
    } else {
      const palette = quantize(data, 256);
      const index = applyPalette(data, palette);
      gif.writeFrame(index, read.width, read.height, { palette, delay });
    }

    options.onProgress?.(i + 1, frames);
    // Yield so the progress UI can paint.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  gif.finish();
  const bytes = gif.bytes();
  const copy = new Uint8Array(new ArrayBuffer(bytes.length));
  copy.set(bytes);
  return new Blob([copy], { type: 'image/gif' });
}
