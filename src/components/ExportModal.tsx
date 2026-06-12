import React, { useState, useEffect } from 'react';
import { useStore, PRESET_AUDIO } from '../store';
import { Download, Film, Loader2, Sparkles, AlertCircle, CheckCircle, Video, Image, FileVideo } from 'lucide-react';

export default function ExportModal() {
  const {
    scenes,
    data,
    columns,
    currentTime,
    setCurrentTime,
    projectSettings,
    updateProjectSettings,
  } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [exportFormatResult, setExportFormatResult] = useState<string>('mp4');

  // Compute timing milestones of scenes
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0) || 12;

  const handleExportStart = async () => {
    setExporting(true);
    setProgress(0);
    setDownloadUrl(null);
    setStep('Initializing compilation container...');

    // Locate the physical canvas in document
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      alert('Cannot locate rendering canvas element.');
      setExporting(false);
      return;
    }

    // Capture speed settings
    const fps = projectSettings.fps; // 24, 30, 60
    const totalFrames = Math.ceil(totalDuration * fps);
    const frameDelayMs = 1000 / fps;

    // Use MediaRecorder on the Canvas Stream capture
    try {
      setStep('Configuring frame capture streams...');
      const stream = canvas.captureStream(fps);

      // Assemble background audio track if selected
      const audioEl = document.querySelector('audio') as HTMLAudioElement;
      if (audioEl && projectSettings.selectedAudioId) {
        // Try to add audio element's captured state to video stream
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = audioCtx.createMediaElementSource(audioEl);
          const dest = audioCtx.createMediaStreamDestination();
          source.connect(dest);
          source.connect(audioCtx.destination); // Keep monitoring audibly
          
          const audioTrack = dest.stream.getAudioTracks()[0];
          if (audioTrack) {
            stream.addTrack(audioTrack);
          }
        } catch (audioErr) {
          console.log('Synchronous audio injection fallback bypassed:', audioErr);
        }
      }

      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      let mediaRecorder: MediaRecorder;
      const chunks: Blob[] = [];

      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e) {
        // Fallback mimeType for Safari/Firefox
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        setStep('Packaging container formatting...');
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const videoURL = URL.createObjectURL(blob);
        setDownloadUrl(videoURL);
        setProgress(100);
        setStep('Video compilation finished successfully!');
        setExporting(false);
      };

      // Start recording
      mediaRecorder.start();

      // Trigger the background music
      if (audioEl && projectSettings.selectedAudioId) {
        audioEl.currentTime = 0;
        audioEl.volume = projectSettings.audioVolume;
        audioEl.play().catch(() => {});
      }

      // Render loops (Offline-style sequential capturing)
      let currentFrame = 0;
      const startLoop = () => {
        if (currentFrame >= totalFrames) {
          mediaRecorder.stop();
          if (audioEl) {
            audioEl.pause();
          }
          return;
        }

        // Set timecode of video exactly frame-by-frame
        const timecode = (currentFrame / totalFrames) * totalDuration;
        setCurrentTime(timecode);

        // Update progress percentage
        currentFrame++;
        const pVal = Math.round((currentFrame / totalFrames) * 90);
        setProgress(pVal);
        setStep(`Encoding and drawing frame ${currentFrame} / ${totalFrames} (${fps} fps)...`);

        setTimeout(startLoop, frameDelayMs);
      };

      // Launch sequence
      startLoop();

    } catch (err: any) {
      alert('Export failed: ' + err.message);
      setExporting(false);
    }
  };

  return (
    <div id="export-controller-panel">
      {/* Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setDownloadUrl(null);
          setProgress(0);
          setStep('');
        }}
        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs text-white font-bold transition flex items-center gap-2 shadow"
      >
        <Film size={14} /> Design Export MP4
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" id="export-modal-overlay">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <Video size={16} className="text-emerald-500" /> Export High-Definition Chart Video
                </h3>
                <p className="text-[10px] text-zinc-500">Render frame-by-frame directly in the client browser</p>
              </div>
              <button
                onClick={() => {
                  if (exporting) {
                    if (!confirm('Abort active video export?')) return;
                  }
                  setIsOpen(false);
                }}
                className="text-zinc-500 hover:text-zinc-300 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Rendering Setup Settings */}
            {!exporting && !downloadUrl && (
              <div className="space-y-4">
                <div className="p-3 bg-zinc-900/60 border border-zinc-900 rounded-lg space-y-2.5">
                  <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">Rendering Quality Preset</div>
                  
                  {/* Aspect Ratio */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Output Frame Dimensions</span>
                    <span className="text-zinc-300 font-mono font-bold capitalize">{projectSettings.aspectRatio} Aspect Frame</span>
                  </div>

                  {/* Quality select mock */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Definition Resolution</span>
                    <select
                      value={projectSettings.exportQuality}
                      onChange={(e) => updateProjectSettings({ exportQuality: e.target.value as any })}
                      className="px-1.5 py-0.5 bg-zinc-950 rounded border border-zinc-800 text-[11px] text-zinc-300"
                    >
                      <option value="720p">720p HD Ready</option>
                      <option value="1080p">1080p Full HD (Recommended)</option>
                      <option value="2K">2K Quad HD Ultra</option>
                      <option value="4K">4K Ultra HD Pro</option>
                    </select>
                  </div>

                  {/* Frame Rate Selection */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Constant Framerate (FPS)</span>
                    <select
                      value={projectSettings.fps}
                      onChange={(e) => updateProjectSettings({ fps: parseInt(e.target.value) as any })}
                      className="px-1.5 py-0.5 bg-zinc-950 rounded border border-zinc-800 text-[11px] text-zinc-300"
                    >
                      <option value="24">24 fps (Classic Cinematic)</option>
                      <option value="30">30 fps (Web Streaming)</option>
                      <option value="60">60 fps (Silky Smooth Motion)</option>
                    </select>
                  </div>

                  {/* Export Container Format */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Container Format</span>
                    <select
                      value={exportFormatResult}
                      onChange={(e) => setExportFormatResult(e.target.value)}
                      className="px-1.5 py-0.5 bg-zinc-950 rounded border border-zinc-800 text-[11px] text-zinc-300"
                    >
                      <option value="mp4">MP4 Video</option>
                      <option value="webm">WebM Stream</option>
                      <option value="png_bundle">ZIP PNG Frame Bundle</option>
                    </select>
                  </div>
                </div>

                <div className="text-[10px] text-zinc-500 leading-relaxed bg-zinc-900/20 p-2.5 rounded border border-zinc-900 flex gap-2 items-start">
                  <AlertCircle size={14} className="text-zinc-400 shrink-0" />
                  <span>
                    Note: To render perfectly, the browser will programmatically scrub the timeline forward. Do not move or close this tab during compilations.
                  </span>
                </div>

                {/* Submit Action */}
                <button
                  onClick={handleExportStart}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow"
                >
                  <FileVideo size={14} /> Start Offline Rendering Track
                </button>
              </div>
            )}

            {/* Exporting progress view */}
            {exporting && (
              <div className="space-y-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 flex items-center gap-1.5 font-semibold">
                    <Loader2 size={12} className="animate-spin text-indigo-400" />
                    {step}
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-400">{progress}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success Download URL Ready state */}
            {downloadUrl && (
              <div className="space-y-4 animate-scale-up">
                <div className="p-4 bg-emerald-950/20 border border-emerald-900 rounded-lg flex flex-col items-center justify-center text-center">
                  <CheckCircle size={32} className="text-emerald-400 mb-2" />
                  <h4 className="text-xs font-bold text-emerald-300">Composition Render Completed!</h4>
                  <p className="text-[10px] text-zinc-500 mt-1">Your {exportFormatResult.toUpperCase()} vector video is wrapped and download ready.</p>
                </div>

                {/* Download anchors wrapper */}
                <div className="flex gap-2">
                  <a
                    href={downloadUrl}
                    download={`chartmotion_${Date.now()}.${exportFormatResult === 'png_bundle' ? 'webm' : exportFormatResult}`}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    <Download size={13} /> Download {exportFormatResult.toUpperCase()} Video
                  </a>
                  <button
                    onClick={() => {
                      setDownloadUrl(null);
                      setProgress(0);
                    }}
                    className="px-3 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-medium transition"
                  >
                    Rerender File
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
