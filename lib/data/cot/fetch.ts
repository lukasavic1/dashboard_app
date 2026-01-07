import AdmZip from "adm-zip";

export async function fetchCotFile(year: number): Promise<string> {
  const url = `https://www.cftc.gov/files/dea/history/fut_disagg_txt_${year}.zip`;

  try {
    const res = await fetch(url, {
      // Add headers to help with potential CORS or server issues
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; COT-Data-Fetcher/1.0)',
      },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'No error details');
      throw new Error(
        `Failed to fetch COT data: HTTP ${res.status} ${res.statusText}. URL: ${url}. Details: ${errorText.substring(0, 200)}`
      );
    }

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      throw new Error("Received empty response from COT server");
    }

    const buffer = Buffer.from(arrayBuffer);
    const zip = new AdmZip(buffer);

    const entries = zip.getEntries();
    if (entries.length === 0) {
      throw new Error("ZIP file is empty");
    }

    const txtFile = entries.find(e => e.entryName.endsWith(".txt"));
    if (!txtFile) {
      const entryNames = entries.map(e => e.entryName).join(", ");
      throw new Error(
        `COT TXT file not found in ZIP. Available entries: ${entryNames.substring(0, 200)}`
      );
    }

    const data = txtFile.getData().toString("utf-8");
    if (!data || data.length === 0) {
      throw new Error("COT TXT file is empty");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw with more context
      throw new Error(`COT fetch failed for year ${year}: ${error.message}`);
    }
    throw error;
  }
}

