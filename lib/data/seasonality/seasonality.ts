export type SeasonalityBias = 'Bullish' | 'Neutral' | 'Bearish'

export interface SeasonalityResult {
  score: number
  bias: SeasonalityBias
  notes: string[]
}

const MONTH_RULES: Record<number, { score: number; note: string }> = {
  1: { score: 10, note: 'January strength after year-end positioning' },
  2: { score: 5, note: 'Continuation of early-year momentum' },
  3: { score: 15, note: 'Strong seasonal tendencies in Q1' },
  4: { score: 20, note: 'Historically one of the strongest months' },
  5: { score: -5, note: 'Sell in May seasonal weakness begins' },
  6: { score: -10, note: 'Early summer demand slowdown' },
  7: { score: 5, note: 'Mid-summer bounce often occurs' },
  8: { score: -15, note: 'Low liquidity and seasonal weakness' },
  9: { score: -20, note: 'Historically weakest month' },
  10:{ score: 10, note: 'Volatility bottoming, recovery phase' },
  11:{ score: 20, note: 'Strong post-election / year-end flows' },
  12:{ score: 15, note: 'Year-end positioning and window dressing' },
}

export function calculateSeasonality(date = new Date()): SeasonalityResult {
  const month = date.getMonth() + 1
  const rule = MONTH_RULES[month]

  let bias: SeasonalityBias = 'Neutral'
  if (rule.score > 10) bias = 'Bullish'
  else if (rule.score < -10) bias = 'Bearish'

  return {
    score: rule.score,
    bias,
    notes: [rule.note],
  }
}
