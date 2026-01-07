// lib/processing/cot/analysis.ts

import { ParsedCot } from "@/lib/data/cot/parse";

export interface CotAnalysis {
  score: number; // -100 to +100
  bias: 'Strongly Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strongly Bearish';
  notes: string[];
  metrics: {
    commercial: {
      netPosition: number;
      netChange: number;
      isExtreme: boolean;
      cotIndex: number;
    };
    nonCommercial: {
      netPosition: number;
      netChange: number;
      isExtreme: boolean;
      isCrowded: boolean;
    };
    smallTrader: {
      netPosition: number;
      isExtreme: boolean;
    };
    openInterest: number;
    openInterestChange: number;
  };
}

/**
 * Calculates COT Index (0-100) for a position
 */
function calculateCotIndex(
  current: number,
  historicalMin: number,
  historicalMax: number
): number {
  if (historicalMax === historicalMin) return 50;
  return ((current - historicalMin) / (historicalMax - historicalMin)) * 100;
}

/**
 * Determines if a position is at an extreme (top/bottom 10%)
 */
function isExtreme(index: number): boolean {
  return index >= 90 || index <= 10;
}

/**
 * Determines if non-commercials are crowded (extreme positioning)
 */
function isCrowded(index: number): boolean {
  return index >= 85 || index <= 15;
}

export function computeCotAnalysis(history: ParsedCot[]): CotAnalysis {
  if (history.length < 2) {
    throw new Error("Need at least 2 weeks of history for analysis");
  }

  const current = history[history.length - 1];
  const previous = history[history.length - 2];

  // Calculate net positions
  const commercialNet = current.commercialLong - current.commercialShort;
  const commercialNetPrev = previous.commercialLong - previous.commercialShort;
  const commercialNetChange = commercialNet - commercialNetPrev;

  const nonCommercialNet = current.nonCommercialLong - current.nonCommercialShort;
  const nonCommercialNetPrev = previous.nonCommercialLong - previous.nonCommercialShort;
  const nonCommercialNetChange = nonCommercialNet - nonCommercialNetPrev;

  const smallTraderNet = current.smallTraderLong - current.smallTraderShort;

  // Calculate historical ranges
  const commercialNets = history.map(h => h.commercialLong - h.commercialShort);
  const nonCommercialNets = history.map(h => h.nonCommercialLong - h.nonCommercialShort);
  const smallTraderNets = history.map(h => h.smallTraderLong - h.smallTraderShort);

  const commercialMin = Math.min(...commercialNets);
  const commercialMax = Math.max(...commercialNets);
  const nonCommercialMin = Math.min(...nonCommercialNets);
  const nonCommercialMax = Math.max(...nonCommercialNets);
  const smallTraderMin = Math.min(...smallTraderNets);
  const smallTraderMax = Math.max(...smallTraderNets);

  // Calculate indices
  const commercialIndex = calculateCotIndex(commercialNet, commercialMin, commercialMax);
  const nonCommercialIndex = calculateCotIndex(nonCommercialNet, nonCommercialMin, nonCommercialMax);
  const smallTraderIndex = calculateCotIndex(smallTraderNet, smallTraderMin, smallTraderMax);

  // Determine extremes
  const commercialExtreme = isExtreme(commercialIndex);
  const nonCommercialExtreme = isExtreme(nonCommercialIndex);
  const nonCommercialCrowded = isCrowded(nonCommercialIndex);
  const smallTraderExtreme = isExtreme(smallTraderIndex);

  // Calculate open interest change
  const openInterestChange = current.openInterest - previous.openInterest;

  // Scoring Model
  let score = 0;

  // Commercials (50% weight)
  if (commercialNetChange > 0) {
    score += 20; // Increasing net longs
  } else if (commercialNetChange < 0) {
    score -= 20; // Decreasing net longs
  }

  if (commercialExtreme) {
    score += 10; // At historical extreme
  }

  if (commercialExtreme && nonCommercialCrowded) {
    score += 15; // Extreme commercials + spec crowding
  }

  // Non-Commercials (30% weight)
  const nonCommercialChangeAbs = Math.abs(nonCommercialNetChange);
  const moderateThreshold = Math.abs(nonCommercialNet) * 0.05; // 5% of current position
  const aggressiveThreshold = Math.abs(nonCommercialNet) * 0.15; // 15% of current position

  if (nonCommercialNetChange > 0) {
    if (nonCommercialChangeAbs <= aggressiveThreshold) {
      score += 10; // Moderate increase
    } else {
      score -= 10; // Aggressive increase (late-trend risk)
    }
  }

  if (nonCommercialExtreme) {
    score -= 20; // Net extreme (contrarian warning)
  }

  // Check if reducing longs after extreme (bullish reversal)
  if (nonCommercialIndex > 85 && nonCommercialNetChange < 0) {
    score += 10; // Reducing longs after extreme
  }

  // Small Traders (20% weight)
  if (smallTraderExtreme) {
    if (smallTraderNet > 0) {
      score -= 10; // Extremely long (bearish)
    } else {
      score += 10; // Extremely short (bullish)
    }
  }

  // Clamp score to [-100, +100]
  score = Math.max(-100, Math.min(100, score));

  // Determine bias
  let bias: CotAnalysis['bias'];
  if (score >= 60) {
    bias = 'Strongly Bullish';
  } else if (score >= 25) {
    bias = 'Bullish';
  } else if (score <= -60) {
    bias = 'Strongly Bearish';
  } else if (score <= -25) {
    bias = 'Bearish';
  } else {
    bias = 'Neutral';
  }

  return {
    score,
    bias,
    notes: [], // Will be populated by Claude API
    metrics: {
      commercial: {
        netPosition: commercialNet,
        netChange: commercialNetChange,
        isExtreme: commercialExtreme,
        cotIndex: commercialIndex,
      },
      nonCommercial: {
        netPosition: nonCommercialNet,
        netChange: nonCommercialNetChange,
        isExtreme: nonCommercialExtreme,
        isCrowded: nonCommercialCrowded,
      },
      smallTrader: {
        netPosition: smallTraderNet,
        isExtreme: smallTraderExtreme,
      },
      openInterest: current.openInterest,
      openInterestChange: openInterestChange,
    },
  };
}
