
export interface CompressionSettings {
  quality: number; // 0.1 to 1.0
  scale: number;   // 0.5 to 3.0
}

export interface ProcessingResult {
  url: string;
  originalSize: number;
  compressedSize: number;
  fileName: string;
  reduction: number;
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
