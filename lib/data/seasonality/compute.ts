import { SEASONALITY_RULES } from "./definitions";
import { SeasonalityResult } from "./types";

function isMonthInRange(
  month: number,
  start: number,
  end: number
): boolean {
  if (start <= end) {
    return month >= start && month <= end;
  }
  // handles wrap-around (e.g. Nov–Feb)
  return month >= start || month <= end;
}

export function computeSeasonality(
  assetId: string,
  date: Date = new Date()
): SeasonalityResult {
  const rules = SEASONALITY_RULES[assetId] ?? [];
  const month = date.getMonth() + 1;

  const active = rules.filter(rule =>
    isMonthInRange(month, rule.startMonth, rule.endMonth)
  );

  const score = active.reduce((sum, r) => sum + r.score, 0);

  return {
    assetId,
    date,
    score,
    activeWindows: active,
  };
}
