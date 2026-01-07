export interface SeasonalityResult {
  assetId: string;
  date: Date;
  score: number;
  activeWindows: {
    startMonth: number;
    endMonth: number;
    score: number;
    note?: string;
  }[];
}
