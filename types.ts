export enum Screen {
  ENROLLMENT = 'ENROLLMENT',
  TRAINING = 'TRAINING',
  GUESS = 'GUESS',
  GLOBAL_BRAIN = 'GLOBAL_BRAIN',
}

export interface CapturedImage {
  id: string;
  original: string; // Base64
  lbpProcessed: string; // Base64 (Simulated LBP view)
}

export interface UserProfile {
  name: string;
  images: CapturedImage[];
  isTrained: boolean;
}

export interface UserSummary {
  id: number;
  name: string;
  thumbnail: string; // Base64 of the first sample
  sample_count: number;
  last_updated: string;
}

export interface HistogramData {
  bin: number;
  value: number;
}