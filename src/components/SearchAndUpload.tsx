import React, { useState, useRef, useEffect } from 'react';
import {
  Link2,
  Search,
  UploadCloud,
  Image as ImageIcon,
  X,
  ArrowRight,
  Loader2,
  Type,
  Check,
  User,
  Music2,
  ExternalLink,
  Sparkles,
  Zap,
} from 'lucide-react';
import * as wanakana from 'wanakana';

interface SearchAndUploadProps {
  onConvert: (params: {
    text?: string;
    artist?: string;
    imageBase64?: string;
    streamingUrl?: string;
  }) => Promise<void>;
  isLoading: boolean;
  statusMessage?: string;
  externalText?: string;
  externalArtist?: string;
  externalUrl?: string;
}

const SAMPLE_LINKS = [
  {
    name: 'Spotify: Aimer',
    service: 'spotify',
    url: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
    note: '残響散歌 (Demon Slayer OP)',
  },
  {
    name: 'Apple Music: AKASAKI',
    service: 'apple_music',
    url: 'https://music.apple.com/jp/album/shake-na-baby/1769661445?i=1769661446',
    note: 'シャケナベイベー',
  },
  {
    name: 'YouTube: LiSA',
    service: 'youtube',
    url: 'https://www.youtube.com/watch?v=CwkzK-F0Y00',
    note: '紅蓮華 (Demon Slayer OP1)',
  },
];

