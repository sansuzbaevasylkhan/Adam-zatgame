export const DEFAULT_CATEGORIES = [
  'Аты',
  'Жеміс',
  'Ел',
  'Қала',
  'Өсімдік',
  'Жануар',
  'Киім',
  'Тағам',
  'Спорт',
  'Кәсіп',
  'Музыка аспабы',
  'Кино',
  'Тарихи тұлға',
  'Географиялық орын',
  'Көлік',
  'Түс',
  'Аспан денесі',
  'Құс',
  'Балық',
  'Жәндік',
];

export const KAZAKH_ALPHABET = [
  'А', 'Ә', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З',
  'И', 'Й', 'К', 'Қ', 'Л', 'М', 'Н', 'Ң', 'О', 'Ө',
  'П', 'Р', 'С', 'Т', 'У', 'Ұ', 'Ү', 'Ф', 'Х', 'Һ',
  'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'І', 'Ь', 'Э', 'Ю', 'Я',
];

export const ROUND_DURATIONS = [30, 60, 90, 120];
export const ROUND_COUNTS = [1, 3, 5, 7];
export const MAX_PLAYERS = 8;
export const MIN_PLAYERS = 2;
export const ROOM_CODE_LENGTH = 6;

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function pickRandomLetter(exclude: string[] = []): string {
  const available = KAZAKH_ALPHABET.filter((l) => !exclude.includes(l));
  const pool = available.length > 0 ? available : KAZAKH_ALPHABET;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pickRandomCategories(count: number): string[] {
  const shuffled = [...DEFAULT_CATEGORIES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
