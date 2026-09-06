/// <reference types="vite/client" />

declare module 'kuroshiro' {
  export interface ConvertOptions {
    to?: 'hiragana' | 'katakana' | 'romaji';
    mode?: 'normal' | 'spaced' | 'okurigana' | 'furigana';
    romajiSystem?: 'nippon' | 'passport' | 'hepburn';
    delimiter_start?: string;
    delimiter_end?: string;
  }

  export default class Kuroshiro {
    constructor();
    init(analyzer: any): Promise<void>;
    convert(str: string, options?: ConvertOptions): Promise<string>;
    static Util: any;
  }
}

declare module 'kuroshiro-analyzer-kuromoji' {
  export default class KuromojiAnalyzer {
    constructor(options?: { dictPath?: string });
    init(): Promise<void>;
  }
}
