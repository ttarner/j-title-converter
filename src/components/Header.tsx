import React from 'react';
import { Music } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-950/40">
            <Music className="w-4 h-4 text-black" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">
              J-Title Romanizer
            </h1>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-tight">
              Japanese song titles to Romaji & Western releases
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
