import { MusicMatch } from '../src/types';

// MusicBrainz contact from environment or fallback
const MB_CONTACT = (typeof process !== 'undefined' && process.env?.MUSICBRAINZ_CONTACT) || 'contact@example.com';
const MB_USER_AGENT = `JapTitleConverter/1.0.0 ( ${MB_CONTACT} )`;

// Spotify Token Cache
let spotifyAccessToken: string | null = null;
let spotifyTokenExpiry = 0;

async function getSpotifyToken(): Promise<string | null> {
  const clientId = typeof process !== 'undefined' ? process.env?.SPOTIFY_CLIENT_ID : undefined;
  const clientSecret = typeof process !== 'undefined' ? process.env?.SPOTIFY_CLIENT_SECRET : undefined;

  if (!clientId || !clientSecret) return null;

  if (spotifyAccessToken && Date.now() < spotifyTokenExpiry) {
    return spotifyAccessToken;
  }

  try {
    const authHeader = typeof Buffer !== 'undefined'
      ? Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      : btoa(`${clientId}:${clientSecret}`);
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
      console.warn('Spotify token request failed:', res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    spotifyAccessToken = data.access_token;
    spotifyTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return spotifyAccessToken;
  } catch (err) {
    console.warn('Error fetching Spotify token:', err);
    return null;
  }
}

/**
 * Query Spotify Web API if client credentials are provided
 */
async function searchSpotify(query: string): Promise<MusicMatch[]> {
  const token = await getSpotifyToken();
  if (!token) return [];

  try {
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return [];

    const data = await res.json();
    const items = data.tracks?.items || [];

    return items.map((track: any) => ({
      title: track.name,
      artist: track.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
      album: track.album?.name,
      releaseDate: track.album?.release_date,
      source: 'Spotify' as const,
      artworkUrl: track.album?.images?.[0]?.url,
      previewUrl: track.preview_url,
      externalUrl: track.external_urls?.spotify,
      confidence: 'high' as const,
    }));
  } catch (err) {
    console.warn('Spotify search failed:', err);
    return [];
  }
}

/**
 * Query iTunes Search API (US and JP storefronts)
 * Free, fast, reliable metadata with 30s audio previews and high-res art
 */
async function searchITunes(query: string, country = 'US'): Promise<MusicMatch[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&country=${country}&media=music&entity=song&limit=5`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const data = await res.json();
    const results = data.results || [];

    return results.map((item: any) => {
      // Upscale 100x100 artwork to high-res 600x600 if available
      const artwork = item.artworkUrl100
        ? item.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg')
        : undefined;

      return {
        title: item.trackName || item.collectionName,
        artist: item.artistName || 'Unknown Artist',
        album: item.collectionName,
        releaseDate: item.releaseDate ? item.releaseDate.split('T')[0] : undefined,
        source: 'iTunes' as const,
        artworkUrl: artwork,
        previewUrl: item.previewUrl,
        externalUrl: item.trackViewUrl,
        confidence: country === 'US' ? ('high' as const) : ('medium' as const),
      };
    });
  } catch (err) {
    // Non-blocking, return empty array on timeout or error
    return [];
  }
}

/**
 * Query MusicBrainz API for official recording and release credits
 */
async function searchMusicBrainz(query: string): Promise<MusicMatch[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const url = `https://musicbrainz.org/ws/2/recording?query=${encodeURIComponent(query)}&fmt=json&limit=5`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': MB_USER_AGENT,
        Accept: 'application/json',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const data = await res.json();
    const recordings = data.recordings || [];

    return recordings.map((rec: any) => {
      const artist =
        rec['artist-credit']?.map((ac: any) => ac.name || ac.artist?.name).join(', ') ||
        'Unknown Artist';
      const release = rec.releases?.[0];

      return {
        title: rec.title,
        artist,
        album: release?.title,
        releaseDate: release?.date || rec['first-release-date'],
        source: 'MusicBrainz' as const,
        disambiguation: rec.disambiguation,
        isrc: rec.isrcs?.[0],
        externalUrl: `https://musicbrainz.org/recording/${rec.id}`,
        confidence: 'high' as const,
      };
    });
  } catch (err) {
    // MusicBrainz can be slow or rate-limited; gracefully continue
    return [];
  }
}

