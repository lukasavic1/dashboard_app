import { ScoringConfig, CombinedBiasResult, BiasLabel } from './types';

const DEFAULT_CONFIG: ScoringConfig = {
  cotWeight: 0.7,
  seasonalityWeight: 0.3,
  convictionBoostThreshold: 70,
  convictionBoostAmount: 10,
};

function scoreToBias(score: number): BiasLabel {
  if (score >= 60) return 'Strongly Bullish';
  if (score >= 25) return 'Bullish';
  if (score > -25) return 'Neutral';
  if (score > -60) return 'Bearish';
  return 'Strongly Bearish';
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function sign(value: number): number {
  if (value > 0) return 1;
  if (value < 0) return -1;
  return 0;
}

export function computeFinalBias(
  cotScore: number,
  seasonalityScore: number,
  cotBias: string,
  seasonalityBias: string,
  config: ScoringConfig = DEFAULT_CONFIG
): CombinedBiasResult {
  // Validate inputs are in range
  if (cotScore < -100 || cotScore > 100) {
    throw new Error(`COT score must be in range [-100, 100], got ${cotScore}`);
  }
  if (seasonalityScore < -50 || seasonalityScore > 50) {
    throw new Error(`Seasonality score must be in range [-50, 50], got ${seasonalityScore}`);
  }

  // Calculate weighted contributions
  const cotContribution = cotScore * config.cotWeight;
  const seasonalityContribution = seasonalityScore * config.seasonalityWeight;

  // Base score before conviction boost
  const baseScore = cotContribution + seasonalityContribution;

  // Check conviction boost conditions
  const cotSign = sign(cotScore);
  const seasonalitySign = sign(seasonalityScore);
  const convictionBoostApplied =
    Math.abs(cotScore) >= config.convictionBoostThreshold &&
    cotSign === seasonalitySign &&
    cotSign !== 0;

  // Apply conviction boost if conditions met
  let convictionBoostAmount = 0;
  if (convictionBoostApplied) {
    convictionBoostAmount = cotSign * config.convictionBoostAmount;
  }

  // Calculate final score with boost and clamp to [-100, +100]
  const finalScore = clamp(baseScore + convictionBoostAmount, -100, 100);

  // Map to bias label
  const finalBias = scoreToBias(finalScore);

  return {
    finalScore,
    finalBias,
    breakdown: {
      cotScore,
      cotBias,
      cotContribution,
      seasonalityScore,
      seasonalityBias,
      seasonalityContribution,
      baseScore,
      convictionBoostApplied,
      convictionBoostAmount,
    },
  };
}
