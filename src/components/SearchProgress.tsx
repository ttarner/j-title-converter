import React, { useState, useEffect } from 'react';
import {
  Check,
  Loader2,
  Radio,
  Sparkles,
  Search,
  BookOpen,
  Tv,
  Link2,
  FileSearch,
} from 'lucide-react';

interface SearchProgressProps {
  sourceType?: 'text' | 'image_ocr' | 'streaming_link';
  customMessage?: string;
}

interface Step {
  id: number;
  label: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SearchProgress: React.FC<SearchProgressProps> = ({
  sourceType = 'streaming_link',
  customMessage,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Progressive step advance animation
  useEffect(() => {
    setCurrentStep(1);

    const timer1 = setTimeout(() => {
      setCurrentStep(2);
    }, 450);

    const timer2 = setTimeout(() => {
      setCurrentStep(3);
    }, 1100);

    const timer3 = setTimeout(() => {
      setCurrentStep(4);
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [sourceType]);

  const getStep1Info = () => {
    if (sourceType === 'streaming_link') {
      return {
        label: 'Fetch Streaming Metadata',
        detail: 'Querying Spotify / Apple Music / YouTube API',
        icon: Link2,
      };
    }
    if (sourceType === 'image_ocr') {
      return {
        label: 'Scan Screenshot OCR',
        detail: 'Extracting Japanese characters & artist from image',
        icon: FileSearch,
      };
    }
    return {
      label: 'Parse Japanese Input',
      detail: 'Analyzing Kanji, Hiragana, and Katakana characters',
      icon: Search,
    };
  };

  const step1Info = getStep1Info();

  const steps: Step[] = [
    {
      id: 1,
      label: step1Info.label,
      detail: step1Info.detail,
      icon: step1Info.icon,
    },
    {
      id: 2,
      label: 'Transliterate Phonetics',
      detail: 'Generating Hepburn Romaji, Hiragana & Katakana',
      icon: BookOpen,
    },
    {
      id: 3,
      label: 'Query Music Catalogs',
      detail: 'Finding official Western titles via MusicBrainz & iTunes',
      icon: Radio,
    },
    {
      id: 4,
      label: 'Match Anime OST Index',
      detail: 'Checking Opening, Ending & Insert theme database',
      icon: Tv,
    },
  ];

  return (
    <div className="w-full bg-zinc-900/90 border border-emerald-900/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Search in Progress
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
          <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
          <span>Step {Math.min(currentStep, 4)} of 4</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800">
        <div
          className="bg-emerald-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / 4) * 100}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="space-y-2 pt-1">
        {steps.map((step) => {
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isPending = currentStep < step.id;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                isCurrent
                  ? 'bg-emerald-950/30 border border-emerald-800/40 text-white'
                  : isDone
                  ? 'bg-zinc-950/60 border border-zinc-800/50 text-zinc-300'
                  : 'bg-zinc-950/20 border border-zinc-900 text-zinc-600'
              }`}
            >
              {/* Step Status Indicator */}
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  isDone
                    ? 'bg-emerald-500 text-black'
                    : isCurrent
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                    : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>

              {/* Step Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isDone
                        ? 'text-emerald-400'
                        : isCurrent
                        ? 'text-emerald-300'
                        : 'text-zinc-600'
                    }`}
                  />
                  <p
                    className={`text-xs font-semibold truncate ${
                      isDone
                        ? 'text-zinc-200'
                        : isCurrent
                        ? 'text-emerald-300'
                        : 'text-zinc-500'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                  {step.detail}
                </p>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {isDone && (
                  <span className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-900/60">
                    Done
                  </span>
                )}
                {isCurrent && (
                  <span className="text-[10px] text-emerald-300 font-medium px-2 py-0.5 rounded bg-emerald-900/40 border border-emerald-700/50 animate-pulse">
                    Processing
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {customMessage && (
        <p className="text-center text-[11px] text-zinc-500 pt-1 font-mono">
          {customMessage}
        </p>
      )}
    </div>
  );
};
