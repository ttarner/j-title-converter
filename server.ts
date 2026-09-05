import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { transliterateJapanese } from './server/converter';
import { processImageOcr } from './server/ocr';
import { findMusicMetadata, determinePrimaryWesternTitle } from './server/music';
import { findAnimeSoundtrackInfo } from './server/anime';
import { isStreamingUrl, resolveStreamingLink, StreamingTrackInfo } from './server/streaming';
import { ConversionResponse } from './src/types';

// Load environment variables
dotenv.config();

const PRESET_EXAMPLES = [
  {
    title: 'シャケナベイベー',
    artist: 'AKASAKI / 内田裕也 feat. 指原莉乃',
    genre: 'Rock / J-Pop',
    note: 'Katakana loanword example: "Shake na baby"',
  },
  {
    title: '残響散歌',
    artist: 'Aimer',
    genre: 'Anime OST (Demon Slayer)',
    note: 'Kanji: Zankyousanka',
  },
  {
    title: '紅蓮華',
    artist: 'LiSA',
    genre: 'Anime OST',
    note: 'Kanji: Gurenge',
  },
  {
    title: '夜に駆ける',
    artist: 'YOASOBI',
    genre: 'J-Pop',
    note: 'Kanji + Kana: Yoru ni Kakeru / Into the Night',
  },
  {
    title: 'プラスティック・ラブ',
    artist: '竹内まりや (Mariya Takeuchi)',
    genre: 'City Pop',
    note: 'Katakana Loanword: Plastic Love',
  },
  {
    title: '丸ノ内サディスティック',
    artist: '椎名林檎 (Sheena Ringo)',
    genre: 'J-Rock / Jazz',
    note: 'Kanji & Katakana: Marunouchi Sadistic',
  },
];

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON payload parser with capacity for image uploads (screenshots)
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      ocrEngine: 'Tesseract.js (OCR)',
      transliteration: 'Kuroshiro / WanaKana',
      musicDatabases: ['MusicBrainz', 'iTunes Store', 'Spotify (optional)'],
    });
  });

  // Presets endpoint for quick testing
  app.get('/api/presets', (req, res) => {
    res.json({ presets: PRESET_EXAMPLES });
  });

  // Dedicated OCR endpoint
  app.post('/api/ocr', async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'No image provided in base64 format' });
      }

      const ocrResult = await processImageOcr(imageBase64);
      return res.json({
        success: true,
        extractedText: ocrResult.text,
        extractedArtist: ocrResult.artist,
        rawText: ocrResult.rawText,
        confidence: ocrResult.confidence,
        lines: ocrResult.lines,
      });
    } catch (err: any) {
      console.error('OCR Endpoint error:', err);
      return res.status(500).json({ error: 'Error during OCR processing: ' + (err.message || err) });
    }
  });

  // Core Conversion Endpoint: Streaming link, Text or Image -> Romaji + Western Title Search
  app.post('/api/convert', async (req, res) => {
    try {
      const { text, artist, imageBase64, streamingUrl } = req.body;

      let inputText = (text || '').trim();
      let inputArtist = (artist || '').trim() || undefined;
      let extractedArtist: string | undefined = undefined;
      let sourceType: 'text' | 'image_ocr' | 'streaming_link' = 'text';
      let ocrConfidence: number | undefined;
      let rawOcrText: string | undefined;
      let streamingTrackInfo: StreamingTrackInfo | undefined = undefined;

      // Check if input is a streaming URL (either passed explicitly or typed in search bar)
      const potentialUrl = (streamingUrl || (isStreamingUrl(inputText) ? inputText : '')).trim();

      if (potentialUrl) {
        sourceType = 'streaming_link';
        console.log(`Resolving streaming track link: "${potentialUrl}"...`);
        const resolved = await resolveStreamingLink(potentialUrl);

        if (!resolved || !resolved.title) {
          return res.status(422).json({
            success: false,
            error: 'Could not retrieve song details from the provided streaming link. Please check that the track URL is valid and publicly accessible on Spotify, Apple Music, or YouTube.',
          });
        }

        streamingTrackInfo = resolved;
        inputText = resolved.title;
        if (!inputArtist && resolved.artist) {
          inputArtist = resolved.artist;
        }
      } else if (imageBase64 && !inputText) {
        // If image is provided and no direct text is specified, run OCR
        sourceType = 'image_ocr';
        console.log('Running OCR on uploaded image...');
        const ocrResult = await processImageOcr(imageBase64);
        inputText = ocrResult.text;
        extractedArtist = ocrResult.artist;
        if (!inputArtist && ocrResult.artist) {
          inputArtist = ocrResult.artist;
        }
        ocrConfidence = ocrResult.confidence;
        rawOcrText = ocrResult.rawText;

        if (!inputText) {
          return res.status(422).json({
            success: false,
            error: 'No recognizable Japanese text found in the image. Please try a clearer screenshot or enter the text manually.',
            input: { text: '', artist: inputArtist, sourceType, ocrConfidence, rawOcrText, extractedArtist },
          });
        }
      }

      if (!inputText) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a streaming link, Japanese title, or upload a screenshot.',
        });
      }

      console.log(`Processing conversion for: "${inputText}" by "${inputArtist || 'N/A'}" (source: ${sourceType})`);

      // 1. Transliteration via Kuroshiro / WanaKana
      const transliteration = await transliterateJapanese(inputText);

      // 2. Query Public Music Databases (MusicBrainz, iTunes, Spotify) with artist support
      const musicMatches = await findMusicMetadata({
        japaneseTitle: inputText,
        romajiTitle: transliteration.romaji,
        artist: inputArtist,
        westernGuess: transliteration.westernGuess,
      });

      // If streaming link provided artwork or metadata, integrate it into matches if needed
      if (streamingTrackInfo) {
        const alreadyHasMatch = musicMatches.some(
          (m) => m.externalUrl === streamingTrackInfo?.url
        );
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

      // 3. Determine the best Western Title
      const primaryWesternTitle = determinePrimaryWesternTitle({
        romajiTitle: transliteration.romaji,
        westernGuess: transliteration.westernGuess,
        musicMatches,
      });

      // 4. Lookup Anime Soundtrack information (Opening / Ending / Theme)
      const topArtist = inputArtist || musicMatches[0]?.artist;
      const animeInfo = await findAnimeSoundtrackInfo({
        japaneseTitle: inputText,
        romajiTitle: transliteration.romaji,
        westernTitle: primaryWesternTitle,
        artist: topArtist,
      });

      const responsePayload: ConversionResponse = {
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

      return res.json(responsePayload);
    } catch (err: any) {
      console.error('API /api/convert error:', err);
      return res.status(500).json({
        success: false,
        error: 'Conversion error: ' + (err.message || err),
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`J-Title Converter full-stack server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
