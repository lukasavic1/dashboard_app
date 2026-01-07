// lib/data/seasonality/utils.ts

export type SeasonalityBias = 
  | 'Strongly Bullish' 
  | 'Bullish' 
  | 'Neutral' 
  | 'Bearish' 
  | 'Strongly Bearish';

/**
 * Converts a seasonality score (-1 to +1) to a bias label
 */
export function scoreToBias(score: number): SeasonalityBias {
  if (score >= 0.5) return 'Strongly Bullish';
  if (score >= 0.2) return 'Bullish';
  if (score <= -0.5) return 'Strongly Bearish';
  if (score <= -0.2) return 'Bearish';
  return 'Neutral';
}

/**
 * Gets the color classes for a bias
 */
export function biasColor(bias: SeasonalityBias): string {
  switch (bias) {
    case 'Strongly Bullish':
      return 'text-green-700 bg-green-100 border-green-300';
    case 'Bullish':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'Neutral':
      return 'text-yellow-700 bg-yellow-100 border-yellow-300';
    case 'Bearish':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'Strongly Bearish':
      return 'text-red-700 bg-red-100 border-red-300';
  }
}
