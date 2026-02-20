import { ParsedCot } from "./parse";

// CFTC Public Reporting Environment — Disaggregated Futures Only
// Dataset ID: 72hh-3qpy  (https://publicreporting.cftc.gov/resource/72hh-3qpy.json)
const CFTC_API_BASE =
  "https://publicreporting.cftc.gov/resource/72hh-3qpy.json";

// 3 years of history gives a meaningful COT index (min/max range)
const DEFAULT_WEEKS_OF_HISTORY = 156;

interface CftcApiRow {
  cftc_contract_market_code: string;
  report_date_as_yyyy_mm_dd: string;
  prod_merc_positions_long: string;
  prod_merc_positions_short: string;
  m_money_positions_long_all: string;
  m_money_positions_short_all: string;
  other_rept_positions_long: string;
  other_rept_positions_short: string;
  nonrept_positions_long_all: string;
  nonrept_positions_short_all: string;
  open_interest_all: string;
}

function mapRow(row: CftcApiRow): ParsedCot {
  const mMoneyLong = Number(row.m_money_positions_long_all || 0);
  const mMoneyShort = Number(row.m_money_positions_short_all || 0);
  const otherReptLong = Number(row.other_rept_positions_long || 0);
  const otherReptShort = Number(row.other_rept_positions_short || 0);

  // Strip the time part so we get UTC midnight — consistent with how the original
  // ZIP-based parser handled plain date strings ("2025-12-30" → UTC midnight).
  const dateOnly = row.report_date_as_yyyy_mm_dd.split("T")[0];

  return {
    reportDate: new Date(dateOnly),
    commercialLong: Number(row.prod_merc_positions_long || 0),
    commercialShort: Number(row.prod_merc_positions_short || 0),
    // Non-commercial = money managers + other reportable (matches ZIP-based parser)
    nonCommercialLong: mMoneyLong + otherReptLong,
    nonCommercialShort: mMoneyShort + otherReptShort,
    smallTraderLong: Number(row.nonrept_positions_long_all || 0),
    smallTraderShort: Number(row.nonrept_positions_short_all || 0),
    openInterest: Number(row.open_interest_all || 0),
  };
}

/**
 * Fetches COT history for a single market from the CFTC Public Reporting API.
 *
 * Returns rows sorted ascending by report date (oldest → newest).
 * Uses the official Socrata API (publicreporting.cftc.gov) which is not
 * blocked by Cloudflare, unlike the legacy ZIP download endpoints.
 *
 * @param cotCode  CFTC contract market code (e.g. "067651" for CL)
 * @param limit    Number of weekly records to fetch (default 156 = ~3 years)
 */
export async function fetchCotForMarket(
  cotCode: string,
  limit: number = DEFAULT_WEEKS_OF_HISTORY
): Promise<ParsedCot[]> {
  // Fetch newest-first (DESC), then reverse so callers get ascending (oldest → newest)
  const url =
    `${CFTC_API_BASE}` +
    `?cftc_contract_market_code=${encodeURIComponent(cotCode)}` +
    `&$order=report_date_as_yyyy_mm_dd+DESC` +
    `&$limit=${limit}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `CFTC API returned HTTP ${res.status} ${res.statusText}. Body: ${body.substring(0, 200)}`
      );
    }

    const rows: CftcApiRow[] = await res.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error(
        `CFTC API returned no records for cotCode ${cotCode}`
      );
    }

    // Reverse so result is sorted ascending (oldest first) for analysis
    return rows.map(mapRow).reverse();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`fetchCotForMarket failed for ${cotCode}: ${error.message}`);
    }
    throw error;
  }
}
