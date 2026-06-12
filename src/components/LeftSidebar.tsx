import React, { useState } from 'react';
import DataImporter from './DataImporter';
import { useStore, PRESET_AUDIO } from '../store';
import { Trash2, Music, Upload, Layers, PlusCircle, Shield, Image, Sparkles, Sliders, ArrowUp, ArrowDown, Database, Eye } from 'lucide-react';
import { AspectRatio, ExportFormat, ExportQuality } from '../types';

export default function LeftSidebar() {
  const {
    scenes,
    activeSceneId,
    setActiveSceneId,
    addScene,
    deleteScene,
    reorderScenes,
    projectSettings,
    updateProjectSettings,
    setLogoFile,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'data' | 'scenes' | 'assets' | 'audio'>('data');

  // Multi-scene reordering
  const handleMoveScene = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= scenes.length) return;

    const revised = [...scenes];
    const temporary = revised[index];
    revised[index] = revised[targetIdx];
    revised[targetIdx] = temporary;

    reorderScenes(revised);
  };

  // Convert custom logo files cleanly to base64 for overlay
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoFile(file, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-80 border-r border-zinc-800 bg-zinc-950 flex flex-col h-full select-none text-zinc-300" id="left-sidebar">
      
      {/* Visual Navigation Tabs */}
      <div className="flex border-b border-zinc-800 text-xs text-zinc-400 font-semibold bg-zinc-900/60 sticky top-0 z-10 shrink-0">
        <button
          onClick={() => setActiveTab('data')}
          className={`flex-1 py-3 text-center border-b-2 font-semibold flex flex-col items-center gap-1 transition ${
            activeTab === 'data'
              ? 'border-indigo-500 text-indigo-400 bg-zinc-950/40'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <Database size={13} /> Data
        </button>
        <button
          onClick={() => setActiveTab('scenes')}
          className={`flex-1 py-3 text-center border-b-2 font-semibold flex flex-col items-center gap-1 transition ${
            activeTab === 'scenes'
              ? 'border-indigo-500 text-indigo-400 bg-zinc-950/40'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <Layers size={13} /> Scene Board
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`flex-1 py-3 text-center border-b-2 font-semibold flex flex-col items-center gap-1 transition ${
            activeTab === 'assets'
              ? 'border-indigo-500 text-indigo-400 bg-zinc-950/40'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <Image size={13} /> Brand Kit
        </button>
        <button
          onClick={() => setActiveTab('audio')}
          className={`flex-1 py-3 text-center border-b-2 font-semibold flex flex-col items-center gap-1 transition ${
            activeTab === 'audio'
              ? 'border-indigo-500 text-indigo-400 bg-zinc-950/40'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <Music size={13} /> Beat Deck
        </button>
      </div>

      {/* CORE VIEW MODULES ON ACTIVE TAB */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">

        {activeTab === 'data' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider mb-1.5">
                Data Files Source
              </h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed mb-4">
                Bind columns in the right panel to dynamically plot rows. Updates reflect live on canvas.
              </p>
            </div>
            {/* Custom file importer widget */}
            <DataImporter />
          </div>
        )}

        {activeTab === 'scenes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider mb-0.5">
                  Multi-Scene Timeline
                </h3>
                <p className="text-[10px] text-zinc-500">Combine scenes into one video stream</p>
              </div>
              
              <button
                onClick={() => addScene()}
                className="p-1 px-2.5 text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium flex items-center gap-1 transition shadow-sm"
              >
                <PlusCircle size={11} /> Scene
              </button>
            </div>

            {/* List of Scenes */}
            <div className="space-y-2.5">
              {scenes.map((scene, index) => {
                const isActive = scene.id === activeSceneId;
                return (
                  <div
                    key={scene.id}
                    onClick={() => setActiveSceneId(scene.id)}
                    className={`p-3 rounded-lg border transition cursor-pointer flex flex-col gap-2 ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-950/20 shadow-md'
                        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[11.5px] font-bold text-zinc-200 truncate">
                        {index + 1}. {scene.title}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Move Scene order buttons */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveScene(index, 'up');
                          }}
                          disabled={index === 0}
                          className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-20 rounded"
                          title="Move timeline sequence earlier"
                        >
                          <ArrowUp size={11} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveScene(index, 'down');
                          }}
                          disabled={index === scenes.length - 1}
                          className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-20 rounded"
                          title="Move timeline sequence later"
                        >
                          <ArrowDown size={11} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (scenes.length === 1) {
                              alert('Your video timeline needs at least one scene segment.');
                              return;
                            }
                            if (confirm(`Delete scene "${scene.title}"?`)) {
                              deleteScene(scene.id);
                            }
                          }}
                          className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded ml-1 transition"
                          title="Remove scene"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-zinc-500">
                      <span className="uppercase tracking-wide font-mono">
                        📊 {scene.chartType.replace('-', ' ')}
                      </span>
                      <span className="font-mono bg-zinc-950 px-1 py-0.5 rounded">
                        {scene.duration}s length
                      </span>
                    </div>

                    {isActive && (
                      <div className="text-[9.5px] text-indigo-400 flex items-center gap-1 select-none pointer-events-none mt-1">
                        <Eye size={10} /> Currently rendering active properties
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider mb-1">
                Aspect & Brand Overlays
              </h3>
              <p className="text-[11px] text-zinc-500">Configure global resolutions, logos, and copyright watermarks</p>
            </div>

            {/* Config: Aspect Ratio */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-semibold">Framing Canvas Aspect Ratio</label>
              <select
                value={projectSettings.aspectRatio}
                onChange={(e) => updateProjectSettings({ aspectRatio: e.target.value as AspectRatio })}
                className="w-full px-2 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded focus:border-indigo-500 text-zinc-200"
              >
                <option value="16:9">🎥 Landscape 16:9 (YouTube / TV)</option>
                <option value="9:16">📱 Vertical 9:16 (TikTok / Reels / Shorts)</option>
                <option value="1:1">🟦 Square 1:1 (Instagram Feed / Linkedin)</option>
              </select>
            </div>

            {/* Config: Watermarks */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-semibold">Creator Copyright Watermark</label>
              <input
                type="text"
                value={projectSettings.watermarkText}
                onChange={(e) => updateProjectSettings({ watermarkText: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded focus:border-indigo-500 text-zinc-200"
                placeholder="e.g. ChartMotion AI Studio"
              />
            </div>

            {/* Config: Logo Drag/Click File Uploader */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-semibold block">Brand Overlay Logo (PNG/JPG)</label>
              <div className="relative border border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-900/20 p-4 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload size={18} className="text-zinc-500 mb-1" />
                <span className="text-[11px] text-zinc-300 font-medium">Click to upload logo sticker</span>
                <span className="text-[9px] text-zinc-500 mt-0.5">Anchored to top left of canvas</span>
              </div>

              {projectSettings.logoUrl && (
                <div className="flex items-center justify-between p-2 bg-indigo-950/25 border border-indigo-900 rounded-md">
                  <div className="flex items-center gap-2">
                    <img src={projectSettings.logoUrl} className="w-8 h-8 rounded border border-zinc-800 object-cover" />
                    <span className="text-[10px] text-zinc-400 truncate max-w-[120px]">Logo attached</span>
                  </div>
                  <button
                    onClick={() => updateProjectSettings({ logoUrl: undefined })}
                    className="text-[10px] text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider mb-1">
                Soundtrack Mixing Deck
              </h3>
              <p className="text-[11px] text-zinc-500">Audio plays synced with active preview</p>
            </div>

            {/* Select track list */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-semibold">Select Background Beat</label>
              <div className="flex flex-col gap-2">
                {PRESET_AUDIO.map((track) => {
                  const isSelected = projectSettings.selectedAudioId === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => updateProjectSettings({ selectedAudioId: track.id })}
                      className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/20 text-indigo-400 shadow'
                          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Music size={12} className={isSelected ? 'text-indigo-400' : 'text-zinc-500'} />
                        <div className="truncate">
                          <p className="text-[11px] font-bold text-zinc-200 truncate">{track.name}</p>
                          <p className="text-[9px] text-zinc-500 truncate">{track.artist}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-[9px] text-indigo-300 font-mono font-bold uppercase tracking-widest bg-indigo-950 px-1 py-0.5 rounded">
                          Mixer On
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Option to mute background audio */}
                <div
                  onClick={() => updateProjectSettings({ selectedAudioId: null })}
                  className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 transition ${
                    projectSettings.selectedAudioId === null
                      ? 'border-yellow-600 bg-yellow-950/10 text-yellow-500'
                      : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 text-zinc-400'
                  }`}
                >
                  <span>🔇 Mute Track (No Background Beat)</span>
                </div>
              </div>
            </div>

            {/* Gain slide mixer control */}
            {projectSettings.selectedAudioId && (
              <div className="space-y-2 pt-3 border-t border-zinc-900">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-semibold">Music Master Volume</span>
                  <span className="text-indigo-400 font-mono font-bold">
                    {Math.round(projectSettings.audioVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={projectSettings.audioVolume}
                  onChange={(e) => updateProjectSettings({ audioVolume: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
