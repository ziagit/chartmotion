export type ColumnType = 'numeric' | 'category' | 'date';

export interface ColumnInfo {
  name: string;
  type: ColumnType;
}

export interface DataRow {
  [key: string]: string | number;
}

export type ThemePreset = 'light' | 'dark' | 'apple' | 'bloomberg' | 'youtube' | 'minimal';

export interface ThemeConfig {
  background: string;
  gridColor: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontStack: string;
  textPrimary: string;
  textSecondary: string;
}

export type ChartType =
  | 'bar'
  | 'horizontal-bar'
  | 'line'
  | 'area'
  | 'pie'
  | 'doughnut'
  | 'scatter'
  | 'bubble'
  | 'stacked-bars'
  | 'bar-chart-race'
  | 'animated-line'
  | 'timeline';

export type EasingType = 'linear' | 'ease' | 'ease-in-out' | 'spring';
export type TransitionEffect = 'fade' | 'slide' | 'zoom' | 'none';
export type AspectRatio = '16:9' | '9:16' | '1:1';
export type ExportFormat = 'mp4' | 'webm' | 'gif';
export type ExportQuality = '720p' | '1080p' | '2K' | '4K';

export interface Scene {
  id: string;
  title: string;
  subtitle: string;
  footnotes: string;
  sourceText: string;
  chartType: ChartType;
  duration: number; // in seconds
  categoryColumn: string;
  valueColumn: string;
  valueColumns?: string[]; // for multi-series charts (e.g. Google, Facebook, Bing)
  valueColumn2?: string; // for scatter/bubble
  sizeColumn?: string; // for bubble
  highlightHighest: boolean;
  showGridLines: boolean;
  easing: EasingType;
  transitionEffect: TransitionEffect;
  theme: ThemePreset;
  logoOverlay?: string; // base64 URL
  watermarkText?: string;
  speed: number; // 1, 1.5, 2
}

export interface AudioTrack {
  id: string;
  name: string;
  url: string;
  type: 'music' | 'voiceover';
  volume: number;
}
