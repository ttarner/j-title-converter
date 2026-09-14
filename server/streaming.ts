export interface StreamingTrackInfo {
  service: 'spotify' | 'apple_music' | 'youtube' | 'shazam';
  serviceName: 'Spotify' | 'Apple Music' | 'YouTube Music' | 'Shazam';
  title: string;
  artist?: string;
  artworkUrl?: string;
  url: string;
}

/**
 * Detects if a string is a streaming track URL
 */
export function isStreamingUrl(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  const trimmed = input.trim();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('spotify:track:')
  );
}

/**
 * Cleans YouTube video titles from MV tags and extracts clean title and artist candidate
 */
function parseYouTubeTitle(rawTitle: string, authorName?: string): { title: string; artist?: string } {
  // Remove common YouTube music video clutter
  let cleaned = rawTitle
    .replace(/【[^】]*】/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\([^\)]*(?:Official|MV|Music Video|Audio|Lyric|Video|Remix|Ver\.|Theme)[^\)]*\)/gi, ' ')
    .replace(/\b(Official\s+Music\s+Video|Official\s+Audio|Official\s+Video|Lyric\s+Video|MUSIC\s+VIDEO|MV)\b/gi, ' ')
    .trim();

  let artist = authorName?.replace(/- Topic$/i, '')?.replace(/Official/i, '')?.trim();
  let title = cleaned;

  // Check for Japanese quotes 「...」 or 『...』
  const quoteMatch = cleaned.match(/「([^」]+)」/) || cleaned.match(/『([^』]+)』/);
  if (quoteMatch) {
    title = quoteMatch[1].trim();
    // Everything before the quote might be the artist
    const beforeQuote = cleaned.split(quoteMatch[0])[0].trim();
    if (beforeQuote && beforeQuote.length < 30) {
      const candidateArtist = beforeQuote.replace(/[-/／]/g, '').trim();
      if (candidateArtist) {
        artist = candidateArtist;
      }
    }
    return { title, artist };
  }

  // Check for common delimiter "Artist - Title" or "Title / Artist"
  if (cleaned.includes(' - ')) {
    const parts = cleaned.split(' - ');
    if (parts.length >= 2) {
      artist = parts[0].trim();
      title = parts.slice(1).join(' - ').trim();
      return { title, artist };
    }
  } else if (cleaned.includes(' / ')) {
    const parts = cleaned.split(' / ');
    if (parts.length >= 2) {
      title = parts[0].trim();
      artist = parts[1].trim();
      return { title, artist };
    }
  }

  // Fallback
  return { title: title || rawTitle, artist };
}

/**
 * Resolves a streaming link from Spotify, Apple Music, or YouTube Music
 */
