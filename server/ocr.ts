import { createWorker, Worker } from 'tesseract.js';
import * as wanakana from 'wanakana';

let ocrWorker: Worker | null = null;
let ocrInitPromise: Promise<Worker> | null = null;

async function getOcrWorker(): Promise<Worker> {
  if (ocrWorker) return ocrWorker;
  if (!ocrInitPromise) {
    ocrInitPromise = (async () => {
      console.log('Initializing Tesseract OCR worker for Japanese and English...');
      const worker = await createWorker('jpn+eng');
      ocrWorker = worker;
      console.log('Tesseract OCR worker ready.');
      return worker;
    })();
  }
  return ocrInitPromise;
}

export interface OcrProcessingResult {
  text: string;
  artist?: string;
  rawText: string;
  confidence: number;
  lines: string[];
}

/**
 * Filter and extract likely song title and artist/band lines from OCR raw text.
 * Strips mobile status bar noise (e.g. battery %, time, 'LTE', '5G')
 * and player control noise (e.g. '0:00', '3:45', 'queue', 'shuffle').
 */
export function extractSongAndArtistCandidates(rawText: string): {
  cleanText: string;
  artist?: string;
  lines: string[];
} {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Common UI noise patterns on phone/Spotify screenshots
  const noiseRegex =
    /^(?:[0-9]{1,2}:[0-9]{2}|5g|4g|lte|wifi|[0-9]{1,3}%|am|pm|\.\.\.|shuffle|repeat|play|pause|queue|lyrics|home|search|library|next|previous)$/i;

  const filteredLines = lines.filter((line) => {
    if (noiseRegex.test(line.toLowerCase())) return false;
    // Skip very short numeric-only or symbol-only strings
    if (/^[0-9\s:.\-_/+]+$/.test(line)) return false;
    return true;
  });

  if (filteredLines.length === 0) {
    return {
      cleanText: rawText.trim(),
      artist: undefined,
      lines: [],
    };
  }

  // Find index of first Japanese line (Kanji, Hiragana, Katakana)
  const jpIndex = filteredLines.findIndex((line) => {
    for (const ch of line) {
      if (wanakana.isJapanese(ch)) return true;
    }
    return false;
  });

  let cleanText = '';
  let artist: string | undefined = undefined;

  if (jpIndex !== -1) {
    cleanText = filteredLines[jpIndex].replace(/[\r\n\t]+/g, ' ').trim();

    // Check adjacent lines for the artist name (typically line after the title)
    if (jpIndex + 1 < filteredLines.length) {
      const candidate = filteredLines[jpIndex + 1].trim();
      if (candidate !== cleanText && candidate.length >= 2 && candidate.length <= 60) {
        artist = candidate;
      }
    } else if (jpIndex > 0) {
      const candidate = filteredLines[jpIndex - 1].trim();
      if (candidate !== cleanText && candidate.length >= 2 && candidate.length <= 60) {
        artist = candidate;
      }
    }
  } else {
    // If no Japanese script detected, line 0 is title, line 1 is artist
    cleanText = filteredLines[0].replace(/[\r\n\t]+/g, ' ').trim();
    if (filteredLines.length > 1) {
      const candidate = filteredLines[1].trim();
      if (candidate !== cleanText && candidate.length >= 2 && candidate.length <= 60) {
        artist = candidate;
      }
    }
  }

  return {
    cleanText,
    artist,
    lines: filteredLines,
  };
}

export async function processImageOcr(imageBase64OrUrl: string): Promise<OcrProcessingResult> {
  const worker = await getOcrWorker();

  // Strip prefix data URI if present (or pass directly, Tesseract handles data URIs)
  const result = await worker.recognize(imageBase64OrUrl);
  const rawText = result.data.text || '';
  const confidence = result.data.confidence || 0;

  const { cleanText, artist, lines } = extractSongAndArtistCandidates(rawText);

  return {
    text: cleanText,
    artist,
    rawText,
    confidence,
    lines,
  };
}
