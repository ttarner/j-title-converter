import React, { useState } from 'react';
import {
  History,
  Trash2,
  ChevronDown,
  ChevronUp,
  Disc,
  Tv,
  Music2,
  ExternalLink,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { HistoryItem, ConversionResponse } from '../types';

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (result: ConversionResponse) => void;
  onClear: () => void;
  onDelete: (id: string) => void;
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onSelect,
  onClear,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 sm:p-4 shadow-xl space-y-3">
      {/* Header with Title, Count, Collapse Toggle & Clear Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-left cursor-pointer group"
        >
          <div className="p-1 rounded-md bg-zinc-800 text-zinc-400 group-hover:text-white transition-colors">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider group-hover:text-white transition-colors">
                Search History
              </h3>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-emerald-400 border border-zinc-700">
                {history.length}
              </span>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-zinc-500 ml-1" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 ml-1" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="clear-all-history-button"
            onClick={onClear}
            className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-rose-400 font-medium px-2 py-1 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Clear history"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* History Items list */}
      {isExpanded && (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
          {history.map((item) => (
            <div
              key={item.id}
              className="group flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer"
              onClick={() => onSelect(item.result)}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Artwork / Icon */}
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0 flex items-center justify-center">
                  {item.artworkUrl ? (
                    <img
                      src={item.artworkUrl}
                      alt={item.westernTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Disc className="w-5 h-5 text-zinc-600" />
                  )}
                </div>

                {/* Song info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-300 transition-colors truncate">
                      {item.westernTitle}
                    </p>
                    {item.animeName && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60 shrink-0">
                        <Tv className="w-2.5 h-2.5" />
                        <span className="max-w-[100px] truncate">{item.animeName}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-zinc-500 truncate">
                    {item.originalTitle} • {item.romaji}
                    {item.artist ? ` • ${item.artist}` : ''}
                  </p>
                </div>
              </div>

              {/* Right side metadata & Delete button */}
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center gap-1 text-[10px] text-zinc-500 justify-end">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{formatRelativeTime(item.timestamp)}</span>
                  </div>
                  {item.serviceName && (
                    <span className="text-[9px] text-zinc-400 font-medium block">
                      {item.serviceName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(item.result);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-900 rounded-md transition-colors"
                    title="Load result"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 rounded-md transition-colors"
                    title="Remove from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
