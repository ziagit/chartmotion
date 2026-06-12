import { create } from 'zustand';
import { Scene, ColumnInfo, DataRow, ThemePreset, ThemeConfig, AspectRatio, ExportFormat, ExportQuality, ChartType, EasingType, TransitionEffect } from './types';

// Precise Theme Configuration definitions
export const THEME_CONFIGS: Record<ThemePreset, ThemeConfig> = {
  light: {
    background: '#f8fafc', // slate-50
    gridColor: '#e2e8f0', // slate-200
    primaryColor: '#3b82f6', // blue-500
    secondaryColor: '#10b981', // emerald-500
    accentColor: '#6366f1', // indigo-500
    fontStack: 'sans-serif',
    textPrimary: '#0f172a', // slate-900
    textSecondary: '#64748b', // slate-500
  },
  dark: {
    background: '#09090b', // zinc-950
    gridColor: '#334155', // slate-700
    primaryColor: '#f97316', // orange-500
    secondaryColor: '#a855f7', // purple-500
    accentColor: '#ec4899', // pink-500
    fontStack: 'sans-serif',
    textPrimary: '#f8fafc', // slate-50
    textSecondary: '#94a3b8', // slate-400
  },
  apple: {
    background: '#f5f5f7', // Apple silver-gray
    gridColor: '#d2d2d7',
    primaryColor: '#1d1d1f', // obsidian
    secondaryColor: '#86868b', // aluminum
    accentColor: '#0071e3', // Apple Blue
    fontStack: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
    textPrimary: '#1d1d1f',
    textSecondary: '#86868b',
  },
  bloomberg: {
    background: '#090d16', // Bloomberg terminal charcoal
    gridColor: '#1a2436',
    primaryColor: '#ff9900', // Bloomberg Amber
    secondaryColor: '#00ff33', // Terminal Green
    accentColor: '#00bcff', // Terminal Cyan
    fontStack: 'monospace, Menlo, Courier',
    textPrimary: '#ffffff',
    textSecondary: '#a5b4fc',
  },
  youtube: {
    background: '#0f0f0f', // YouTube Dark
    gridColor: '#272727',
    primaryColor: '#ff0000', // YouTube Red
    secondaryColor: '#ffffff',
    accentColor: '#aaaaaa',
    fontStack: 'sans-serif',
    textPrimary: '#ffffff',
    textSecondary: '#aaaaaa',
  },
  minimal: {
    background: '#FAF6F0', // warm cream
    gridColor: '#E6DFD5',
    primaryColor: '#2C2A29', // warm charcoal
    secondaryColor: '#606C38', // earth olive
    accentColor: '#BC6C25', // terracotta
    fontStack: 'Georgia, serif',
    textPrimary: '#2C2A29',
    textSecondary: '#8F8574',
  },
};