export const SearchAndUpload: React.FC<SearchAndUploadProps> = ({
  onConvert,
  isLoading,
  statusMessage,
  externalText,
  externalArtist,
  externalUrl,
}) => {
  // Streaming Link is the PRIMARY input mode as requested
  const [activeTab, setActiveTab] = useState<'link' | 'text' | 'image'>('link');
  const [streamingUrl, setStreamingUrl] = useState('');
  const [inputText, setInputText] = useState('');
  const [inputArtist, setInputArtist] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pastedFeedback, setPastedFeedback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (externalUrl !== undefined && externalUrl !== '') {
      setStreamingUrl(externalUrl);
      setActiveTab('link');
    }
  }, [externalUrl]);

  useEffect(() => {
    if (externalText !== undefined && externalText !== '') {
      setInputText(externalText);
      setActiveTab('text');
    }
  }, [externalText]);

  useEffect(() => {
    if (externalArtist !== undefined) {
      setInputArtist(externalArtist);
    }
  }, [externalArtist]);

  // Real-time detection of streaming service
  const detectedService = React.useMemo(() => {
    const trimmed = streamingUrl.trim().toLowerCase();
    if (!trimmed) return null;
    if (trimmed.includes('spotify.com') || trimmed.startsWith('spotify:')) {
      return { name: 'Spotify', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60' };
    }
    if (trimmed.includes('music.apple.com') || trimmed.includes('itunes.apple.com')) {
      return { name: 'Apple Music', color: 'text-rose-400 bg-rose-950/60 border-rose-800/60' };
    }
    if (
      trimmed.includes('youtube.com') ||
      trimmed.includes('youtu.be') ||
      trimmed.includes('music.youtube.com')
    ) {
      return { name: 'YouTube Music', color: 'text-red-400 bg-red-950/60 border-red-800/60' };
    }
    return null;
  }, [streamingUrl]);

  // Detected Japanese scripts
  const scriptTags = React.useMemo(() => {
    if (!inputText) return [];
    let hasKanji = false;
    let hasHiragana = false;
    let hasKatakana = false;

    for (const char of inputText) {
      if (wanakana.isKanji(char)) hasKanji = true;
      else if (wanakana.isHiragana(char)) hasHiragana = true;
      else if (wanakana.isKatakana(char)) hasKatakana = true;
    }

    const tags: string[] = [];
    if (hasKatakana) tags.push('Katakana');
    if (hasHiragana) tags.push('Hiragana');
    if (hasKanji) tags.push('Kanji');
    return tags;
  }, [inputText]);

  const handleLinkSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!streamingUrl.trim() || isLoading) return;
    onConvert({ streamingUrl: streamingUrl.trim() });
  };

  const handleTextSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onConvert({
      text: inputText.trim(),
      artist: inputArtist.trim() || undefined,
    });
  };

  const handleImageSubmit = () => {
    if (!imagePreview || isLoading) return;
    onConvert({
      imageBase64: imagePreview,
      artist: inputArtist.trim() || undefined,
    });
  };

  const handlePasteLink = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setStreamingUrl(clipText);
        setPastedFeedback(true);
        setTimeout(() => setPastedFeedback(false), 2000);
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  const handlePasteText = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setInputText(clipText);
        setPastedFeedback(true);
        setTimeout(() => setPastedFeedback(false), 2000);
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSampleImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 340;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, 600, 340);

    ctx.fillStyle = '#064e3b';
    ctx.fillRect(30, 50, 220, 220);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('シャケナベイベー', 280, 140);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '20px sans-serif';
    ctx.fillText('AKASAKI', 280, 180);

    const dataUrl = canvas.toDataURL('image/png');
    setImagePreview(dataUrl);
    setInputArtist('AKASAKI');
    setActiveTab('image');
  };

  const handlePickSampleLink = (url: string) => {
    setStreamingUrl(url);
    onConvert({ streamingUrl: url });
  };

  return (
    <div className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 sm:p-5 shadow-xl">
      {/* Input Mode Selector: Primary Streaming Link + Alternatives */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800/90 w-full">
          {/* PRIMARY: Streaming Link */}
          <button
            id="tab-streaming-link"
            type="button"
            onClick={() => setActiveTab('link')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer relative ${
              activeTab === 'link'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Link2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Streaming Link</span>
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 ml-0.5">
              Main
            </span>
          </button>

          {/* ALTERNATIVE: Text Input */}
          <button
            id="tab-text-input"
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Type className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">Text Input</span>
          </button>

          {/* ALTERNATIVE: Screenshot OCR */}
          <button
            id="tab-image-ocr"
            type="button"
            onClick={() => setActiveTab('image')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'image'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">Screenshot</span>
          </button>
        </div>
      </div>

      {/* MODE 1: STREAMING LINK (PRIMARY) */}
      {activeTab === 'link' && (
        <form onSubmit={handleLinkSubmit} className="space-y-3">
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-zinc-500 pointer-events-none">
              <Link2 className="w-4 h-4" />
            </div>

            <input
              id="streaming-url-input"
              type="url"
              value={streamingUrl}
              onChange={(e) => setStreamingUrl(e.target.value)}
              placeholder="Paste Spotify, Apple Music, or YouTube link..."
              disabled={isLoading}
              className="w-full pl-10 pr-24 py-3 bg-zinc-950 text-white placeholder-zinc-500 text-xs sm:text-sm rounded-xl border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
            />

            <div className="absolute right-2 flex items-center gap-1">
              {streamingUrl ? (
                <button
                  type="button"
                  id="clear-streaming-url-button"
                  onClick={() => setStreamingUrl('')}
                  className="p-1 text-zinc-400 hover:text-white rounded-md transition-colors cursor-pointer"
                  title="Clear URL"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  id="paste-streaming-url-button"
                  onClick={handlePasteLink}
                  className="px-2 py-1 text-[11px] font-medium text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-md border border-zinc-700 transition-colors cursor-pointer"
                >
                  {pastedFeedback ? <Check className="w-3 h-3 text-emerald-400" /> : 'Paste'}
                </button>
              )}

              <button
                type="submit"
                id="submit-streaming-url-button"
                disabled={!streamingUrl.trim() || isLoading}
                className="flex items-center justify-center p-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 text-black rounded-lg transition-all cursor-pointer shrink-0"
                title="Convert track link"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                )}
              </button>
            </div>
          </div>

          {/* Service badge & Quick samples */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              {detectedService ? (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${detectedService.color}`}
                >
                  <Music2 className="w-3 h-3" />
                  <span>Detected: {detectedService.name}</span>
                </span>
              ) : (
                <span className="text-[11px] text-zinc-500">
                  Supports Spotify, Apple Music & YouTube Music track links
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
              <span className="text-[10px] text-zinc-500 shrink-0">Sample:</span>
              {SAMPLE_LINKS.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handlePickSampleLink(sample.url)}
                  className="text-[10px] font-medium text-zinc-400 hover:text-white bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 hover:border-zinc-700 transition-colors shrink-0 cursor-pointer disabled:opacity-40"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>
        </form>
      )}

      {/* MODE 2: JAPANESE TEXT INPUT (ALTERNATIVE) */}
      {activeTab === 'text' && (
        <form onSubmit={handleTextSubmit} className="space-y-2.5">
          {/* Song Title Input */}
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-zinc-500 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>

            <input
              id="japanese-text-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Japanese song title (e.g. 残響散歌, シャケナベイベー)..."
              disabled={isLoading}
              className="w-full pl-10 pr-20 py-2.5 bg-zinc-950 text-white placeholder-zinc-500 text-xs sm:text-sm rounded-xl border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
            />

            <div className="absolute right-2 flex items-center gap-1">
              {inputText ? (
                <button
                  type="button"
                  id="clear-input-text-button"
                  onClick={() => setInputText('')}
                  className="p-1 text-zinc-400 hover:text-white rounded-md transition-colors cursor-pointer"
                  title="Clear text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  id="paste-clipboard-button"
                  onClick={handlePasteText}
                  className="px-2 py-1 text-[11px] font-medium text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-md border border-zinc-700 transition-colors cursor-pointer"
                >
                  {pastedFeedback ? <Check className="w-3 h-3 text-emerald-400" /> : 'Paste'}
                </button>
              )}
            </div>
          </div>

          {/* Artist / Band Input (Optional) */}
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-zinc-500 pointer-events-none">
              <User className="w-4 h-4" />
            </div>

            <input
              id="artist-band-input"
              type="text"
              value={inputArtist}
              onChange={(e) => setInputArtist(e.target.value)}
              placeholder="Artist or band (e.g. Aimer, AKASAKI, LiSA, YOASOBI)..."
              disabled={isLoading}
              className="w-full pl-10 pr-10 py-2 bg-zinc-950 text-white placeholder-zinc-500 text-xs sm:text-sm rounded-xl border border-zinc-800 focus:border-emerald-500 focus:outline-none transition-all"
            />

            {inputArtist && (
              <div className="absolute right-2.5 flex items-center">
                <button
                  type="button"
                  id="clear-artist-button"
                  onClick={() => setInputArtist('')}
                  className="p-1 text-zinc-400 hover:text-white rounded-md transition-colors cursor-pointer"
                  title="Clear artist"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Script tags & Submit Action */}
          <div className="flex items-center justify-between pt-1 gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {scriptTags.length > 0 && (
                <>
                  <span className="text-[10px] text-zinc-500">Detected:</span>
                  {scriptTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                    >
                      {tag}
                    </span>
                  ))}
                </>
              )}
            </div>

            <button
              type="submit"
              id="submit-convert-text-button"
              disabled={!inputText.trim() || isLoading}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 text-black font-semibold text-xs rounded-xl transition-all cursor-pointer shrink-0"
              title="Convert & Search"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>Find Song & Anime OST</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* MODE 3: SCREENSHOT OCR (ALTERNATIVE) */}
      {activeTab === 'image' && (
        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                processFile(e.target.files[0]);
              }
            }}
            accept="image/*"
            className="hidden"
          />

          {!imagePreview ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-950/20'
                  : 'border-zinc-800 hover:border-zinc-600 bg-zinc-950'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 border border-zinc-800">
                  <UploadCloud className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-200">
                    Upload music screenshot (Spotify, Apple Music, YouTube)
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Automatically scans both track title and artist name
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadSampleImage();
                  }}
                  className="mt-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 transition-colors"
                >
                  Try sample screenshot
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 max-h-56 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Uploaded screenshot"
                  className="max-h-56 w-auto object-contain rounded-lg"
                />
                <button
                  id="remove-uploaded-image-button"
                  type="button"
                  onClick={() => setImagePreview(null)}
                  disabled={isLoading}
                  className="absolute top-2 right-2 p-1 bg-black/80 hover:bg-black text-zinc-300 hover:text-white rounded-full border border-zinc-700 transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Optional Artist Override / Guidance */}
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-zinc-500 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="ocr-artist-input"
                  type="text"
                  value={inputArtist}
                  onChange={(e) => setInputArtist(e.target.value)}
                  placeholder="Artist / Band (optional - or extracted from image)"
                  disabled={isLoading}
                  className="w-full pl-10 pr-10 py-2 bg-zinc-950 text-white placeholder-zinc-500 text-xs rounded-xl border border-zinc-800 focus:border-emerald-500 focus:outline-none transition-all"
                />
                {inputArtist && (
                  <button
                    type="button"
                    onClick={() => setInputArtist('')}
                    className="absolute right-2.5 p-1 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="flex-1 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
                >
                  Change Image
                </button>
                <button
                  id="submit-convert-image-button"
                  type="button"
                  onClick={handleImageSubmit}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-xs rounded-lg transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting OCR...</span>
                    </>
                  ) : (
                    <>
                      <span>Scan & Find Soundtrack</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading message */}
      {isLoading && statusMessage && (
        <div className="mt-3 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin shrink-0" />
          <span className="text-xs text-zinc-300 truncate">{statusMessage}</span>
        </div>
      )}

      {/* iOS Shortcuts & URL Navigation Hint */}
      <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
        <div className="flex items-center gap-1.5 truncate">
          <Zap className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="truncate">
            iOS Shortcuts & query navigation enabled: open via <code className="text-zinc-400 font-mono">?url=...</code> or <code className="text-zinc-400 font-mono">?q=...</code>
          </span>
        </div>
      </div>
    </div>
  );
};
