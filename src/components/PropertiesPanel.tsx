import React from 'react';
import { useStore, THEME_CONFIGS } from '../store';
import { ChartType, EasingType, TransitionEffect, ThemePreset } from '../types';
import { Settings, Sliders, Type, Grid, Heart, Layout, Tag } from 'lucide-react';

export default function PropertiesPanel() {
  const {
    scenes,
    activeSceneId,
    updateScene,
    columns,
  } = useStore();

  const activeScene = scenes.find((s) => s.id === activeSceneId);

  if (!activeScene) {
    return (
      <div className="p-4 text-center text-zinc-500 text-xs bg-zinc-950 border-l border-zinc-900 h-full" id="properties-panel-empty">
        Select a scene in the bottom timeline to modify its animated video assets.
      </div>
    );
  }

  // Handle specific updates
  const handleChange = (field: keyof typeof activeScene, val: any) => {
    updateScene(activeScene.id, { [field]: val });
  };

  return (
    <div className="w-80 border-l border-zinc-800 bg-zinc-950 p-4 h-full overflow-y-auto space-y-5 select-none text-zinc-200" id="properties-panel">
      
      {/* Title Header */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <Settings size={14} className="text-indigo-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">
          Scene Architect
        </h3>
      </div>

      {/* SECTION: TEXT FIELDS */}
      <div className="space-y-3.5">
        <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
          <Type size={11} className="text-zinc-500" /> Annotations & Texts
        </h4>

        {/* Title */}
        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400 font-semibold">Scene Header Title</label>
          <input
            type="text"
            value={activeScene.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded focus:border-indigo-500 text-zinc-200"
            placeholder="e.g. Total Growth Overtime"
          />
        </div>

        {/* Subtitle */}
        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400 font-semibold">Scene Subtitle</label>
          <input
            type="text"
            value={activeScene.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded focus:border-indigo-500 text-zinc-200"
            placeholder="e.g. Google search user metrics"
          />
        </div>

        {/* Footnotes */}
        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400 font-semibold">Footnotes & Credits</label>
          <input
            type="text"
            value={activeScene.footnotes}
            onChange={(e) => handleChange('footnotes', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded focus:border-indigo-500 text-zinc-200"
            placeholder="e.g. ITU / World Bank metrics"
          />
        </div>

        {/* Source labeling */}
        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400 font-semibold">Y-Axis Source Label</label>
          <input
            type="text"
            value={activeScene.sourceText || ''}
            onChange={(e) => handleChange('sourceText', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded focus:border-indigo-500 text-zinc-200"
            placeholder="e.g. Users in Billions"
          />
        </div>
      </div>

      {/* SECTION: DATA BINDING */}
      <div className="space-y-3 pt-3 border-t border-zinc-900">
        <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
          <Tag size={11} className="text-zinc-500" /> Variable Bindings
        </h4>

        {/* Category Label column */}
        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400 font-semibold">Category Column (X-Axis)</label>
          <select
            value={activeScene.categoryColumn}
            onChange={(e) => handleChange('categoryColumn', e.target.value)}
            className="w-full px-2 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded focus:border-indigo-500 text-zinc-300"
          >
            {columns.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name} ({col.type === 'numeric' ? '123' : 'Abc'})
              </option>
            ))}
          </select>
        </div>

        {/* Value numerical columns */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[11px] text-zinc-400 font-semibold">Primary Value Column (Y-Axis)</label>
            <span className="text-[9px] bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Main Series</span>
          </div>
          <select
            value={activeScene.valueColumn}
            onChange={(e) => {
              const val = e.target.value;
              handleChange('valueColumn', val);
              // Also ensure it is in the valueColumns array as well
              const currentCols = activeScene.valueColumns || [];
              if (!currentCols.includes(val)) {
                handleChange('valueColumns', [...currentCols, val]);
              }
            }}
            className="w-full px-2 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded focus:border-indigo-500 text-zinc-300"
          >
            {columns.filter(c => c.name !== activeScene.categoryColumn && c.type === 'numeric').map((col) => (
              <option key={col.name} value={col.name}>
                {col.name}
              </option>
            ))}
          </select>
        </div>

        {/* Multi-Series check-list to overlay on the chart */}
        {columns.filter(c => c.type === 'numeric' && c.name !== activeScene.categoryColumn).length > 1 && (
          <div className="space-y-1.5 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/80">
            <label className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Compare Multiple Series (Dynamic Overlay)</label>
            <p className="text-[9.5px] text-zinc-500 mb-1.5 leading-tight">Check multiple columns to draw them together on the same canvas.</p>
            <div className="space-y-1 bg-zinc-950 p-2 rounded border border-zinc-900 max-h-[120px] overflow-y-auto font-mono">
              {columns.filter(c => c.type === 'numeric' && c.name !== activeScene.categoryColumn).map((col) => {
                const activeCols = activeScene.valueColumns || [activeScene.valueColumn];
                const isChecked = activeCols.includes(col.name);
                return (
                  <label key={col.name} className="flex items-center gap-2 text-[11px] text-zinc-300 cursor-pointer select-none py-1 hover:text-white transition">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        let newCols = [...activeCols];
                        if (e.target.checked) {
                          if (!newCols.includes(col.name)) newCols.push(col.name);
                        } else {
                          // Prevent clearing entirely, must have at least 1 series
                          if (newCols.length > 1) {
                            newCols = newCols.filter(c => c !== col.name);
                          }
                        }
                        handleChange('valueColumns', newCols);
                        if (newCols.length > 0 && !newCols.includes(activeScene.valueColumn)) {
                          handleChange('valueColumn', newCols[0]);
                        }
                      }}
                      className="rounded bg-zinc-900 border-zinc-850 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    <span className="truncate" title={col.name}>{col.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SECTION: CHART STYLIZATION */}
      <div className="space-y-3 pt-3 border-t border-zinc-900">
        <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
          <Sliders size={11} className="text-zinc-500" /> Chart Properties
        </h4>

        {/* Chart type */}
        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400 font-semibold">Active Chart Family</label>
          <select
            value={activeScene.chartType}
            onChange={(e) => handleChange('chartType', e.target.value as ChartType)}
            className="w-full px-2 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded focus:border-indigo-500 text-zinc-300 capitalize"
          >
            <option value="animated-line">📈 Animated Line</option>
            <option value="bar">📊 Vertical Bar Chart</option>
            <option value="horizontal-bar">📋 Horizontal Bar Chart</option>
            <option value="area">🏞️ Area Fill Chart</option>
            <option value="pie">🍕 Pie Chart</option>
            <option value="doughnut">🍩 Doughnut Chart</option>
            <option value="scatter">✨ Scatter Plot</option>
            <option value="stacked-bars">🧱 Stacked Bar Chart</option>
            <option value="bubble">🫧 Bubble Plot</option>
            <option value="bar-chart-race">🏇 Bar Chart Race</option>
            <option value="timeline">🎯 Large Counter Card</option>
          </select>
        </div>

        {/* Scene Duration */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <label className="text-zinc-400 font-semibold">Scene Segment Duration</label>
            <span className="text-indigo-400 font-mono font-bold">{activeScene.duration}s</span>
          </div>
          <input
            type="range"
            min="3"
            max="60"
            step="1"
            value={activeScene.duration}
            onChange={(e) => handleChange('duration', parseInt(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Scene Level Theme overrides */}
        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400 font-semibold">Visual Palette Theme</label>
          <select
            value={activeScene.theme}
            onChange={(e) => handleChange('theme', e.target.value as ThemePreset)}
            className="w-full px-2 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded focus:border-indigo-500 text-zinc-300 capitalize"
          >
            <option value="light">☀️ Slate Light</option>
            <option value="dark">🌙 Midnight Dark</option>
            <option value="apple"> Apple Core</option>
            <option value="bloomberg">🏥 Financial Bloomberg</option>
            <option value="youtube">📺 YouTube Red</option>
            <option value="minimal">🍂 Earth Minimal</option>
          </select>
        </div>
      </div>

      {/* SECTION: ANIMATION CONTROLS */}
      <div className="space-y-3 pt-3 border-t border-zinc-900">
        <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
          <Grid size={11} className="text-zinc-500" /> Motion Core Settings
        </h4>

        {/* Easing choice */}
        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400 font-semibold">Interpolator Easing</label>
          <select
            value={activeScene.easing}
            onChange={(e) => handleChange('easing', e.target.value as EasingType)}
            className="w-full px-2 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded focus:border-indigo-500 text-zinc-300 capitalize"
          >
            <option value="linear">Linear Uniform</option>
            <option value="ease">Smooth Ease Out</option>
            <option value="ease-in-out">Ease In Out (Dynamic)</option>
            <option value="spring">Elastic Spring</option>
          </select>
        </div>

        {/* Transition effects */}
        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400 font-semibold">Incoming Scene Transition</label>
          <select
            value={activeScene.transitionEffect}
            onChange={(e) => handleChange('transitionEffect', e.target.value as TransitionEffect)}
            className="w-full px-2 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded focus:border-indigo-500 text-zinc-300 capitalize"
          >
            <option value="fade">Dissolve Fade</option>
            <option value="slide">Horizontal Slide Swipe</option>
            <option value="zoom">Elastic Scale Zoom</option>
            <option value="none">Zero Transition Cut</option>
          </select>
        </div>

        {/* Grid and highest peaks checkboxes */}
        <div className="flex flex-col gap-2 pt-1">
          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={activeScene.highlightHighest}
              onChange={(e) => handleChange('highlightHighest', e.target.checked)}
              className="rounded bg-zinc-900 border-zinc-800 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Highlight Peak Core Value</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={activeScene.showGridLines}
              onChange={(e) => handleChange('showGridLines', e.target.checked)}
              className="rounded bg-zinc-900 border-zinc-800 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Enable Layout Gridlines</span>
          </label>
        </div>
      </div>

    </div>
  );
}
