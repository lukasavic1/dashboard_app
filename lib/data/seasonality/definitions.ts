export interface SeasonalWindow {
  startMonth: number; // 1–12
  endMonth: number;   // 1–12
  score: number;      // -1 to +1
  note?: string;
}

export const SEASONALITY_RULES: Record<string, SeasonalWindow[]> = {
  CL: [
    {
      startMonth: 2,
      endMonth: 6,
      score: 0.6,
      note: "Spring demand / driving season buildup",
    },
    {
      startMonth: 9,
      endMonth: 11,
      score: -0.5,
      note: "Refinery maintenance / demand slowdown",
    },
  ],

  ZS: [
    {
      startMonth: 4,
      endMonth: 6,
      score: -0.6,
      note: "Planting uncertainty",
    },
    {
      startMonth: 10,
      endMonth: 12,
      score: 0.5,
      note: "Post-harvest strength",
    },
  ],

  ZC: [
    {
      startMonth: 5,
      endMonth: 7,
      score: -0.5,
      note: "Crop progress pressure",
    },
    {
      startMonth: 11,
      endMonth: 2,
      score: 0.4,
      note: "Storage & demand season",
    },
  ],

  ZW: [
    {
      startMonth: 6,
      endMonth: 8,
      score: -0.4,
      note: "Harvest pressure",
    },
  ],

  GC: [
    {
      startMonth: 8,
      endMonth: 10,
      score: 0.4,
      note: "Jewelry & festival demand",
    },
  ],

  SI: [
    {
      startMonth: 1,
      endMonth: 3,
      score: 0.3,
      note: "Industrial restocking",
    },
  ],

  KC: [
    {
      startMonth: 1,
      endMonth: 3,
      score: 0.5,
      note: "Frost risk in Brazil / supply concerns",
    },
    {
      startMonth: 7,
      endMonth: 9,
      score: -0.4,
      note: "Harvest pressure from Brazil",
    },
  ],
};
