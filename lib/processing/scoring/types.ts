export interface ScoringConfig {
  cotWeight: number; // default 0.7
  seasonalityWeight: number; // default 0.3
  convictionBoostThreshold: number; // default 70
  convictionBoostAmount: number; // default 10
}

export interface CombinedBiasResult {
  finalScore: number;
  finalBias: 'Strongly Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strongly Bearish';
  breakdown: {
    cotScore: number;
    cotBias: string;
    cotContribution: number;
    seasonalityScore: number;
    seasonalityBias: string;
    seasonalityContribution: number;
    baseScore: number;
    convictionBoostApplied: boolean;
    convictionBoostAmount: number;
  };
}

export type BiasLabel = 'Strongly Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strongly Bearish';
