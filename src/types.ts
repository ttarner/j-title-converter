export interface MusicMatch {
  title: string;
  artist: string;
  album?: string;
  releaseDate?: string;
  source: 'MusicBrainz' | 'iTunes' | 'Spotify' | 'Heuristic';
  artworkUrl?: string;
  previewUrl?: string;
  externalUrl?: string;
  confidence: 'high' | 'medium' | 'low';
  isrc?: string;
  disambiguation?: string;
}

export interface TransliterationResult {
  original: string;
  romaji: string;
  romajiHepburn: string;
  romajiPlain: string;
  hiragana: string;
  katakana: string;
  westernGuess?: string;
  tokens?: Array<{
    surface: string;
    reading?: string;
    romaji?: string;
    type: 'kanji' | 'hiragana' | 'katakana' | 'latin' | 'other';
  }>;
}

export interface StreamingTrackInfo {
  service: 'spotify' | 'apple_music' | 'youtube';
  serviceName: 'Spotify' | 'Apple Music' | 'YouTube Music';
  title: string;
  artist?: string;
  artworkUrl?: string;
  url: string;
}

export interface AnimeSoundtrackInfo {
  anime: string;
  animeWesternTitle?: string;
  animeJapaneseTitle?: string;
  myAnimeListUrl?: string;
  crunchyrollUrl?: string;
  themeType: 'Opening' | 'Ending' | 'Insert' | 'Theme Song';
  themeName: string; // e.g. "Opening 1 (OP1)" or "Ending 2 (ED2)"
  sequence?: number | null;
  slug?: string; // e.g. "OP1", "ED2"
  year?: number | null;
  season?: string | null;
  synopsis?: string;
  source?: string;
}

export interface ConversionResponse {
  success: boolean;
  input: {
    text: string;
    artist?: string;
    sourceType: 'text' | 'image_ocr' | 'streaming_link';
    ocrConfidence?: number;
    rawOcrText?: string;
    extractedArtist?: string;
    streamingTrackInfo?: StreamingTrackInfo;
  };
  transliteration: TransliterationResult;
  musicMatches: MusicMatch[];
  primaryWesternTitle: string;
  animeInfo?: AnimeSoundtrackInfo;
  streamingTrackInfo?: StreamingTrackInfo;
  error?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  westernTitle: string;
  originalTitle: string;
  romaji: string;
  artist?: string;
  artworkUrl?: string;
  sourceType: 'text' | 'image_ocr' | 'streaming_link';
  serviceName?: string;
  streamingUrl?: string;
  animeName?: string;
  result: ConversionResponse;
}

export interface ConversionRequest {
  text?: string;
  artist?: string;
  imageBase64?: string;
  streamingUrl?: string;
}
