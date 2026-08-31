import { parseModel, ParseError } from './bbmodel/parse';
import { buildModel, type BuiltModel } from './render/build';
import { Stage, type StageOptions } from './render/stage';
import { encodeTurntableGif } from './export/gif';
import { t, getLang, setLang, LANG_NAMES, type Lang } from './i18n';

const $ = <T extends HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`missing #${id}`);
  return el as T;
};

const canvas = $<HTMLCanvasElement>('stage');
const dropzone = $('dropzone');
const dropHint = $('drop-hint');
const fileInput = $<HTMLInputElement>('file');
const exportButton = $<HTMLButtonElement>('export');
const status = $('status');
const modelName = $('model-name');

const controls = {
  size: $<HTMLSelectElement>('size'),
  frames: $<HTMLSelectElement>('frames'),
  duration: $<HTMLInputElement>('duration'),
  durationLabel: $('duration-label'),
  pitch: $<HTMLInputElement>('pitch'),
  pitchLabel: $('pitch-label'),
  bg: $<HTMLInputElement>('bg'),
  transparent: $<HTMLInputElement>('transparent'),
};

function applyStrings(): void {
  $('tagline').textContent = t('tagline');
  $('drop-here').textContent = t('dropHere');
  $('drop-or').textContent = t('or');
  $('pick').textContent = t('chooseFile');
  $('load-sample').textContent = t('loadSample');
  $('l-size').textContent = t('size');
  $('l-frames').textContent = t('frames');
  $('l-duration').textContent = t('duration');
  $('l-pitch').textContent = t('pitch');
  $('l-bg').textContent = t('background');
  $('l-transparent').textContent = t('transparent');
  exportButton.textContent = t('exportGif');
  document.documentElement.lang = getLang();
}

const langSelect = $<HTMLSelectElement>('lang');
for (const [code, name] of Object.entries(LANG_NAMES)) {
  const option = document.createElement('option');
  option.value = code;
  option.textContent = name;
  langSelect.append(option);
}
langSelect.value = getLang();
langSelect.addEventListener('change', () => {
  setLang(langSelect.value as Lang);
  applyStrings();
});

let stage: Stage | null = null;
let built: BuiltModel | null = null;
let modelDuration = 3000;
let exporting = false;

function stageOptions(forExport = false): StageOptions {
  const transparent = controls.transparent.checked;
  return {
    size: Number(controls.size.value),
    // The live preview keeps the panel color behind transparent exports.
    background: transparent ? (forExport ? null : '#1b191f') : controls.bg.value,
    pitchDeg: Number(controls.pitch.value),
  };
}

function say(message: string, isError = false): void {
  status.textContent = message;
  status.classList.toggle('error', isError);
}

async function loadText(text: string, sourceName: string): Promise<void> {
  try {
    const model = parseModel(text);
    built?.dispose();
    built = await buildModel(model);
    stage ??= new Stage(canvas, stageOptions());
    stage.setModel(built.group, stageOptions());
    dropHint.classList.add('hidden');
    exportButton.disabled = false;
    modelName.textContent = `${model.name} · ${sourceName}`;
    say('');
  } catch (error) {
    const reason = error instanceof ParseError ? error.message : String(error);
    say(t('loadFailed', { name: sourceName, reason }), true);
  }
}

async function loadFile(file: File): Promise<void> {
  await loadText(await file.text(), file.name);
}

// Live preview loop: keep spinning at the configured speed.
let start = performance.now();
function tick(now: number): void {
  if (stage && built && !exporting) {
    const angle = (((now - start) % modelDuration) / modelDuration) * Math.PI * 2;
    stage.renderAngle(angle);
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

dropzone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropzone.classList.add('dragging');
});
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragging'));
dropzone.addEventListener('drop', (event) => {
  event.preventDefault();
  dropzone.classList.remove('dragging');
  const file = event.dataTransfer?.files?.[0];
  if (file) void loadFile(file);
});

$('pick').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0];
  if (file) void loadFile(file);
});

$('load-sample').addEventListener('click', async () => {
  say(t('loadingSample'));
  const response = await fetch('/sample/bbspin-bot.bbmodel');
  await loadText(await response.text(), 'bbspin-bot.bbmodel');
});

for (const input of [controls.size, controls.pitch, controls.bg, controls.transparent]) {
  input.addEventListener('input', () => {
    if (stage && built) stage.configure(stageOptions());
    controls.pitchLabel.textContent = `${controls.pitch.value}°`;
  });
}
controls.duration.addEventListener('input', () => {
  modelDuration = Number(controls.duration.value);
  controls.durationLabel.textContent = `${(modelDuration / 1000).toFixed(1)}s`;
});

exportButton.addEventListener('click', async () => {
  if (!stage || !built || exporting) return;
  exporting = true;
  exportButton.disabled = true;
  try {
    stage.configure(stageOptions(true));
    const blob = await encodeTurntableGif(canvas, (angle) => stage!.renderAngle(angle), {
      frames: Number(controls.frames.value),
      durationMs: modelDuration,
      transparent: controls.transparent.checked,
      onProgress: (done, total) => say(t('encoding', { done, total })),
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(modelName.textContent ?? 'model').split(' ·')[0]}-turntable.gif`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    say(t('done', { size: (blob.size / 1024 / 1024).toFixed(1) }));
  } catch (error) {
    say(String(error), true);
  } finally {
    stage.configure(stageOptions());
    exporting = false;
    exportButton.disabled = false;
  }
});

applyStrings();
