import React, { useState, useEffect, useRef } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { Header } from './components/Header';
import { SearchAndUpload } from './components/SearchAndUpload';
import { PresetsBar } from './components/PresetsBar';
import { ResultCard } from './components/ResultCard';
import { SearchProgress } from './components/SearchProgress';
import { HistoryList } from './components/HistoryList';
import { ConversionResponse, HistoryItem } from './types';
import { convertSongTitle } from './services/conversionService';
import { AlertCircle } from 'lucide-react';

interface SharedData {
  action: string;
  type: 'text' | 'image';
  value: string;
  subject?: string;
}

interface ShareReceiverPlugin {
  getPendingShare(): Promise<{ hasData: boolean; data?: SharedData }>;
  clearPendingShare(): Promise<{ cleared: boolean }>;
  addListener(
    eventName: 'shareReceived',
    listenerFunc: (data: SharedData) => void
  ): Promise<any>;
}

const ShareReceiver = registerPlugin<ShareReceiverPlugin>('ShareReceiver');

// Helper to parse query parameters from URL for iOS Shortcuts, deep links & direct navigation
const parseQueryFromUrl = (fullUrl?: string): {
  streamingUrl?: string;
  text?: string;
  artist?: string;
} | null => {
  if (typeof window === 'undefined') return null;

  const targetUrl = fullUrl || window.location.href;
  let searchStr = '';

  const qIndex = targetUrl.indexOf('?');
  if (qIndex !== -1) {
    searchStr = targetUrl.substring(qIndex);
  } else if (targetUrl.includes('#') && targetUrl.indexOf('?') !== -1) {
    searchStr = targetUrl.substring(targetUrl.indexOf('?'));
  }

  if (!searchStr) return null;

  try {
    const params = new URLSearchParams(searchStr);

    // Check explicit URL / link params
    const rawUrl = params.get('url') || params.get('link') || params.get('stream');
    if (rawUrl) {
      return { streamingUrl: rawUrl.trim() };
    }

    // Check 'q' (general query which could be a streaming link OR Japanese song name)
    const q = params.get('q');
    const artist = params.get('artist') || undefined;

    if (q) {
      const trimmed = q.trim();
      if (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.includes('spotify.com') ||
        trimmed.includes('apple.com') ||
        trimmed.includes('youtube.com') ||
        trimmed.includes('youtu.be')
      ) {
        return { streamingUrl: trimmed };
      }
      return { text: trimmed, artist };
    }

    // Check 'text' or 'title' param
    const text = params.get('text') || params.get('title');
    if (text) {
      return { text: text.trim(), artist };
    }
  } catch (e) {
    console.warn('Error parsing URL query:', e);
  }

  return null;
};

