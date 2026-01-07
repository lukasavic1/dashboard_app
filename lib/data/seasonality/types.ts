export interface SeasonalityResult {
  assetId: string;
  date: Date;
  score: number; // raw score
  normalizedScore: number; // normalized to [-50, +50]
  activeWindows: {
    startMonth: number;
    endMonth: number;
    score: number;
    note?: string;
  }[];
}
