import React, { useState } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  Music,
  Disc,
  Calendar,
  ChevronDown,
  ChevronUp,
  Tv,
  Link2,
  Share2,
  Zap,
} from 'lucide-react';
import { ConversionResponse, MusicMatch } from '../types';
import { AudioPlayer } from './AudioPlayer';

interface ResultCardProps {
  data: ConversionResponse;
}

export const ResultCard: React.FC<ResultCardProps> = ({ data }) => {
  const { input, transliteration, musicMatches, primaryWesternTitle, animeInfo } = data;
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [copiedShortcut, setCopiedShortcut] = useState(false);
  const [showPlainRomaji, setShowPlainRomaji] = useState(false);
  const [showAllMatches, setShowAllMatches] = useState(false);

  const topMatch: MusicMatch | undefined = musicMatches[0];
  const displayArtist = topMatch?.artist || input.artist;

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.warn('Copy error:', err);
    }
  };

  const currentRomaji = showPlainRomaji
    ? transliteration.romajiPlain
    : transliteration.romajiHepburn;

  const directShortcutUrl = typeof window !== 'undefined'
    ? (data.streamingTrackInfo?.url
        ? `${window.location.origin}${window.location.pathname}?url=${encodeURIComponent(data.streamingTrackInfo.url)}`
        : `${window.location.origin}${window.location.pathname}?q=${encodeURIComponent(data.transliteration.original)}${displayArtist ? `&artist=${encodeURIComponent(displayArtist)}` : ''}`)
    : '';

  const copyShortcutUrl = async () => {
    if (!directShortcutUrl) return;
    try {
      await navigator.clipboard.writeText(directShortcutUrl);
      setCopiedShortcut(true);
      setTimeout(() => setCopiedShortcut(false), 2500);
    } catch (e) {
      console.warn('Failed to copy shortcut URL:', e);
    }
  };

  const handleShare = async () => {
    const streamingLink = data.streamingTrackInfo?.url || topMatch?.externalUrl || '';
    const shareTitle = `${primaryWesternTitle}${displayArtist ? ` - ${displayArtist}` : ''}`;
    const textLines = [
      `🎵 ${primaryWesternTitle}${displayArtist ? ` by ${displayArtist}` : ''}`,
      `🇯🇵 Original: ${transliteration.original} (${currentRomaji})`,
    ];
    if (animeInfo) {
      textLines.push(`🎬 Anime: ${animeInfo.anime} (${animeInfo.themeName})`);
    }
    if (streamingLink) {
      textLines.push(`🔗 Listen: ${streamingLink}`);
    }
    const shareText = textLines.join('\n');

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: streamingLink || window.location.href,
        });
        setShareStatus('Shared!');
        setTimeout(() => setShareStatus(null), 2500);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
        console.warn('Web Share failed, falling back to clipboard:', err);
      }
    }

    // Fallback: Copy to clipboard if Web Share API is unavailable or rejected
    try {
      const fallbackText = streamingLink ? `${shareText}` : `${shareText}\n${window.location.href}`;
      await navigator.clipboard.writeText(fallbackText);
      setShareStatus('Copied!');
      setTimeout(() => setShareStatus(null), 3000);
    } catch (err) {
      setShareStatus('Copy failed');
      setTimeout(() => setShareStatus(null), 2000);
    }
  };

  return (
    <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Top Title Section */}
      <div className="flex items-start gap-3.5 sm:gap-5">
        {/* Cover Art / Placeholder - Slightly larger for phone readability */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0 shadow-lg">
          {topMatch?.artworkUrl ? (
            <img
              src={topMatch.artworkUrl}
              alt={topMatch.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
              <Disc className="w-10 h-10 text-zinc-500 mb-1" />
              <span className="text-[10px] text-zinc-500">No cover</span>
            </div>
          )}
        </div>

        {/* Western & Original Titles */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Western Title
            </span>
            <div className="flex items-center gap-1.5">
              {/* Web Share Button */}
              <button
                id="share-song-button"
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-800/70 rounded-md transition-colors cursor-pointer"
                title="Share song details to external apps"
              >
                {shareStatus ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-400">
                      {shareStatus}
                    </span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs">Share</span>
                  </>
                )}
              </button>

              {/* Copy Western Title Button */}
              <button
                id="copy-western-title-button"
                type="button"
                onClick={() => handleCopy(primaryWesternTitle, 'western')}
                className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Copy western title"
              >
                {copiedField === 'western' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight break-words mt-0.5">
            {primaryWesternTitle}
          </h2>

          {displayArtist && (
            <div className="flex items-center gap-1.5 text-sm sm:text-base text-zinc-200 font-semibold mt-1 truncate">
              <Music className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">{displayArtist}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {input.sourceType === 'streaming_link' && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50 font-medium">
                <Link2 className="w-3.5 h-3.5" />
                <span>Resolved from {data.streamingTrackInfo?.serviceName || 'Streaming link'}</span>
              </span>
            )}
            {input.sourceType === 'image_ocr' && (
              <span className="text-xs text-zinc-300 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 font-medium">
                Extracted via Screenshot OCR
              </span>
            )}
            {input.extractedArtist && (
              <span className="text-xs text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50 font-medium">
                OCR Artist: {input.extractedArtist}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Anime Soundtrack Card (if track is used in an anime) */}
      {animeInfo && (
        <div
          id="anime-soundtrack-info-card"
          className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-zinc-950 rounded-xl border border-emerald-800/50 space-y-1.5 shadow-md"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400">
                <Tv className="w-4 h-4" />
              </span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wide">
                Anime Soundtrack
              </span>
            </div>

            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                animeInfo.themeType === 'Opening'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : animeInfo.themeType === 'Ending'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {animeInfo.themeName}
            </span>
          </div>

          <div className="flex items-start justify-between gap-2 pt-1">
            <div className="space-y-1.5 min-w-0 flex-1">
              {/* Anime Title: Western Title & Japanese/Romaji */}
              <div>
                {animeInfo.animeWesternTitle ? (
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase block">
                      Western Title
                    </span>
                    <p className="text-base sm:text-lg font-black text-white leading-snug break-words">
                      {animeInfo.animeWesternTitle}
                    </p>
                    {animeInfo.animeWesternTitle.toLowerCase().trim() !== animeInfo.anime.toLowerCase().trim() && (
                      <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
                        <span className="text-zinc-500">Romaji / Orig.: </span>
                        {animeInfo.anime}
                        {animeInfo.animeJapaneseTitle && (
                          <span className="text-zinc-500 ml-1.5 font-normal">({animeInfo.animeJapaneseTitle})</span>
                        )}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-base sm:text-lg font-black text-white leading-snug break-words">
                    {animeInfo.anime}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300 flex-wrap">
                <span className="font-semibold text-emerald-400">
                  {animeInfo.themeType === 'Opening'
                    ? 'Opening Theme (OP)'
                    : animeInfo.themeType === 'Ending'
                    ? 'Ending Theme (ED)'
                    : 'Theme / Insert Song'}
                </span>
                {animeInfo.year && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span>
                      {animeInfo.season ? `${animeInfo.season} ` : ''}
                      {animeInfo.year}
                    </span>
                  </>
                )}
                {animeInfo.source && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400">{animeInfo.source}</span>
                  </>
                )}
              </div>

              {/* Database & Streaming Links: MyAnimeList & Crunchyroll */}
              {(animeInfo.myAnimeListUrl || animeInfo.crunchyrollUrl) && (
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {animeInfo.myAnimeListUrl && (
                    <a
                      id="anime-myanimelist-link"
                      href={animeInfo.myAnimeListUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#2e51a2]/25 hover:bg-[#2e51a2]/40 text-[#8cb0f7] border border-[#2e51a2]/50 hover:border-[#2e51a2] transition-colors shadow-sm"
                      title="Open on MyAnimeList"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#8cb0f7]" />
                      <span>MyAnimeList</span>
                    </a>
                  )}

                  {animeInfo.crunchyrollUrl && (
                    <a
                      id="anime-crunchyroll-link"
                      href={animeInfo.crunchyrollUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#f47521]/20 hover:bg-[#f47521]/35 text-[#ff9e5e] border border-[#f47521]/50 hover:border-[#f47521] transition-colors shadow-sm"
                      title="Watch or search on Crunchyroll"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#ff9e5e]" />
                      <span>Crunchyroll</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            <button
              id="copy-anime-soundtrack-button"
              type="button"
              onClick={() =>
                handleCopy(
                  `${animeInfo.animeWesternTitle || animeInfo.anime} - ${animeInfo.themeName}`,
                  'anime'
                )
              }
              className="p-2 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              title="Copy Anime Soundtrack Info"
            >
              {copiedField === 'anime' ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Dual Box: Japanese Original & Romaji */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Japanese */}
        <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <span className="text-xs text-zinc-400 font-medium block mb-0.5">
              Original Japanese
            </span>
            <span className="text-lg sm:text-xl font-bold text-white font-sans break-words">
              {transliteration.original}
            </span>
          </div>
          <button
            id="copy-original-japanese-button"
            type="button"
            onClick={() => handleCopy(transliteration.original, 'original')}
            className="p-2 text-zinc-400 hover:text-zinc-200 rounded-md transition-colors cursor-pointer shrink-0"
            title="Copy Japanese"
          >
            {copiedField === 'original' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Romaji */}
        <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs text-zinc-400 font-medium">Romaji</span>
              <button
                type="button"
                onClick={() => setShowPlainRomaji(!showPlainRomaji)}
                className="text-xs text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
              >
                {showPlainRomaji ? 'macrons (ō)' : 'plain ASCII'}
              </button>
            </div>
            <span className="text-base sm:text-lg font-bold text-emerald-300 font-mono break-words">
              {currentRomaji}
            </span>
          </div>
          <button
            id="copy-romaji-button"
            type="button"
            onClick={() => handleCopy(currentRomaji, 'romaji')}
            className="p-2 text-zinc-400 hover:text-zinc-200 rounded-md transition-colors cursor-pointer shrink-0"
            title="Copy Romaji"
          >
            {copiedField === 'romaji' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Audio Player if available */}
      {topMatch?.previewUrl && (
        <AudioPlayer
          previewUrl={topMatch.previewUrl}
          trackTitle={topMatch.title}
          artist={topMatch.artist}
        />
      )}

      {/* Syllabary breakdown pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
          <span className="text-xs text-zinc-400 block mb-0.5">Hiragana</span>
          <span className="font-semibold text-sm text-zinc-200 truncate block">
            {transliteration.hiragana || '—'}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
          <span className="text-xs text-zinc-400 block mb-0.5">Katakana</span>
          <span className="font-semibold text-sm text-zinc-200 truncate block">
            {transliteration.katakana || '—'}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
          <span className="text-xs text-zinc-400 block mb-0.5">Release</span>
          <span className="font-semibold text-sm text-zinc-300 truncate block">
            {topMatch?.releaseDate || '—'}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
          <span className="text-xs text-zinc-400 block mb-0.5">Database</span>
          <span className="font-semibold text-sm text-zinc-200 truncate block">
            {topMatch?.source || 'MusicBrainz'}
          </span>
        </div>
      </div>

      {/* iOS Shortcut & Direct Query URL */}
      {directShortcutUrl && (
        <div className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800/80 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-200">
                  Shortcut URL
                </span>
                <span className="text-xs text-zinc-500 font-mono hidden sm:inline truncate max-w-[260px]">
                  {directShortcutUrl}
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate">
                Direct query URL for iOS Shortcuts & automations
              </p>
            </div>
          </div>
          <button
            id="copy-shortcut-url-button"
            type="button"
            onClick={copyShortcutUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/60 rounded-md transition-colors shrink-0 cursor-pointer"
            title="Copy URL for iOS Shortcuts"
          >
            {copiedShortcut ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5" />
                <span>Copy URL</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Link to external database */}
      {topMatch?.externalUrl && (
        <div className="flex justify-end pt-1">
          <a
            href={topMatch.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
          >
            <span>View on {topMatch.source}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Additional matches if any */}
      {musicMatches.length > 1 && (
        <div className="border-t border-zinc-800/80 pt-3">
          <button
            type="button"
            onClick={() => setShowAllMatches(!showAllMatches)}
            className="w-full flex items-center justify-between text-xs text-zinc-400 hover:text-zinc-200 py-1 transition-colors cursor-pointer"
          >
            <span>Other releases / tracks ({musicMatches.length - 1})</span>
            {showAllMatches ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showAllMatches && (
            <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
              {musicMatches.slice(1).map((match, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800/60 text-xs"
                >
                  <div className="truncate pr-2">
                    <p className="font-medium text-zinc-200 truncate">{match.title}</p>
                    <p className="text-zinc-500 text-[10px] truncate">
                      {match.artist} {match.album ? `• ${match.album}` : ''}
                    </p>
                  </div>
                  {match.externalUrl && (
                    <a
                      href={match.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-zinc-400 hover:text-emerald-400 shrink-0"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