// Preset audio tracks
export const PRESET_AUDIO: { id: string; name: string; url: string; artist: string }[] = [
  { id: 'track-1', name: 'Ambient Corporate Rise', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', artist: 'SaaS Beat' },
  { id: 'track-2', name: 'Upbeat Tech Showcase', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', artist: 'Synthy Flow' },
];

// Sample data preset
const SAMPLE_DATA: DataRow[] = [
  { Year: '2006', 'Google Search Users (Billions)': 0.63, 'Growth %': 0 },
  { Year: '2007', 'Google Search Users (Billions)': 0.78, 'Growth %': 23.8 },
  { Year: '2008', 'Google Search Users (Billions)': 1.01, 'Growth %': 29.5 },
  { Year: '2009', 'Google Search Users (Billions)': 1.25, 'Growth %': 23.8 },
  { Year: '2010', 'Google Search Users (Billions)': 1.46, 'Growth %': 16.8 },
  { Year: '2011', 'Google Search Users (Billions)': 1.67, 'Growth %': 14.4 },
  { Year: '2012', 'Google Search Users (Billions)': 1.89, 'Growth %': 13.1 },
  { Year: '2013', 'Google Search Users (Billions)': 2.12, 'Growth %': 12.1 },
  { Year: '2014', 'Google Search Users (Billions)': 2.35, 'Growth %': 10.8 },
  { Year: '2015', 'Google Search Users (Billions)': 2.58, 'Growth %': 9.8 },
  { Year: '2016', 'Google Search Users (Billions)': 2.81, 'Growth %': 8.9 },
  { Year: '2017', 'Google Search Users (Billions)': 3.04, 'Growth %': 8.2 },
  { Year: '2018', 'Google Search Users (Billions)': 3.27, 'Growth %': 7.6 },
  { Year: '2019', 'Google Search Users (Billions)': 3.50, 'Growth %': 7.0 },
  { Year: '2020', 'Google Search Users (Billions)': 3.85, 'Growth %': 10.0 },
  { Year: '2021', 'Google Search Users (Billions)': 4.21, 'Growth %': 9.35 },
  { Year: '2022', 'Google Search Users (Billions)': 4.58, 'Growth %': 8.78 },
  { Year: '2023', 'Google Search Users (Billions)': 4.96, 'Growth %': 8.29 },
  { Year: '2024', 'Google Search Users (Billions)': 5.35, 'Growth %': 7.86 },
];

const SAMPLE_COLUMNS: ColumnInfo[] = [
  { name: 'Year', type: 'category' },
  { name: 'Google Search Users (Billions)', type: 'numeric' },
  { name: 'Growth %', type: 'numeric' },
];

export interface ProjectSettings {
  name: string;
  fps: 24 | 30 | 60;
  aspectRatio: AspectRatio;
  exportQuality: ExportQuality;
  exportFormat: ExportFormat;
  selectedAudioId: string | null;
  audioVolume: number;
  watermarkText: string;
  logoUrl?: string; // base64 / state
}

interface ChartMotionState {
  // Data
  data: DataRow[];
  columns: ColumnInfo[];
  
  // Scenes
  scenes: Scene[];
  activeSceneId: string;
  
  // Timeline Playback
  currentTime: number; // in seconds
  isPlaying: boolean;
  playbackSpeed: number; // 1, 1.5, 2
  
  // Settings
  projectSettings: ProjectSettings;
  
  // Base64 Watermarks/Logo helpers
  logoFile: File | null;
  
  // Actions
  setData: (data: DataRow[], columns: ColumnInfo[]) => void;
  updateCell: (rowIndex: number, column: string, value: string | number) => void;
  addRow: () => void;
  deleteRow: (index: number) => void;
  addColumn: (name: string, type: 'numeric' | 'category' | 'date') => void;
  deleteColumn: (name: string) => void;
  
  // Scene actions
  addScene: (scene?: Partial<Scene>) => void;
  updateScene: (id: string, scene: Partial<Scene>) => void;
  deleteScene: (id: string) => void;
  setActiveSceneId: (id: string) => void;
  reorderScenes: (scenes: Scene[]) => void;
  
  // Playback control
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  
  // Project Setting actions
  updateProjectSettings: (settings: Partial<ProjectSettings>) => void;
  setLogoFile: (file: File | null, b64Url?: string) => void;
}

export const useStore = create<ChartMotionState>((set, get) => {
  const initialScenes: Scene[] = [
    {
      id: 'scene-1',
      title: 'Google Search User Explosion',
      subtitle: 'Estimated active annual search users worldwide',
      footnotes: 'Sources include ITU, Google disclosures, and industry analysis.',
      sourceText: 'Google Search Engine Growth (Billions)',
      chartType: 'animated-line',
      duration: 10,
      categoryColumn: 'Year',
      valueColumn: 'Google Search Users (Billions)',
      valueColumns: ['Google Search Users (Billions)'],
      highlightHighest: true,
      showGridLines: true,
      easing: 'ease-in-out',
      transitionEffect: 'fade',
      theme: 'bloomberg',
      speed: 1,
    },
    {
      id: 'scene-2',
      title: 'Growth Rate Stabilization',
      subtitle: 'Year-over-year active user count percentage change',
      footnotes: 'Early rapid growth normalized as internet saturation peaked.',
      sourceText: 'Annualized Growth Rate (%)',
      chartType: 'bar',
      duration: 8,
      categoryColumn: 'Year',
      valueColumn: 'Growth %',
      valueColumns: ['Growth %'],
      highlightHighest: true,
      showGridLines: true,
      easing: 'spring',
      transitionEffect: 'slide',
      theme: 'apple',
      speed: 1,
    },
    {
      id: 'scene-3',
      title: 'Current Giant Scale',
      subtitle: 'Milestone Achievement Counter',
      footnotes: 'Reaching over two-thirds of the world’s online population.',
      sourceText: '5.35 Billion Global Users',
      chartType: 'timeline', // Used as custom number counter indicator
      duration: 5,
      categoryColumn: 'Year',
      valueColumn: 'Google Search Users (Billions)',
      valueColumns: ['Google Search Users (Billions)'],
      highlightHighest: false,
      showGridLines: false,
      easing: 'ease',
      transitionEffect: 'zoom',
      theme: 'minimal',
      speed: 1,
    }
  ];

  return {
    data: SAMPLE_DATA,
    columns: SAMPLE_COLUMNS,
    scenes: initialScenes,
    activeSceneId: 'scene-1',
    currentTime: 0,
    isPlaying: false,
    playbackSpeed: 1,
    projectSettings: {
      name: 'My Chart Animation',
      fps: 30,
      aspectRatio: '16:9',
      exportQuality: '1080p',
      exportFormat: 'mp4',
      selectedAudioId: 'track-1',
      audioVolume: 0.5,
      watermarkText: 'ChartMotion AI',
    },
    logoFile: null,

    setData: (data, columns) => set((state) => {
      // Find fallback category and numeric columns
      const catCol = columns.find(c => c.type === 'category' || c.type === 'date')?.name || columns[0]?.name || '';
      // EXCLUDE the category column (e.g. 'Year') from being treated as a numeric Y-axis value
      const numCols = columns.filter(c => c.type === 'numeric' && c.name !== catCol);
      const valCol1 = numCols[0]?.name || columns.find(c => c.name !== catCol)?.name || columns[0]?.name || '';
      const valCol2 = numCols[1]?.name || valCol1;

      // Update all scenes to ensure and preserve their column selection if valid,
      // or fallback to correct matching columns if not found in the new CSV.
      const updatedScenes = state.scenes.map((scene, idx) => {
        const hasCategory = columns.some(c => c.name === scene.categoryColumn);
        const hasValue = columns.some(c => c.name === scene.valueColumn && c.name !== scene.categoryColumn);

        const newCategory = hasCategory ? scene.categoryColumn : catCol;
        let newValue = scene.valueColumn;
        if (!hasValue || newValue === newCategory) {
          if (idx === 1 && numCols.length > 1) {
            newValue = valCol2;
          } else {
            newValue = valCol1;
          }
        }

        // Handle multi-series synchronization (excluding current category column)
        let newValueColumns = (scene.valueColumns || []).filter(colName =>
          colName !== newCategory && columns.some(c => c.name === colName && c.type === 'numeric')
        );

        // If newly uploaded data has multiple numeric columns, assign them up to 3 columns to compare (excluding category)
        if (numCols.length > 1) {
          newValueColumns = numCols.slice(0, 4).map(c => c.name);
        } else {
          newValueColumns = [newValue];
        }

        const isGoogleDefault = scene.title.includes('Google Search') || scene.title.includes('Growth Rate') || scene.title.includes('Giant Scale') || scene.title.includes('Comparison') || scene.title.includes('Trend Analysis');
        const dynamicTitle = isGoogleDefault
          ? (numCols.length > 1 
              ? `${numCols.map(c => c.name.split(' ')[0]).join(' vs ')} Comparison`
              : `${newValue} Trend Analysis`
            )
          : scene.title;

        const dynamicSubtitle = isGoogleDefault && numCols.length > 1
          ? `Comparative metrics over the years`
          : scene.subtitle;

        return {
          ...scene,
          categoryColumn: newCategory,
          valueColumn: newValue,
          valueColumns: newValueColumns,
          title: dynamicTitle,
          subtitle: dynamicSubtitle,
          sourceText: numCols.length > 1
            ? `${numCols.map(c => c.name.split(' ')[0]).join(' / ')} Statistics`
            : (scene.sourceText.includes('Google Search') && columns[1]?.name ? columns[1].name : scene.sourceText),
        };
      });

      return {
        data,
        columns,
        scenes: updatedScenes,
      };
    }),
    
    updateCell: (rowIndex, column, value) => set((state) => {
      const updatedData = [...state.data];
      // Convert to number if numeric column
      const colInfo = state.columns.find((c) => c.name === column);
      let parsedValue: string | number = value;
      if (colInfo?.type === 'numeric') {
        const num = parseFloat(value as string);
        parsedValue = isNaN(num) ? 0 : num;
      }
      updatedData[rowIndex] = {
        ...updatedData[rowIndex],
        [column]: parsedValue,
      };
      return { data: updatedData };
    }),

    addRow: () => set((state) => {
      const newRow: DataRow = {};
      state.columns.forEach((col) => {
        newRow[col.name] = col.type === 'numeric' ? 0 : '';
      });
      return { data: [...state.data, newRow] };
    }),

    deleteRow: (index) => set((state) => {
      const updatedData = state.data.filter((_, i) => i !== index);
      return { data: updatedData };
    }),

    addColumn: (name, type) => set((state) => {
      if (state.columns.some((c) => c.name === name)) return {}; // Prevent duplicate col names
      const updatedColumns = [...state.columns, { name, type }];
      const updatedData = state.data.map((row) => ({
        ...row,
        [name]: type === 'numeric' ? 0 : '',
      }));
      return { columns: updatedColumns, data: updatedData };
    }),

    deleteColumn: (name) => set((state) => {
      const updatedColumns = state.columns.filter((c) => c.name !== name);
      const updatedData = state.data.map((row) => {
        const newRow = { ...row };
        delete newRow[name];
        return newRow;
      });

      const catCol = updatedColumns.find(c => c.type === 'category' || c.type === 'date')?.name || updatedColumns[0]?.name || '';
      const numCols = updatedColumns.filter(c => c.type === 'numeric' && c.name !== catCol);
      const valCol1 = numCols[0]?.name || updatedColumns.find(c => c.name !== catCol)?.name || updatedColumns[0]?.name || '';

      const updatedScenes = state.scenes.map((scene) => {
        const hasCategory = updatedColumns.some(c => c.name === scene.categoryColumn);
        const resolvedCategoryColumn = hasCategory ? scene.categoryColumn : catCol;
        
        let hasValue = updatedColumns.some(c => c.name === scene.valueColumn && c.name !== resolvedCategoryColumn);
        const resolvedValueColumn = hasValue ? scene.valueColumn : valCol1;

        const currentCols = scene.valueColumns || [];
        const resolvedValueColumns = currentCols
          .filter(colName => colName !== resolvedCategoryColumn && updatedColumns.some(c => c.name === colName && c.type === 'numeric'));

        return {
          ...scene,
          categoryColumn: resolvedCategoryColumn,
          valueColumn: resolvedValueColumn,
          valueColumns: resolvedValueColumns.length > 0 ? resolvedValueColumns : [resolvedValueColumn],
        };
      });

      return { columns: updatedColumns, data: updatedData, scenes: updatedScenes };
    }),

    // Scene management
    addScene: (customScene) => set((state) => {
      const id = 'scene-' + Date.now();
      const defaultScene: Scene = {
        id,
        title: 'New Scene Title',
        subtitle: 'Scene details description text',
        footnotes: 'Data source label',
        sourceText: 'Value Index',
        chartType: 'bar',
        duration: 8,
        categoryColumn: state.columns[0]?.name || '',
        valueColumn: state.columns[1]?.name || '',
        highlightHighest: false,
        showGridLines: true,
        easing: 'ease-in-out',
        transitionEffect: 'fade',
        theme: 'light',
        speed: 1,
      };
      const newScene = { ...defaultScene, ...customScene };
      return {
        scenes: [...state.scenes, newScene],
        activeSceneId: id,
      };
    }),

    updateScene: (id, updatedFields) => set((state) => {
      const updatedScenes = state.scenes.map((s) =>
        s.id === id ? { ...s, ...updatedFields } : s
      );
      return { scenes: updatedScenes };
    }),

    deleteScene: (id) => set((state) => {
      const remainingScenes = state.scenes.filter((s) => s.id !== id);
      const nextActiveId = remainingScenes[0]?.id || '';
      return {
        scenes: remainingScenes,
        activeSceneId: nextActiveId,
      };
    }),

    setActiveSceneId: (id) => set({ activeSceneId: id }),
    reorderScenes: (scenes) => set({ scenes }),

    // Playback
    setCurrentTime: (time) => set({ currentTime: time }),
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),

    // Settings
    updateProjectSettings: (settings) => set((state) => ({
      projectSettings: { ...state.projectSettings, ...settings },
    })),

    setLogoFile: (file, b64Url) => set((state) => ({
      logoFile: file,
      projectSettings: {
        ...state.projectSettings,
        logoUrl: b64Url,
      },
    })),
  };
});