export default function App() {
  const [conversionResult, setConversionResult] = useState<ConversionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [activeSourceType, setActiveSourceType] = useState<'text' | 'image_ocr' | 'streaming_link'>('streaming_link');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPresetText, setSelectedPresetText] = useState<string>('');
  const [selectedPresetArtist, setSelectedPresetArtist] = useState<string>('');
  const [selectedPresetUrl, setSelectedPresetUrl] = useState<string>('');

  const progressSectionRef = useRef<HTMLDivElement>(null);
  const resultSectionRef = useRef<HTMLDivElement>(null);

  // Helper to parse query parameters from URL for iOS Shortcuts / direct navigation
  const parseUrlQuery = (): {
    streamingUrl?: string;
    text?: string;
    artist?: string;
  } | null => {
    if (typeof window === 'undefined') return null;

    let searchStr = window.location.search;
    if (!searchStr && window.location.hash.includes('?')) {
      searchStr = window.location.hash.substring(window.location.hash.indexOf('?'));
    }

    if (!searchStr) return null;

    try {
      const params = new URLSearchParams(searchStr);

      // Check explicit URL / link params
      const rawUrl = params.get('url') || params.get('link') || params.get('stream');
      if (rawUrl) {
        return { streamingUrl: rawUrl.trim() };
      }

      // Check 'q' (general query which could be a streaming link OR Japanese song name)
      const q = params.get('q');
      const artist = params.get('artist') || undefined;

      if (q) {
        const trimmed = q.trim();
        if (
          trimmed.startsWith('http://') ||
          trimmed.startsWith('https://') ||
          trimmed.includes('spotify.com') ||
          trimmed.includes('apple.com') ||
          trimmed.includes('youtube.com') ||
          trimmed.includes('youtu.be')
        ) {
          return { streamingUrl: trimmed };
        }
        return { text: trimmed, artist };
      }

      // Check 'text' or 'title' param
      const text = params.get('text') || params.get('title');
      if (text) {
        return { text: text.trim(), artist };
      }
    } catch (e) {
      console.warn('Error parsing URL query:', e);
    }

    return null;
  };

  // Persisted History state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('jtitle_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Failed to read history from localStorage:', e);
      return [];
    }
  });

  const addToHistory = (result: ConversionResponse) => {
    try {
      const topMatch = result.musicMatches?.[0];
      const newItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        timestamp: Date.now(),
        westernTitle: result.primaryWesternTitle,
        originalTitle: result.transliteration.original,
        romaji: result.transliteration.romajiHepburn || result.transliteration.romaji,
        artist: topMatch?.artist || result.input.artist || result.input.extractedArtist,
        artworkUrl: topMatch?.artworkUrl || result.streamingTrackInfo?.artworkUrl,
        sourceType: result.input.sourceType,
        serviceName: result.streamingTrackInfo?.serviceName,
        streamingUrl: result.streamingTrackInfo?.url,
        animeName: result.animeInfo?.anime,
        result: result,
      };

      setHistory((prev) => {
        const filtered = prev.filter(
          (item) =>
            item.originalTitle !== newItem.originalTitle &&
            item.westernTitle.toLowerCase() !== newItem.westernTitle.toLowerCase()
        );
        const updated = [newItem, ...filtered].slice(0, 25);
        try {
          localStorage.setItem('jtitle_history', JSON.stringify(updated));
        } catch (err) {
          console.warn('Failed to persist history to localStorage:', err);
        }
        return updated;
      });
    } catch (e) {
      console.warn('Error saving to history:', e);
    }
  };

  const executeConversion = async (params: {
    text?: string;
    artist?: string;
    imageBase64?: string;
    streamingUrl?: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);

    // Sync query parameters into browser address bar for shareability and iOS shortcuts
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.search = '';
        if (params.streamingUrl) {
          url.searchParams.set('url', params.streamingUrl);
        } else if (params.text) {
          url.searchParams.set('q', params.text);
          if (params.artist) {
            url.searchParams.set('artist', params.artist);
          }
        }
        window.history.replaceState({}, '', url.toString());
      } catch (e) {
        // Silently ignore if history state is restricted
      }
    }

    if (params.streamingUrl) {
      setActiveSourceType('streaming_link');
      setStatusMessage('Fetching track from streaming service & finding OST...');
    } else if (params.imageBase64) {
      setActiveSourceType('image_ocr');
      setStatusMessage('Extracting Japanese text & artist from image...');
    } else {
      setActiveSourceType('text');
      setStatusMessage('Searching music databases & anime soundtrack info...');
    }

    try {
      const data = await convertSongTitle(params);

      setConversionResult(data);
      addToHistory(data);
    } catch (err: any) {
      console.error('Conversion failed:', err);
      setErrorMessage(err.message || 'Connection or conversion error');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // Smoothly scroll to an element leaving comfortable clearance below the sticky header
  const scrollToElementWithOffset = (element: HTMLElement | null) => {
    if (!element || typeof window === 'undefined') return;
    const header = document.querySelector('header');
    const headerHeight = header ? header.getBoundingClientRect().height : 60;
    const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
    const targetY = Math.max(0, elementTop - headerHeight - 16);

    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });
  };

  // Auto-scroll to search progress card when search starts
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        scrollToElementWithOffset(progressSectionRef.current);
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Auto-scroll to result card when search completes successfully
  useEffect(() => {
    if (!isLoading && conversionResult) {
      const timer = setTimeout(() => {
        scrollToElementWithOffset(resultSectionRef.current);
      }, 90);
      return () => clearTimeout(timer);
    }
  }, [isLoading, conversionResult]);

  // Initial load: Check URL query parameters (e.g. for iOS Shortcuts).
  // Only convert if a query was passed in the URL.
  // Handler for content shared from other apps (links, text, screenshots)
  const handleIncomingShare = (shared: SharedData) => {
    if (!shared || !shared.value) return;

    if (shared.type === 'image') {
      setSelectedPresetText('');
      setSelectedPresetArtist('');
      setSelectedPresetUrl('');
      executeConversion({ imageBase64: shared.value });
      return;
    }

    if (shared.type === 'text') {
      const rawText = shared.value.trim();

      // Check if the shared text contains a Spotify / Apple Music / YouTube URL
      const urlRegex = /(https?:\/\/[^\s]+)/i;
      const urlMatch = rawText.match(urlRegex);

      if (urlMatch) {
        const detectedUrl = urlMatch[1];
        if (
          detectedUrl.includes('spotify.com') ||
          detectedUrl.includes('apple.com') ||
          detectedUrl.includes('youtube.com') ||
          detectedUrl.includes('youtu.be')
        ) {
          setSelectedPresetUrl(detectedUrl);
          setSelectedPresetText('');
          setSelectedPresetArtist('');
          executeConversion({ streamingUrl: detectedUrl });
          return;
        }
      }

      // If no streaming link is found, treat as text query (Japanese song title / artist)
      setSelectedPresetUrl('');
      setSelectedPresetText(rawText);
      if (shared.subject && shared.subject.trim() !== rawText) {
        setSelectedPresetArtist(shared.subject.trim());
        executeConversion({ text: rawText, artist: shared.subject.trim() });
      } else {
        executeConversion({ text: rawText });
      }
    }
  };

  // Initial load: Check URL query parameters, iOS Shortcuts / deep links, and shared content from other apps
  useEffect(() => {
    const initialQuery = parseUrlQuery();
    // 1. Check browser / web URL query parameters
    const initialQuery = parseQueryFromUrl();
    if (initialQuery) {
      if (initialQuery.streamingUrl) {
        setSelectedPresetUrl(initialQuery.streamingUrl);
        executeConversion({ streamingUrl: initialQuery.streamingUrl });
      } else if (initialQuery.text) {
        setSelectedPresetText(initialQuery.text);
        if (initialQuery.artist) setSelectedPresetArtist(initialQuery.artist);
        executeConversion({ text: initialQuery.text, artist: initialQuery.artist });
      }
    }

    // Support browser Back/Forward navigation with query URLs
    // 2. Support browser Back/Forward navigation with query URLs
    const handlePopState = () => {
      const popQuery = parseUrlQuery();
      const popQuery = parseQueryFromUrl();
      if (popQuery) {
        if (popQuery.streamingUrl) {
          setSelectedPresetUrl(popQuery.streamingUrl);
          executeConversion({ streamingUrl: popQuery.streamingUrl });
        } else if (popQuery.text) {
          setSelectedPresetText(popQuery.text);
          if (popQuery.artist) setSelectedPresetArtist(popQuery.artist);
          executeConversion({ text: popQuery.text, artist: popQuery.artist });
        }
      }
    };
    window.addEventListener('popstate', handlePopState);

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    // 3. Deep link handler via @capacitor/app (e.g. jtitle://convert?url=... or jtitle://search?q=...)
    let appUrlRemoveHandle: (() => void) | null = null;
    try {
      CapacitorApp.addListener('appUrlOpen', (event) => {
        if (event?.url) {
          const parsed = parseQueryFromUrl(event.url);
          if (parsed?.streamingUrl) {
            setSelectedPresetUrl(parsed.streamingUrl);
            executeConversion({ streamingUrl: parsed.streamingUrl });
          } else if (parsed?.text) {
            setSelectedPresetText(parsed.text);
            if (parsed.artist) setSelectedPresetArtist(parsed.artist);
            executeConversion({ text: parsed.text, artist: parsed.artist });
          }
        }
      }).then((handle) => {
        appUrlRemoveHandle = () => handle.remove();
      }).catch(() => {});
    } catch (e) {
      // Ignored if outside Capacitor runtime
    }

    // 4. Android native share handler (for ACTION_SEND text, streaming links, and images)
    let shareRemoveHandle: (() => void) | null = null;
    if (Capacitor.isNativePlatform()) {
      // Check if launched via share intent (cold start)
      ShareReceiver.getPendingShare()
        .then((res) => {
          if (res?.hasData && res.data) {
            handleIncomingShare(res.data);
            ShareReceiver.clearPendingShare().catch(() => {});
          }
        })
        .catch((e) => console.warn('ShareReceiver.getPendingShare error:', e));

      // Listen for runtime shares while app is alive in background (warm/hot start)
      ShareReceiver.addListener('shareReceived', (data) => {
        if (data) {
          handleIncomingShare(data);
          ShareReceiver.clearPendingShare().catch(() => {});
        }
      })
        .then((handle) => {
          shareRemoveHandle = () => handle.remove();
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (appUrlRemoveHandle) appUrlRemoveHandle();
      if (shareRemoveHandle) shareRemoveHandle();
    };
  }, []);

  const handleSelectPreset = (presetTitle: string, presetArtist?: string) => {
    setSelectedPresetText(presetTitle);
    setSelectedPresetArtist(presetArtist || '');
    executeConversion({ text: presetTitle, artist: presetArtist });
  };

  const handleSelectHistoryItem = (itemResult: ConversionResponse) => {
    setConversionResult(itemResult);
    setErrorMessage(null);
    setTimeout(() => {
      scrollToElementWithOffset(resultSectionRef.current);
    }, 60);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('jtitle_history');
    } catch (e) {}
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('jtitle_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-[#121212] text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Top Header */}
      <Header />

      {/* Main Container - Optimized for mobile viewport */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-4">
        {/* Search & Upload Section */}
        <SearchAndUpload
          onConvert={executeConversion}
          isLoading={isLoading}
          statusMessage={statusMessage}
          externalText={selectedPresetText}
          externalArtist={selectedPresetArtist}
          externalUrl={selectedPresetUrl}
        />

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold block">Notice</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Search Progress Steps - Positioned high & auto-scrolls to top when search starts */}
        {isLoading && (
          <div ref={progressSectionRef} className="scroll-mt-24 pt-1">
            <SearchProgress
              sourceType={activeSourceType}
              customMessage={statusMessage}
            />
          </div>
        )}

        {/* Result Card - Positioned high & auto-scrolls to top when search finishes */}
        {!isLoading && conversionResult && (
          <div ref={resultSectionRef} className="scroll-mt-24 pt-1">
            <ResultCard data={conversionResult} />
          </div>
        )}

        {/* Quick Presets Bar */}
        <PresetsBar onSelect={handleSelectPreset} disabled={isLoading} />

        {/* History of Lookups */}
        <HistoryList
          history={history}
          onSelect={handleSelectHistoryItem}
          onClear={handleClearHistory}
          onDelete={handleDeleteHistoryItem}
        />
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/60 py-3 text-center text-[11px] text-zinc-600">
        <p>J-Title Romanizer • Powered by MusicBrainz, iTunes & Kuroshiro</p>
      </footer>
    </div>
  );
}
