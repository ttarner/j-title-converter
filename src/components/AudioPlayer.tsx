import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  previewUrl: string;
  trackTitle: string;
  artist: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ previewUrl, trackTitle, artist }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [previewUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Playback failed:', e);
      });
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl p-2.5 flex items-center gap-3">
      <audio
        ref={audioRef}
        src={previewUrl}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current && audioRef.current.duration) setDuration(audioRef.current.duration);
        }}
        onEnded={() => setIsPlaying(false)}
      />

      <button
        id="toggle-audio-play-button"
        type="button"
        onClick={togglePlay}
        className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition-transform active:scale-95 shrink-0 cursor-pointer"
        title={isPlaying ? 'Pause preview' : 'Play 30s preview'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-black" />
        ) : (
          <Play className="w-4 h-4 fill-black translate-x-0.5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-zinc-300 font-medium truncate pr-2">
            30s Audio Preview
          </span>
          <span className="font-mono text-zinc-500 text-[10px]">
            {formatSeconds(currentTime)} / {formatSeconds(duration)}
          </span>
        </div>
        <div className="relative w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <button
        id="toggle-mute-button"
        type="button"
        onClick={toggleMute}
        className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
};
