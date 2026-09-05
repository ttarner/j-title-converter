import React from 'react';

interface PresetsBarProps {
  onSelect: (title: string, artist?: string) => void;
  disabled?: boolean;
}

const PRESETS = [
  { title: 'シャケナベイベー', artist: 'AKASAKI', romaji: 'Shake na baby' },
  { title: '残響散歌', artist: 'Aimer', romaji: 'Zankyosanka (OP1)' },
  { title: '紅蓮華', artist: 'LiSA', romaji: 'Gurenge (OP1)' },
  { title: 'アイドル', artist: 'YOASOBI', romaji: 'Idol (OP1)' },
  { title: '廻廻奇譚', artist: 'Eve', romaji: 'Kaikai Kitan (OP1)' },
  { title: '夜に駆ける', artist: 'YOASOBI', romaji: 'Into The Night' },
  { title: 'プラスティック・ラブ', artist: '竹内まりや', romaji: 'Plastic Love' },
  { title: '丸ノ内サディスティック', artist: '椎名林檎', romaji: 'Marunouchi Sadistic' },
];

export const PresetsBar: React.FC<PresetsBarProps> = ({ onSelect, disabled }) => {
  return (
    <div className="w-full flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
      <span className="text-[11px] text-zinc-500 font-medium shrink-0 pr-1">Quick:</span>
      {PRESETS.map((preset) => (
        <button
          key={preset.title}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(preset.title, preset.artist)}
          className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 transition-colors text-left shrink-0 cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
        >
          <span className="text-xs font-medium text-zinc-300 hover:text-white">
            {preset.title}
          </span>
          <span className="text-[10px] text-emerald-400/90 font-medium">
            {preset.artist}
          </span>
        </button>
      ))}
    </div>
  );
};
