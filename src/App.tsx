import React, { useState } from 'react';
import LeftSidebar from './components/LeftSidebar';
import PropertiesPanel from './components/PropertiesPanel';
import Spreadsheet from './components/Spreadsheet';
import TimelineEditor from './components/TimelineEditor';
import VideoCanvas from './components/VideoCanvas';
import ExportModal from './components/ExportModal';
import { Sparkles, Film, HelpCircle, Activity, Github, BookOpen } from 'lucide-react';

export default function App() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none overflow-hidden" id="app-root-container">
      
      {/* 1. Header Toolbar */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-950 px-6 flex items-center justify-between shrink-0 z-20 shadow-md">
        
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg" id="brand-logo-glow">
            <Film size={15} className="text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[15px] text-white tracking-tight">ChartMotion</span>
              <span className="px-1.5 py-0.5 text-[9px] bg-indigo-950 text-indigo-400 font-bold border border-indigo-900 rounded-md tracking-wider uppercase">
                Offline Render Eng v1.0
              </span>
            </div>
            <span className="text-[10px] text-zinc-500">Transform static logs & metrics tables into animated videos</span>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-3">
          {/* Diagnostic Info */}
          <div className="hidden md:flex items-center gap-1 bg-zinc-900 border border-zinc-900 px-2.5 py-1.5 rounded-lg text-[10px] text-zinc-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>WebGL Acceleration Active</span>
          </div>

          {/* Quick Help Guide */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg transition"
            title="SaaS User Manual & Guide"
          >
            <HelpCircle size={15} />
          </button>

          {/* Core Export Element */}
          <ExportModal />
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden h-[calc(100vh-160px)]">
        
        {/* Workspace Sidebar Left: Source Data, Asset Brand Kits, Audio Decks, Scenes */}
        <LeftSidebar />

        {/* Workspace Canvas Center (Split between Video Rendering Frame & Excel Grid) */}
        <div className="flex-1 flex flex-col bg-zinc-900/60 overflow-hidden relative">
          
          {/* Top Half: Rendering Live Preview Frame */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col">
            <VideoCanvas />
          </div>

          {/* Bottom Half: Fully Editable Spreadsheet */}
          <div className="h-62 p-4 pt-0 border-t border-zinc-805 bg-zinc-950 flex flex-col shrink-0">
            <Spreadsheet />
          </div>

        </div>

        {/* Workspace Sidebar Right: Axis Mappings, Segment Properties, Easing Algorithms, Titles */}
        <PropertiesPanel />

      </div>

      {/* 3. CapCut-style Bottom Linear Timeline Tracker */}
      <TimelineEditor />

      {/* 4. Interactive Quick-Start Manual Modal overlay */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowHelp(false)}>
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-400" /> ChartMotion User Playbook
              </h3>
              <button onClick={() => setShowHelp(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
            </div>
            
            <div className="space-y-3 text-xs leading-relaxed text-zinc-400 font-medium">
              <p>
                Welcome to <strong className="text-zinc-200">ChartMotion</strong>! An advanced template designer to craft high-impact vector animated statistics layouts completely offline right in your browser.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
                <li><strong className="text-zinc-300">Step 1: Check your Data.</strong> Open the <span className="text-indigo-400">Data</span> tab in the left sidebar. You can edit individual cells directly inside the bottom grid, add cols, or load a sample template instantly.</li>
                <li><strong className="text-zinc-300">Step 2: Bind Variables.</strong> Highlight an active scene inside the linear segment board and configure its category labels & values in the right pane.</li>
                <li><strong className="text-zinc-300">Step 3: Orchestrate Animations.</strong> Toggle vertical/horizontal bars, line draw times, and elastic springs.</li>
                <li><strong className="text-zinc-300">Step 4: Pack your Export.</strong> In the top navigation, click <span className="text-emerald-400">Design Export MP4</span> to render frame-by-frame. The video compile downloads automatically!</li>
              </ul>
            </div>

            <div className="pt-3 border-t border-zinc-900 flex justify-end">
              <button
                onClick={() => setShowHelp(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg text-xs font-semibold"
              >
                Dismiss Handbook
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
