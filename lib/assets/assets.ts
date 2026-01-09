// lib/assets/assets.ts

export const ASSETS = [
  { id: "CL", name: "Crude Oil", cotCode: "067651", seasonality: true },
  { id: "GC", name: "Gold", cotCode: "088691", seasonality: true },
  { id: "SI", name: "Silver", cotCode: "084691", seasonality: true },
  { id: "ZC", name: "Corn", cotCode: "002602", seasonality: true },
  { id: "ZW", name: "Wheat", cotCode: "001602", seasonality: true },
  { id: "ZS", name: "Soybeans", cotCode: "005602", seasonality: true },
  { id: "KC", name: "Coffee", cotCode: "083731", seasonality: true },
  { id: "ZN", name: "10Y Notes", cotCode: "002602", seasonality: false },
  { id: "ZB", name: "30Y Bonds", cotCode: "020601", seasonality: false },
];

export const TDW_BIAS: Record<string, Record<string, "bullish" | "bearish" | "neutral">> = {
  CL: {
    Monday: "bullish",
    Tuesday: "bullish",
    Wednesday: "neutral",
    Thursday: "bearish",
    Friday: "bearish",
  },

  GC: {
    Monday: "bearish",
    Tuesday: "neutral",
    Wednesday: "bullish",
    Thursday: "bullish",
    Friday: "neutral",
  },

  SI: {
    Monday: "bearish",
    Tuesday: "neutral",
    Wednesday: "bullish",
    Thursday: "bullish",
    Friday: "neutral",
  },

  ZC: {
    Monday: "bullish",
    Tuesday: "bullish",
    Wednesday: "bullish",
    Thursday: "bearish",
    Friday: "bearish",
  },

  ZW: {
    Monday: "bullish",
    Tuesday: "bullish",
    Wednesday: "bullish",
    Thursday: "bearish",
    Friday: "bearish",
  },

  ZS: {
    Monday: "bullish",
    Tuesday: "bullish",
    Wednesday: "bullish",
    Thursday: "bearish",
    Friday: "bearish",
  },

  KC: {
    Monday: "neutral",
    Tuesday: "bullish",
    Wednesday: "bullish",
    Thursday: "neutral",
    Friday: "bearish",
  },

  ZN: {
    Monday: "bullish",
    Tuesday: "neutral",
    Wednesday: "bearish",
    Thursday: "bearish",
    Friday: "neutral",
  },

  ZB: {
    Monday: "bullish",
    Tuesday: "neutral",
    Wednesday: "bearish",
    Thursday: "bearish",
    Friday: "neutral",
  },
};
