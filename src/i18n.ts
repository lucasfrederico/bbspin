// Lightweight i18n: a string table per language, no framework.

export type Lang =
  | 'en' | 'pt' | 'es' | 'de' | 'fr' | 'pl' | 'ru' | 'tr' | 'ja' | 'zh' | 'ko';

export const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
  pl: 'Polski',
  ru: 'Русский',
  tr: 'Türkçe',
  ja: '日本語',
  zh: '中文',
  ko: '한국어',
};

interface Strings {
  tagline: string;
  dropHere: string;
  or: string;
  chooseFile: string;
  loadSample: string;
  size: string;
  frames: string;
  duration: string;
  pitch: string;
  background: string;
  transparent: string;
  exportGif: string;
  loadingSample: string;
  encoding: string; // {done} {total}
  done: string; // {size}
  loadFailed: string; // {name} {reason}
}

const TABLE: Record<Lang, Strings> = {
  en: {
    tagline:
      'Drop a .bbmodel, get a spinning preview GIF. Everything runs in your browser; the model never leaves your machine.',
    dropHere: 'drop a .bbmodel here',
    or: 'or',
    chooseFile: 'choose a file',
    loadSample: 'load the sample',
    size: 'size',
    frames: 'frames',
    duration: 'spin duration',
    pitch: 'camera pitch',
    background: 'background',
    transparent: 'transparent background',
    exportGif: 'export gif',
    loadingSample: 'loading sample…',
    encoding: 'encoding {done}/{total}',
    done: 'done, {size}MB',
    loadFailed: 'could not load {name}: {reason}',
  },
  pt: {
    tagline:
      'Solte um .bbmodel e receba um GIF de preview girando. Tudo roda no seu navegador; o modelo nunca sai da sua máquina.',
    dropHere: 'solte um .bbmodel aqui',
    or: 'ou',
    chooseFile: 'escolher arquivo',
    loadSample: 'carregar o exemplo',
    size: 'tamanho',
    frames: 'quadros',
    duration: 'duração do giro',
    pitch: 'ângulo da câmera',
    background: 'fundo',
    transparent: 'fundo transparente',
    exportGif: 'exportar gif',
    loadingSample: 'carregando exemplo…',
    encoding: 'codificando {done}/{total}',
    done: 'pronto, {size}MB',
    loadFailed: 'não foi possível carregar {name}: {reason}',
  },
  es: {
    tagline:
      'Suelta un .bbmodel y obtén un GIF de vista previa girando. Todo corre en tu navegador; el modelo nunca sale de tu máquina.',
    dropHere: 'suelta un .bbmodel aquí',
    or: 'o',
    chooseFile: 'elegir archivo',
    loadSample: 'cargar el ejemplo',
    size: 'tamaño',
    frames: 'fotogramas',
    duration: 'duración del giro',
    pitch: 'ángulo de cámara',
    background: 'fondo',
    transparent: 'fondo transparente',
    exportGif: 'exportar gif',
    loadingSample: 'cargando ejemplo…',
    encoding: 'codificando {done}/{total}',
    done: 'listo, {size}MB',
    loadFailed: 'no se pudo cargar {name}: {reason}',
  },
  de: {
    tagline:
      'Zieh eine .bbmodel-Datei hierher und bekomm ein drehendes Vorschau-GIF. Alles läuft im Browser; das Modell verlässt deinen Rechner nie.',
    dropHere: '.bbmodel hier ablegen',
    or: 'oder',
    chooseFile: 'Datei wählen',
    loadSample: 'Beispiel laden',
    size: 'Größe',
    frames: 'Frames',
    duration: 'Drehdauer',
    pitch: 'Kamerawinkel',
    background: 'Hintergrund',
    transparent: 'transparenter Hintergrund',
    exportGif: 'GIF exportieren',
    loadingSample: 'Beispiel wird geladen…',
    encoding: 'Kodierung {done}/{total}',
    done: 'fertig, {size}MB',
    loadFailed: '{name} konnte nicht geladen werden: {reason}',
  },
  fr: {
    tagline:
      'Déposez un .bbmodel et obtenez un GIF de prévisualisation en rotation. Tout tourne dans votre navigateur ; le modèle ne quitte jamais votre machine.',
    dropHere: 'déposez un .bbmodel ici',
    or: 'ou',
    chooseFile: 'choisir un fichier',
    loadSample: "charger l'exemple",
    size: 'taille',
    frames: 'images',
    duration: 'durée de rotation',
    pitch: 'angle de caméra',
    background: 'fond',
    transparent: 'fond transparent',
    exportGif: 'exporter le gif',
    loadingSample: "chargement de l'exemple…",
    encoding: 'encodage {done}/{total}',
    done: 'terminé, {size}MB',
    loadFailed: 'impossible de charger {name} : {reason}',
  },
  pl: {
    tagline:
      'Upuść plik .bbmodel i otrzymaj obracający się GIF z podglądem. Wszystko działa w przeglądarce; model nigdy nie opuszcza twojego komputera.',
    dropHere: 'upuść plik .bbmodel tutaj',
    or: 'lub',
    chooseFile: 'wybierz plik',
    loadSample: 'wczytaj przykład',
    size: 'rozmiar',
    frames: 'klatki',
    duration: 'czas obrotu',
    pitch: 'kąt kamery',
    background: 'tło',
    transparent: 'przezroczyste tło',
    exportGif: 'eksportuj gif',
    loadingSample: 'wczytywanie przykładu…',
    encoding: 'kodowanie {done}/{total}',
    done: 'gotowe, {size}MB',
    loadFailed: 'nie udało się wczytać {name}: {reason}',
  },
  ru: {
    tagline:
      'Перетащите .bbmodel и получите вращающийся GIF-превью. Всё работает в браузере; модель не покидает ваш компьютер.',
    dropHere: 'перетащите .bbmodel сюда',
    or: 'или',
    chooseFile: 'выбрать файл',
    loadSample: 'загрузить пример',
    size: 'размер',
    frames: 'кадры',
    duration: 'длительность оборота',
    pitch: 'наклон камеры',
    background: 'фон',
    transparent: 'прозрачный фон',
    exportGif: 'экспорт gif',
    loadingSample: 'загрузка примера…',
    encoding: 'кодирование {done}/{total}',
    done: 'готово, {size}МБ',
    loadFailed: 'не удалось загрузить {name}: {reason}',
  },
  tr: {
    tagline:
      "Bir .bbmodel bırak, dönen bir önizleme GIF'i al. Her şey tarayıcıda çalışır; model asla makinenden çıkmaz.",
    dropHere: 'buraya bir .bbmodel bırak',
    or: 'veya',
    chooseFile: 'dosya seç',
    loadSample: 'örneği yükle',
    size: 'boyut',
    frames: 'kare',
    duration: 'dönüş süresi',
    pitch: 'kamera açısı',
    background: 'arka plan',
    transparent: 'şeffaf arka plan',
    exportGif: "gif'i dışa aktar",
    loadingSample: 'örnek yükleniyor…',
    encoding: 'kodlanıyor {done}/{total}',
    done: 'bitti, {size}MB',
    loadFailed: '{name} yüklenemedi: {reason}',
  },
  ja: {
    tagline:
      '.bbmodel をドロップすると、回転するプレビューGIFが作れます。すべてブラウザ内で動作し、モデルが外部に送信されることはありません。',
    dropHere: 'ここに .bbmodel をドロップ',
    or: 'または',
    chooseFile: 'ファイルを選択',
    loadSample: 'サンプルを読み込む',
    size: 'サイズ',
    frames: 'フレーム数',
    duration: '回転時間',
    pitch: 'カメラ角度',
    background: '背景',
    transparent: '透明背景',
    exportGif: 'GIFを書き出す',
    loadingSample: 'サンプルを読み込み中…',
    encoding: 'エンコード中 {done}/{total}',
    done: '完了、{size}MB',
    loadFailed: '{name} を読み込めませんでした: {reason}',
  },
  zh: {
    tagline:
      '拖入 .bbmodel 文件，即可生成旋转预览 GIF。一切都在浏览器中运行，模型不会离开你的电脑。',
    dropHere: '把 .bbmodel 拖到这里',
    or: '或',
    chooseFile: '选择文件',
    loadSample: '加载示例',
    size: '尺寸',
    frames: '帧数',
    duration: '旋转时长',
    pitch: '相机角度',
    background: '背景',
    transparent: '透明背景',
    exportGif: '导出 GIF',
    loadingSample: '正在加载示例…',
    encoding: '编码中 {done}/{total}',
    done: '完成，{size}MB',
    loadFailed: '无法加载 {name}：{reason}',
  },
  ko: {
    tagline:
      '.bbmodel 파일을 끌어다 놓으면 회전 미리보기 GIF를 만들 수 있습니다. 모든 처리는 브라우저에서 이루어지며 모델은 컴퓨터 밖으로 나가지 않습니다.',
    dropHere: '여기에 .bbmodel 파일을 놓으세요',
    or: '또는',
    chooseFile: '파일 선택',
    loadSample: '샘플 불러오기',
    size: '크기',
    frames: '프레임 수',
    duration: '회전 시간',
    pitch: '카메라 각도',
    background: '배경',
    transparent: '투명 배경',
    exportGif: 'GIF 내보내기',
    loadingSample: '샘플 불러오는 중…',
    encoding: '인코딩 중 {done}/{total}',
    done: '완료, {size}MB',
    loadFailed: '{name}을(를) 불러오지 못했습니다: {reason}',
  },
};

const STORAGE_KEY = 'bbspin-lang';
let current: Lang = detect();

function detect(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved && saved in TABLE) return saved;
  } catch {
    // storage can be unavailable; fall through to the browser language
  }
  const nav = (navigator.language || 'en').toLowerCase();
  const primary = nav.split('-')[0] as Lang;
  return primary in TABLE ? primary : 'en';
}

export function getLang(): Lang {
  return current;
}

export function setLang(lang: Lang): void {
  current = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // fine, the choice just won't persist
  }
}

export function t(key: keyof Strings, params: Record<string, string | number> = {}): string {
  let out = TABLE[current][key];
  for (const [name, value] of Object.entries(params)) {
    out = out.replace(`{${name}}`, String(value));
  }
  return out;
}