export async function resolveStreamingLink(urlStr: string): Promise<StreamingTrackInfo | null> {
  const url = urlStr.trim();

  try {
    // 1. Spotify
    if (url.includes('spotify.com') || url.startsWith('spotify:track:')) {
      let canonicalUrl = url;
      if (url.startsWith('spotify:track:')) {
        const id = url.replace('spotify:track:', '');
        canonicalUrl = `https://open.spotify.com/track/${id}`;
      }

      // Remove locale paths like /intl-ja/
      canonicalUrl = canonicalUrl.replace(/open\.spotify\.com\/[a-z]{2,4}-[a-z]{2,4}\//i, 'open.spotify.com/');

      const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(canonicalUrl)}`;
      const resp = await fetch(oembedUrl, {
        headers: typeof window === 'undefined' ? { 'User-Agent': 'Mozilla/5.0 (compatible; JTitleRomanizer/1.0)' } : undefined,
      });

      if (resp.ok) {
        const data: any = await resp.json();
        return {
          service: 'spotify',
          serviceName: 'Spotify',
          title: data.title || '',
          artist: data.author_name || undefined,
          artworkUrl: data.thumbnail_url || undefined,
          url: canonicalUrl,
        };
      }
    }

    // 2. Apple Music / iTunes
    if (url.includes('music.apple.com') || url.includes('itunes.apple.com')) {
      // Look for track ID (e.g. ?i=1598765432 or /song/.../1598765432)
      let trackId: string | null = null;
      try {
        const parsed = new URL(url);
        trackId = parsed.searchParams.get('i');
        if (!trackId) {
          const match = parsed.pathname.match(/\/(?:song|album)\/[^/]+\/(\d+)/);
          if (match) trackId = match[1];
        }
      } catch (e) {
        // parse failure
      }

      if (trackId) {
        // Query iTunes API (country=jp to get original Japanese metadata when available)
        const itunesResp = await fetch(
          `https://itunes.apple.com/lookup?id=${trackId}&country=jp&entity=song`,
          { headers: typeof window === 'undefined' ? { 'User-Agent': 'Mozilla/5.0 (compatible; JTitleRomanizer/1.0)' } : undefined }
        );

        if (itunesResp.ok) {
          const itunesData: any = await itunesResp.json();
          if (itunesData.results && itunesData.results.length > 0) {
            const track = itunesData.results[0];
            return {
              service: 'apple_music',
              serviceName: 'Apple Music',
              title: track.trackName || track.collectionName || '',
              artist: track.artistName || undefined,
              artworkUrl: track.artworkUrl100
                ? track.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg')
                : undefined,
              url,
            };
          }
        }
      }

      // Fallback: oEmbed for Apple Music
      const appleOembedUrl = `https://music.apple.com/api/oembed?url=${encodeURIComponent(url)}`;
      const oembedResp = await fetch(appleOembedUrl);
      if (oembedResp.ok) {
        const odata: any = await oembedResp.json();
        return {
          service: 'apple_music',
          serviceName: 'Apple Music',
          title: odata.title || '',
          artist: odata.author_name || undefined,
          artworkUrl: odata.thumbnail_url || undefined,
          url,
        };
      }
    }

    // 3. YouTube Music / YouTube
    if (
      url.includes('youtube.com') ||
      url.includes('youtu.be') ||
      url.includes('music.youtube.com')
    ) {
      let cleanUrl = url;
      if (url.includes('music.youtube.com')) {
        // YouTube oEmbed supports standard youtube.com URLs
        cleanUrl = url.replace('music.youtube.com', 'www.youtube.com');
      }

      const ytOembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`;
      const ytResp = await fetch(ytOembedUrl, {
        headers: typeof window === 'undefined' ? { 'User-Agent': 'Mozilla/5.0 (compatible; JTitleRomanizer/1.0)' } : undefined,
      });

      if (ytResp.ok) {
        const ytData: any = await ytResp.json();
        const parsed = parseYouTubeTitle(ytData.title || '', ytData.author_name);
        return {
          service: 'youtube',
          serviceName: 'YouTube Music',
          title: parsed.title,
          artist: parsed.artist,
          artworkUrl: ytData.thumbnail_url || undefined,
          url,
        };
      }
    }

    // 4. Shazam
    if (url.includes('shazam.com') || url.includes('shz.am')) {
      let trackId: string | null = null;
      let slug: string | null = null;

      try {
        const parsed = new URL(url);
        // Matches e.g. /song/1694666925/deep-down, /track/593845878/残響散歌, /song/1694666925, /track/593845878
        const match = parsed.pathname.match(/(?:^|\/)(?:song|track)\/(\d+)(?:\/([^/?#]+))?/i);
        if (match) {
          trackId = match[1];
          if (match[2]) {
            try {
              slug = decodeURIComponent(match[2]);
            } catch {
              slug = match[2];
            }
          }
        }
      } catch {
        const match = url.match(/(?:song|track)\/(\d+)(?:\/([^/?#\s]+))?/i);
        if (match) {
          trackId = match[1];
          if (match[2]) {
            try {
              slug = decodeURIComponent(match[2]);
            } catch {
              slug = match[2];
            }
          }
        }
      }

      // Step 1: If trackId exists, query iTunes lookup API (since modern Shazam IDs match Apple Music / iTunes song IDs)
      if (trackId) {
        try {
          const itunesResp = await fetch(
            `https://itunes.apple.com/lookup?id=${trackId}&country=jp&entity=song`,
            { headers: typeof window === 'undefined' ? { 'User-Agent': 'Mozilla/5.0 (compatible; JTitleRomanizer/1.0)' } : undefined }
          );

          if (itunesResp.ok) {
            const itunesData: any = await itunesResp.json();
            if (itunesData.results && itunesData.results.length > 0) {
              const track = itunesData.results[0];
              return {
                service: 'shazam',
                serviceName: 'Shazam',
                title: track.trackName || track.collectionName || '',
                artist: track.artistName || undefined,
                artworkUrl: track.artworkUrl100
                  ? track.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg')
                  : undefined,
                url,
              };
            }
          }
        } catch (err) {
          console.warn('Shazam iTunes lookup error:', err);
        }
      }

      // Step 2: If ID lookup didn't match (e.g. legacy Shazam internal ID) but we have a slug, search iTunes
      if (slug) {
        const cleanedSlug = slug.replace(/[-_]+/g, ' ').trim();
        if (cleanedSlug) {
          try {
            const itunesSearchResp = await fetch(
              `https://itunes.apple.com/search?term=${encodeURIComponent(cleanedSlug)}&country=jp&entity=song&limit=1`,
              { headers: typeof window === 'undefined' ? { 'User-Agent': 'Mozilla/5.0 (compatible; JTitleRomanizer/1.0)' } : undefined }
            );

            if (itunesSearchResp.ok) {
              const itunesSearchData: any = await itunesSearchResp.json();
              if (itunesSearchData.results && itunesSearchData.results.length > 0) {
                const track = itunesSearchData.results[0];
                return {
                  service: 'shazam',
                  serviceName: 'Shazam',
                  title: track.trackName || cleanedSlug,
                  artist: track.artistName || undefined,
                  artworkUrl: track.artworkUrl100
                    ? track.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg')
                    : undefined,
                  url,
                };
              }
            }
          } catch (err) {
            console.warn('Shazam iTunes search error:', err);
          }

          // Fallback: return cleaned slug as title candidate
          return {
            service: 'shazam',
            serviceName: 'Shazam',
            title: cleanedSlug,
            url,
          };
        }
      }
    }
  } catch (error) {
    console.error('Failed to resolve streaming link:', error);
  }

  return null;
}
