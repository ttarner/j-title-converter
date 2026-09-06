import { Capacitor } from '@capacitor/core';
import { ConversionResponse } from '../types';
import { transliterateJapanese } from '../../server/converter';
import { processImageOcr } from '../../server/ocr';
import { findMusicMetadata, determinePrimaryWesternTitle } from '../../server/music';
import { findAnimeSoundtrackInfo } from '../../server/anime';
import { isStreamingUrl, resolveStreamingLink, StreamingTrackInfo } from '../../server/streaming';

export interface ConvertRequestParams {
  text?: string;
  artist?: string;
  imageBase64?: string;
  streamingUrl?: string;
}

/**
 * Executes direct client-side song title conversion and metadata matching.
 * Used on mobile devices (Capacitor) where requests can run directly without CORS proxies.
 */
async function executeClientSideConversion(params: ConvertRequestParams): Promise<ConversionResponse> {
  const { text, artist, imageBase64, streamingUrl } = params;

  let inputText = (text || '').trim();
  let inputArtist = (artist || '').trim() || undefined;
  let extractedArtist: string | undefined = undefined;
  let sourceType: 'text' | 'image_ocr' | 'streaming_link' = 'text';
  let ocrConfidence: number | undefined;
  let rawOcrText: string | undefined;
  let streamingTrackInfo: StreamingTrackInfo | undefined = undefined;

  const potentialUrl = (streamingUrl || (isStreamingUrl(inputText) ? inputText : '')).trim();

  if (potentialUrl) {
    sourceType = 'streaming_link';
    const resolved = await resolveStreamingLink(potentialUrl);

    if (!resolved || !resolved.title) {
      throw new Error(
        'Could not retrieve song details from the streaming link. Please verify that the track is public.'
      );
    }

    streamingTrackInfo = resolved;
    inputText = resolved.title;
    if (!inputArtist && resolved.artist) {
      inputArtist = resolved.artist;
    }
  } else if (imageBase64 && !inputText) {
    sourceType = 'image_ocr';
    const ocrResult = await processImageOcr(imageBase64);
    inputText = ocrResult.text;
    extractedArtist = ocrResult.artist;
    if (!inputArtist && ocrResult.artist) {
      inputArtist = ocrResult.artist;
    }
    ocrConfidence = ocrResult.confidence;
    rawOcrText = ocrResult.rawText;

    if (!inputText) {
      throw new Error('No recognizable Japanese text found in the image. Please try a clearer screenshot.');
    }
  }

  if (!inputText) {
    throw new Error('Please enter a streaming link, Japanese title, or upload a screenshot.');
  }

  // 1. Transliteration
  const transliteration = await transliterateJapanese(inputText);

  // 2. Query Music Databases (MusicBrainz, iTunes)
  const musicMatches = await findMusicMetadata({
    japaneseTitle: inputText,
    romajiTitle: transliteration.romaji,
    artist: inputArtist,
    westernGuess: transliteration.westernGuess,
  });

  if (streamingTrackInfo) {
    const alreadyHasMatch = musicMatches.some((m) => m.externalUrl === streamingTrackInfo?.url);
    if (!alreadyHasMatch && streamingTrackInfo.url) {
      musicMatches.unshift({
        title: streamingTrackInfo.title,
        artist: streamingTrackInfo.artist || inputArtist || 'Unknown Artist',
        source: streamingTrackInfo.service === 'spotify' ? 'Spotify' : 'iTunes',
        artworkUrl: streamingTrackInfo.artworkUrl,
        externalUrl: streamingTrackInfo.url,
        confidence: 'high',
      });
    }
  }

  // 3. Determine Western Title
  const primaryWesternTitle = determinePrimaryWesternTitle({
    romajiTitle: transliteration.romaji,
    westernGuess: transliteration.westernGuess,
    musicMatches,
  });

  // 4. Anime Soundtrack Search
  const topArtist = inputArtist || musicMatches[0]?.artist;
  const animeInfo = await findAnimeSoundtrackInfo({
    japaneseTitle: inputText,
    romajiTitle: transliteration.romaji,
    westernTitle: primaryWesternTitle,
    artist: topArtist,
  });

  return {
    success: true,
    input: {
      text: inputText,
      artist: inputArtist,
      sourceType,
      ocrConfidence,
      rawOcrText,
      extractedArtist,
      streamingTrackInfo,
    },
    transliteration,
    musicMatches,
    primaryWesternTitle,
    animeInfo: animeInfo || undefined,
    streamingTrackInfo,
  };
}

/**
 * Universal conversion entry point:
 * - On Native Mobile (Capacitor iOS/Android): Runs client-side directly without needing an Express server.
 * - On Web (Browser / Docker): Calls POST /api/convert on the Express server.
 */
export async function convertSongTitle(params: ConvertRequestParams): Promise<ConversionResponse> {
  const isNative = Capacitor.isNativePlatform();
  const isClientOnly = import.meta.env.VITE_CLIENT_ONLY === 'true' || isNative;

  if (isClientOnly) {
    return executeClientSideConversion(params);
  }

  // Web mode: Send request to Express API server
  try {
    const response = await fetch('/api/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data: ConversionResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to convert song title.');
    }

    return data;
  } catch (webErr: any) {
    // If backend server is unreachable on web, attempt client-side fallback
    console.warn('Backend /api/convert unreachable, falling back to in-browser execution:', webErr);
    return executeClientSideConversion(params);
  }
}
