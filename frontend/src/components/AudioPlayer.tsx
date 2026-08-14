"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Sparkles } from "lucide-react";

interface AudioPlayerProps {
  mediaUrl: string;
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  onTimeUpdate?: (time: number) => void;
}

export default function AudioPlayer({
  mediaUrl,
  duration,
  currentTime,
  onSeek,
  onTimeUpdate
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Sync internal audio element position with external `currentTime` prop
  useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 0.8) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(true));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      if (onTimeUpdate) onTimeUpdate(time);
    }
  };

  const skipSeconds = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    onSeek(newTime);
  };

  const changeSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    onSeek(newTime);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-4 shadow-xl select-none">
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={mediaUrl || "https://cdn.freesound.org/previews/686/686488_11861866-lq.mp3"}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Controls: Jump -10s, Play/Pause, Jump +10s */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => skipSeconds(-10)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition active:scale-95"
            title="Rewind 10 seconds"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition active:scale-95 ring-2 ring-indigo-500/20"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => skipSeconds(10)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition active:scale-95"
            title="Forward 10 seconds"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Central Seek Bar & Equalizer */}
        <div className="flex-1 w-full px-2">
          {/* Waveform Equalizer Display */}
          <div className="flex items-center justify-between gap-1 mb-2 px-1 h-7">
            {Array.from({ length: 36 }).map((_, idx) => {
              const heightPercent = Math.sin(idx * 0.4 + currentTime * 0.1) * 40 + 50;
              const isActive = (idx / 36) * duration <= currentTime;
              return (
                <div
                  key={idx}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isActive ? "bg-indigo-500 shadow-sm shadow-indigo-500/50" : "bg-slate-800"
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(15, heightPercent)}%` : `${Math.max(20, (idx % 5) * 15 + 20)}%`
                  }}
                />
              );
            })}
          </div>

          {/* Slider input & Time display */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-indigo-400 font-medium">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSliderChange}
              className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Speed & Volume settings */}
        <div className="flex items-center gap-2">
          {/* Speed Toggle */}
          <button
            onClick={changeSpeed}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-indigo-400 font-semibold hover:border-slate-700 transition"
            title="Change Playback Speed"
          >
            {playbackSpeed}x
          </button>

          {/* Volume Mute Toggle */}
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              if (audioRef.current) audioRef.current.muted = !isMuted;
            }}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
