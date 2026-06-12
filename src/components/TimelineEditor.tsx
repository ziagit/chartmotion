import React, { useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, Zap, Volume2, MoveRight, Music, Clock } from 'lucide-react';
import { useStore, PRESET_AUDIO } from '../store';

export default function TimelineEditor() {
  const {
    scenes,
    activeSceneId,
    setActiveSceneId,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    projectSettings,
  } = useStore();

  const containerRef = useRef<HTMLDivElement>(null);

  // Compute timing milestones of scenes
  let accumulatedTime = 0;
  const scenesWithMilestones = scenes.map((scene) => {
    const start = accumulatedTime;
    const end = start + scene.duration;
    accumulatedTime = end;
    return {
      ...scene,
      start,
      end,
    };
  });

  const totalDuration = accumulatedTime || 1; // Prevent division by zero

  // Auto-advance playhead when playing
  useEffect(() => {
    let lastTime = performance.now();
    let animFrame: number;

    const tick = () => {
      if (!isPlaying) return;

      const now = performance.now();
      const delta = (now - lastTime) / 1000; // in seconds
      lastTime = now;

      const nextTime = currentTime + delta * playbackSpeed;
      if (nextTime >= totalDuration) {
        setCurrentTime(0); // Loop back to start
      } else {
        setCurrentTime(nextTime);
      }

      animFrame = requestAnimationFrame(tick);
    };

    if (isPlaying) {
      lastTime = performance.now();
      animFrame = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, currentTime, totalDuration, playbackSpeed, setCurrentTime]);

  // Click on timeline to scrub / seek
  const handleTimelineScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
    setCurrentTime(percent * totalDuration);
  };

  const selectedAudio = PRESET_AUDIO.find((a) => a.id === projectSettings.selectedAudioId);

  // Get active scene matching currentTime
  const currentSceneAtPlayhead = scenesWithMilestones.find(
    (scene) => currentTime >= scene.start && currentTime <= scene.end
  ) || scenesWithMilestones[scenesWithMilestones.length - 1];

  // Auto-highlight active scene when playhead moves through it
  useEffect(() => {
    if (isPlaying && currentSceneAtPlayhead && currentSceneAtPlayhead.id !== activeSceneId) {
      setActiveSceneId(currentSceneAtPlayhead.id);
    }
  }, [currentSceneAtPlayhead, isPlaying, activeSceneId, setActiveSceneId]);

  return (
    <div className="bg-zinc-950 border-t border-zinc-800 p-4 select-none flex flex-col gap-3" id="timeline-editor">
      {/* Playback Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-zinc-300">
        <div className="flex items-center gap-3">
          {/* Skip Back */}
          <button
            onClick={() => setCurrentTime(0)}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition"
            title="Return to start"
          >
            <SkipBack size={16} />
          </button>

          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2.5 rounded-full flex items-center justify-center transition ${
              isPlaying ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-zinc-100 text-zinc-900 hover:bg-white'
            }`}
          >
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          </button>

          {/* Timecode Indicators */}
          <div className="flex items-center gap-2 font-mono text-sm leading-none bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-100 font-bold">{currentTime.toFixed(2)}s</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400">{totalDuration.toFixed(2)}s</span>
          </div>

          <div className="text-[10px] bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800 text-zinc-400 hidden sm:block">
            ACTIVE SCENE: <span className="text-indigo-400 font-semibold">{currentSceneAtPlayhead?.title || 'None'}</span>
          </div>
        </div>

        {/* Speed / Volume Controls */}
        <div className="flex items-center gap-4 text-xs">
          {/* Speed settings */}
          <div className="flex items-center gap-1.5 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
            {([1, 1.5, 2] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  playbackSpeed === spd
                    ? 'bg-zinc-800 text-indigo-400 shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Format Indicators */}
          <div className="flex items-center gap-2 text-zinc-400 text-[11px] font-mono">
            <Clock size={12} className="text-zinc-500" />
            <span>FPS: {projectSettings.fps}</span>
            <span>•</span>
            <span>{projectSettings.aspectRatio}</span>
          </div>
        </div>
      </div>

      {/* CapCut-style Multi-Scene Track Block */}
      <div className="relative flex flex-col gap-2 mt-2">
        {/* Playhead Time Ruler Labels */}
        <div className="h-4 relative text-[9px] text-zinc-600 font-mono">
          {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, index) => {
            const leftPerc = (index / totalDuration) * 100;
            if (leftPerc > 100) return null;
            return (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 flex flex-col items-center select-none"
                style={{ left: `${leftPerc}%` }}
              >
                <span>{index}s</span>
                <div className="w-[1px] h-1.5 bg-zinc-800 mt-0.5" />
              </div>
            );
          })}
        </div>

        {/* Timeline Core Bar */}
        <div
          ref={containerRef}
          onClick={handleTimelineScrub}
          className="relative h-18 bg-zinc-900 border border-zinc-800 rounded-lg cursor-pointer flex select-none overflow-hidden"
          id="timeline-core-track"
        >
          {/* Rendering sequence blocks */}
          {scenesWithMilestones.map((scene, idx) => {
            const isActive = activeSceneId === scene.id;
            const startPerc = (scene.start / totalDuration) * 100;
            const widthPerc = (scene.duration / totalDuration) * 100;

            return (
              <div
                key={scene.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSceneId(scene.id);
                  // Seek to the start of this scene for handy editing!
                  setCurrentTime(scene.start);
                }}
                className={`relative h-full flex flex-col justify-between p-2.5 border-r border-zinc-950 cursor-pointer select-none transition-all ${
                  isActive
                    ? 'bg-indigo-950/40 border-2 border-indigo-500 z-10 shadow-lg'
                    : 'bg-zinc-800/80 hover:bg-zinc-800/90'
                }`}
                style={{ width: `${widthPerc}%` }}
              >
                {/* Scene Meta */}
                <div className="flex justify-between items-start gap-1">
                  <span className="text-[10px] font-bold text-zinc-100 truncate">
                    {idx + 1}. {scene.title}
                  </span>
                  <span className="text-[9px] px-1 bg-zinc-950/80 text-zinc-400 rounded shrink-0 font-mono">
                    {scene.duration}s
                  </span>
                </div>

                {/* Animation Type Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-zinc-400 capitalize bg-zinc-900 px-1 py-0.5 rounded truncate max-w-[80%]">
                    📊 {scene.chartType.replace('-', ' ')}
                  </span>
                  {scene.transitionEffect !== 'none' && (
                    <span className="text-[9px] text-amber-500 flex items-center gap-0.5 font-mono" title={`Transition: ${scene.transitionEffect}`}>
                      <Zap size={8} /> {scene.transitionEffect}
                    </span>
                  )}
                </div>

                {/* Transition Handle Overlap Icon */}
                {idx < scenes.length - 1 && (
                  <div
                    className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-zinc-700 hover:bg-indigo-500 border border-zinc-800 rounded-full flex items-center justify-center z-10 transition shadow-md cursor-pointer"
                    title={`Visual transition effect: ${scene.transitionEffect}`}
                  >
                    <MoveRight size={8} className="text-white" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Current playhead visual slider overlay */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-indigo-400 pointer-events-none z-20 shadow-lg"
            style={{ left: `${(currentTime / totalDuration) * 100}%` }}
          >
            <div className="absolute top-0 -translate-x-1/2 w-3 h-3 bg-indigo-400 rounded-full border border-white" />
          </div>
        </div>

        {/* Audio/SFX Track beneath */}
        {selectedAudio && (
          <div className="h-6 bg-zinc-900/60 border border-zinc-900 rounded-lg flex items-center px-3 justify-between text-zinc-400 gap-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono leading-none">
              <Music size={10} className="text-indigo-400 animate-pulse" />
              <span className="text-zinc-300 font-bold max-w-[150px] truncate">{selectedAudio.name}</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-500 italic shrink-0">{selectedAudio.artist}</span>
            </div>
            
            {/* Simple volume output */}
            <div className="flex items-center gap-1.5 text-[10px]">
              <Volume2 size={10} className="text-zinc-500" />
              <span className="text-zinc-400 font-mono">Vol: {Math.round(projectSettings.audioVolume * 100)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