/**
 * Searches music databases across multiple queries (Japanese original, Romaji, artist, and loanword guess)
 */
export async function findMusicMetadata(options: {
  japaneseTitle: string;
  romajiTitle: string;
  artist?: string;
  westernGuess?: string;
}): Promise<MusicMatch[]> {
  const { japaneseTitle, romajiTitle, artist, westernGuess } = options;

  // Search queries to test in parallel
  const searchPromises: Promise<MusicMatch[]>[] = [
    // 1. iTunes US store with Japanese text
    searchITunes(japaneseTitle, 'US'),
    // 2. iTunes JP store with Japanese text
    searchITunes(japaneseTitle, 'JP'),
    // 3. iTunes with Romaji text
    searchITunes(romajiTitle, 'US'),
    // 4. MusicBrainz with Japanese text
    searchMusicBrainz(japaneseTitle),
    // 5. Spotify (if configured)
    searchSpotify(japaneseTitle),
  ];

  // If artist is provided, execute combined title + artist queries for maximum precision
  if (artist && artist.trim().length > 0) {
    const trimmedArtist = artist.trim();
    searchPromises.push(searchITunes(`${japaneseTitle} ${trimmedArtist}`, 'US'));
    searchPromises.push(searchITunes(`${japaneseTitle} ${trimmedArtist}`, 'JP'));
    searchPromises.push(searchITunes(`${romajiTitle} ${trimmedArtist}`, 'US'));
    searchPromises.push(searchMusicBrainz(`recording:"${japaneseTitle}" AND artist:"${trimmedArtist}"`));
    searchPromises.push(searchMusicBrainz(`${japaneseTitle} ${trimmedArtist}`));
    searchPromises.push(searchSpotify(`${japaneseTitle} ${trimmedArtist}`));
  }

  // If there's a strong loanword guess (e.g. "Shake na baby" or "Plastic Love"), query that too
  if (westernGuess && westernGuess.toLowerCase() !== romajiTitle.toLowerCase()) {
    searchPromises.push(searchITunes(westernGuess, 'US'));
    if (artist) {
      searchPromises.push(searchITunes(`${westernGuess} ${artist.trim()}`, 'US'));
    }
    searchPromises.push(searchSpotify(westernGuess));
  }

  // Execute all in parallel with individual error protection
  const resultsNested = await Promise.allSettled(searchPromises);

  const allMatches: MusicMatch[] = [];
  for (const result of resultsNested) {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      allMatches.push(...result.value);
    }
  }

  // Deduplicate matches by normalized title + artist
  const seen = new Set<string>();
  const uniqueMatches: MusicMatch[] = [];

  for (const match of allMatches) {
    if (!match.title) continue;
    const key = `${match.title.toLowerCase().trim()}_${match.artist.toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueMatches.push(match);
    }
  }

  // Prioritize matches that match the requested artist if provided
  if (artist && artist.trim().length > 0) {
    const normArtist = artist.toLowerCase().trim();
    uniqueMatches.sort((a, b) => {
      const aMatches = a.artist.toLowerCase().includes(normArtist) ? 1 : 0;
      const bMatches = b.artist.toLowerCase().includes(normArtist) ? 1 : 0;
      return bMatches - aMatches;
    });
  }

  return uniqueMatches;
}

/**
 * Determine the most suitable Western title
 */
export function determinePrimaryWesternTitle(options: {
  romajiTitle: string;
  westernGuess?: string;
  musicMatches: MusicMatch[];
}): string {
  const { romajiTitle, westernGuess, musicMatches } = options;

  // 1. If we have an explicit Katakana loanword match (e.g. "Shake na baby")
  if (westernGuess) {
    return westernGuess;
  }

  // 2. Check if music database returned an official Western title with Latin characters
  for (const match of musicMatches) {
    // Does the title contain primarily Latin characters?
    const isLatin = /^[A-Za-z0-9\s'.,!?:;()\-&]+$/.test(match.title);
    if (isLatin && match.title.length > 1) {
      return match.title;
    }
  }

  // 3. Fallback to Hepburn Romaji formatted title
  return romajiTitle;
}
