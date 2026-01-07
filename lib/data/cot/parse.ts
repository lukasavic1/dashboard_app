export interface ParsedCot {
  reportDate: Date;
  // Commercial positions
  commercialLong: number;
  commercialShort: number;
  // Non-commercial (large spec) positions
  nonCommercialLong: number;
  nonCommercialShort: number;
  // Small trader positions
  smallTraderLong: number;
  smallTraderShort: number;
  // Open interest
  openInterest: number;
}

export function parseCotForMarket(
  raw: string,
  cotCode: string
): ParsedCot[] {
  const lines = raw.split("\n").filter(line => line.trim());
  if (lines.length === 0) return [];

  // Normalize header values (strip quotes/whitespace)
  const header = lines[0]
    .split(",")
    .map(h => h.replace(/^"+|"+$/g, "").trim());
  const idx = (name: string) => header.indexOf(name);

  // Helper to find the first available column from a list of candidate names
  const firstIdx = (names: string[]) => {
    for (const name of names) {
      const i = idx(name);
      if (i !== -1) return i;
    }
    return -1;
  };

  // Find column indices
  const marketCodeIdx = firstIdx([
    "CFTC_Contract_Market_Code",
    "CFTC_Contract_Market_Code_Quotes"
  ]);
  const dateIdx = firstIdx([
    "Report_Date_as_YYYY-MM-DD",
    "Report_Date_as_YYYY-MM-DD_Quotes",
    "Report_Date_as_YYYY_MM_DD"
  ]);
  const commercialLongIdx = firstIdx([
    "Prod_Merc_Positions_Long_All",
    "Prod_Merc_Positions_Long_All_Quotes"
  ]);
  const commercialShortIdx = firstIdx([
    "Prod_Merc_Positions_Short_All",
    "Prod_Merc_Positions_Short_All_Quotes"
  ]);
  const mMoneyLongIdx = firstIdx([
    "M_Money_Positions_Long_All",
    "M_Money_Positions_Long_All_Quotes"
  ]);
  const mMoneyShortIdx = firstIdx([
    "M_Money_Positions_Short_All",
    "M_Money_Positions_Short_All_Quotes"
  ]);
  const otherReptLongIdx = firstIdx([
    "Other_Rept_Positions_Long_All",
    "Other_Rept_Positions_Long_All_Quotes"
  ]);
  const otherReptShortIdx = firstIdx([
    "Other_Rept_Positions_Short_All",
    "Other_Rept_Positions_Short_All_Quotes"
  ]);
  const smallTraderLongIdx = firstIdx([
    "NonRept_Positions_Long_All",
    "NonRept_Positions_Long_All_Quotes"
  ]);
  const smallTraderShortIdx = firstIdx([
    "NonRept_Positions_Short_All",
    "NonRept_Positions_Short_All_Quotes"
  ]);
  const openInterestIdx = firstIdx([
    "Open_Interest_All",
    "Open_Interest_All_Quotes"
  ]);

  return lines
    .slice(1)
    .map(line => {
      const cols = line
        .split(",")
        .map(c => c.replace(/^"+|"+$/g, "").trim());
      if (cols.length < header.length) return null;
      
      // Use CFTC_Contract_Market_Code (column 3) not CFTC_Market_Code
      const marketCode = cols[marketCodeIdx]?.trim();
      if (marketCode !== cotCode) return null;

      // Parse date
      const dateStr = cols[dateIdx]?.trim();
      if (!dateStr) return null;
      const reportDate = new Date(dateStr);

      // Commercial positions
      const commercialLong = Number(cols[commercialLongIdx]?.trim() || 0);
      const commercialShort = Number(cols[commercialShortIdx]?.trim() || 0);

      // Non-Commercial (Large Specs) = Money Managers + Other Reportable
      const mMoneyLong = Number(cols[mMoneyLongIdx]?.trim() || 0);
      const mMoneyShort = Number(cols[mMoneyShortIdx]?.trim() || 0);
      const otherReptLong = Number(cols[otherReptLongIdx]?.trim() || 0);
      const otherReptShort = Number(cols[otherReptShortIdx]?.trim() || 0);
      const nonCommercialLong = mMoneyLong + otherReptLong;
      const nonCommercialShort = mMoneyShort + otherReptShort;

      // Small Traders (Non-Reportable)
      const smallTraderLong = Number(cols[smallTraderLongIdx]?.trim() || 0);
      const smallTraderShort = Number(cols[smallTraderShortIdx]?.trim() || 0);

      // Open Interest
      const openInterest = Number(cols[openInterestIdx]?.trim() || 0);

      return {
        reportDate,
        commercialLong,
        commercialShort,
        nonCommercialLong,
        nonCommercialShort,
        smallTraderLong,
        smallTraderShort,
        openInterest,
      };
    })
    .filter((item): item is ParsedCot => item !== null)
    .sort((a, b) => a.reportDate.getTime() - b.reportDate.getTime());
}

/**
 * Gets the most recent Friday's report date
 * COT reports are published on Fridays (usually released on Friday after market close)
 */
export function getLatestFridayDate(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 5 = Friday
  
  let daysToSubtract: number;
  if (dayOfWeek === 5) {
    // Today is Friday - use today
    daysToSubtract = 0;
  } else if (dayOfWeek === 6) {
    // Today is Saturday - use yesterday (Friday)
    daysToSubtract = 1;
  } else if (dayOfWeek === 0) {
    // Today is Sunday - use 2 days ago (Friday)
    daysToSubtract = 2;
  } else {
    // Monday-Thursday - use last Friday
    daysToSubtract = dayOfWeek + 2;
  }
  
  const friday = new Date(today);
  friday.setDate(today.getDate() - daysToSubtract);
  friday.setHours(0, 0, 0, 0);
  
  return friday;
}

/**
 * Validates that we have the latest Friday's data
 */
export function validateLatestReport(reports: ParsedCot[]): ParsedCot | null {
  if (reports.length === 0) return null;
  
  const latestFriday = getLatestFridayDate();
  const latestReport = reports[reports.length - 1];
  
  // Check if the latest report is from the most recent Friday (within 1 day tolerance)
  const daysDiff = Math.abs(
    (latestReport.reportDate.getTime() - latestFriday.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysDiff <= 1) {
    return latestReport;
  }
  
  return null;
}
