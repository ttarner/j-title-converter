import * as wanakana from 'wanakana';
import { TransliterationResult } from '../src/types';

// Loanword mapping dictionary for frequent Katakana musical and cultural terms
const KATAKANA_LOANWORDS: Record<string, string> = {
  'シャケナベイベー': 'Shake na baby',
  'シャケナ': 'Shake na',
  'ベイベー': 'Baby',
  'ベイビー': 'Baby',
  'プラスティック・ラブ': 'Plastic Love',
  'プラスティック': 'Plastic',
  'ラブ': 'Love',
  'アイドル': 'Idol',
  'ブルーバード': 'Blue Bird',
  'ブルー': 'Blue',
  'バード': 'Bird',
  'マリーゴールド': 'Marigold',
  'ロビンソン': 'Robinson',
  'チェリー': 'Cherry',
  'ドライフラワー': 'Dry Flower',
  'フラワー': 'Flower',
  'プレテンダー': 'Pretender',
  'サディスティック': 'Sadistic',
  '丸ノ内サディスティック': 'Marunouchi Sadistic',
  'モンスター': 'Monster',
  'パプリカ': 'Paprika',
  'レモン': 'Lemon',
  'ピースサイン': 'Peace Sign',
  'ダンス': 'Dance',
  'ナイト': 'Night',
  'スター': 'Star',
  'ボーイ': 'Boy',
  'ガール': 'Girl',
  'ミュージック': 'Music',
  'ソング': 'Song',
  'ロック': 'Rock',
  'ポップ': 'Pop',
  'ビート': 'Beat',
  'ハート': 'Heart',
  'ドリーム': 'Dream',
  'スカイ': 'Sky',
  'サンシャイン': 'Sunshine',
  'サマー': 'Summer',
  'スプリング': 'Spring',
  'オータム': 'Autumn',
  'ウィンター': 'Winter',
  'クリスマス': 'Christmas',
  'ハッピー': 'Happy',
  'ラッキー': 'Lucky',
  'マジック': 'Magic',
  'メモリー': 'Memory',
  'メモリーズ': 'Memories',
  'ファンタジー': 'Fantasy',
  'レインボー': 'Rainbow',
};

// Lazy loaded Kuroshiro instance
let kuroshiroInstance: any = null;
let kuroshiroInitPromise: Promise<any> | null = null;

async function getKuroshiro() {
  if (kuroshiroInstance) return kuroshiroInstance;
  if (!kuroshiroInitPromise) {
    kuroshiroInitPromise = (async () => {
      try {
        const KuroshiroPkg = await import('kuroshiro');
        const KuromojiPkg = await import('kuroshiro-analyzer-kuromoji');

        const KuroshiroRaw = (KuroshiroPkg as any)?.default ?? KuroshiroPkg;
        const KuroshiroClass = typeof KuroshiroRaw === 'function' ? KuroshiroRaw : KuroshiroRaw?.default;

        const KuromojiRaw = (KuromojiPkg as any)?.default ?? KuromojiPkg;
        const KuromojiAnalyzerClass = typeof KuromojiRaw === 'function' ? KuromojiRaw : KuromojiRaw?.default;

        const k = new KuroshiroClass();
        await k.init(new KuromojiAnalyzerClass());
        kuroshiroInstance = k;
        return k;
      } catch (err) {
        console.warn('Could not initialize Kuroshiro/Kuromoji analyzer, falling back to WanaKana:', err);
        kuroshiroInstance = null;
        return null;
      }
    })();
  }
  return kuroshiroInitPromise;
}

// Convert macron characters to standard ASCII for plain search queries
export function removeMacrons(str: string): string {
  return str
    .replace(/[āĀ]/g, 'a')
    .replace(/[ēĒ]/g, 'e')
    .replace(/[īĪ]/g, 'i')
    .replace(/[ōŌ]/g, 'o')
    .replace(/[ūŪ]/g, 'u')
    .replace(/[âÂ]/g, 'a')
    .replace(/[êÊ]/g, 'e')
    .replace(/[îÎ]/g, 'i')
    .replace(/[ôÔ]/g, 'o')
    .replace(/[ûÛ]/g, 'u');
}

// Title Case formatter for readable Western display
export function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .split(/\s+/)
    .map((word) => {
      if (['na', 'no', 'ni', 'de', 'wa', 'wo', 'to', 'in', 'of', 'and', 'the', 'a', 'an'].includes(word.toLowerCase())) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

// Check loanword heuristic dictionary
export function detectKatakanaLoanword(text: string): string | null {
  const trimmed = text.trim();
  if (KATAKANA_LOANWORDS[trimmed]) {
    return KATAKANA_LOANWORDS[trimmed];
  }

  // Segment by middle dot (・) or whitespace
  if (trimmed.includes('・') || trimmed.includes(' ')) {
    const parts = trimmed.split(/[・\s]+/);
    const converted = parts.map((part) => KATAKANA_LOANWORDS[part] || null);
    if (converted.every((p) => p !== null)) {
      return converted.join(' ');
    }
  }

  return null;
}

export async function transliterateJapanese(rawInput: string): Promise<TransliterationResult> {
  const text = rawInput.trim();
  const loanwordGuess = detectKatakanaLoanword(text);

  let romajiHepburn = '';
  let hiragana = '';
  let katakana = '';

  const kuroshiro = await getKuroshiro();
  if (kuroshiro) {
    try {
      romajiHepburn = await kuroshiro.convert(text, {
        to: 'romaji',
        mode: 'spaced',
        romajiSystem: 'hepburn',
      });
      hiragana = await kuroshiro.convert(text, { to: 'hiragana', mode: 'normal' });
      katakana = await kuroshiro.convert(text, { to: 'katakana', mode: 'normal' });
    } catch (err) {
      console.warn('Kuroshiro conversion error, using WanaKana fallback:', err);
    }
  }

  // WanaKana fallbacks if Kuroshiro didn't provide complete results
  if (!romajiHepburn) {
    // WanaKana toRomaji
    romajiHepburn = wanakana.toRomaji(text, { customRomajiMapping: {} });
  }

  if (!hiragana) {
    hiragana = wanakana.toHiragana(text);
  }

  if (!katakana) {
    katakana = wanakana.toKatakana(text);
  }

  const romajiPlain = removeMacrons(romajiHepburn);
  const formattedRomaji = toTitleCase(romajiHepburn);

  return {
    original: text,
    romaji: formattedRomaji,
    romajiHepburn,
    romajiPlain,
    hiragana,
    katakana,
    westernGuess: loanwordGuess || undefined,
  };
}
