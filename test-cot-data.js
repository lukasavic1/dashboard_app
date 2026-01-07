// Test script to fetch and inspect COT data
// Run with: node test-cot-data.js

const https = require('https');
const fs = require('fs');
const AdmZip = require('adm-zip');

// Try 2025 first (current year might not have data yet)
const year = 2025;
const url = `https://www.cftc.gov/files/dea/history/fut_disagg_txt_${year}.zip`;

console.log(`Fetching COT data from: ${url}`);

https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed: HTTP ${res.statusCode}`);
    res.resume();
    return;
  }

  const chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    console.log(`Downloaded ${buffer.length} bytes`);

    try {
      const zip = new AdmZip(buffer);
      const entries = zip.getEntries();
      console.log(`\nZIP contains ${entries.length} files:`);
      entries.forEach(e => console.log(`  - ${e.entryName}`));

      const txtFile = entries.find(e => e.entryName.endsWith(".txt"));
      if (!txtFile) {
        console.error("\nNo .txt file found in ZIP!");
        return;
      }

      const data = txtFile.getData().toString("utf-8");
      const lines = data.split("\n").filter(l => l.trim());
      
      console.log(`\nCSV has ${lines.length} lines`);
      console.log("\n=== HEADER (first line) ===");
      const header = lines[0].split(",");
      console.log(`Total columns: ${header.length}`);
      console.log("\nFirst 20 column names:");
      header.slice(0, 20).forEach((col, i) => {
        console.log(`  ${i}: ${col}`);
      });
      console.log("\nSearching for column names containing 'Market', 'Code', 'Date', 'Long', 'Short', 'Interest'...");
      
      // Find columns that might match what we need
      const marketCodeCandidates = header.map((col, idx) => ({ name: col, idx }))
        .filter(({ name }) => 
          name.toLowerCase().includes('market') || 
          name.toLowerCase().includes('code') ||
          name.toLowerCase().includes('cftc')
        );
      
      const dateCandidates = header.map((col, idx) => ({ name: col, idx }))
        .filter(({ name }) => 
          name.toLowerCase().includes('date') || 
          name.toLowerCase().includes('report')
        );
      
      const longCandidates = header.map((col, idx) => ({ name: col, idx }))
        .filter(({ name }) => 
          name.toLowerCase().includes('long') && 
          (name.toLowerCase().includes('prod') || name.toLowerCase().includes('merc') || name.toLowerCase().includes('commercial'))
        );
      
      const shortCandidates = header.map((col, idx) => ({ name: col, idx }))
        .filter(({ name }) => 
          name.toLowerCase().includes('short') && 
          (name.toLowerCase().includes('prod') || name.toLowerCase().includes('merc') || name.toLowerCase().includes('commercial'))
        );
      
      const nonCommLongCandidates = header.map((col, idx) => ({ name: col, idx }))
        .filter(({ name }) => 
          name.toLowerCase().includes('long') && 
          (name.toLowerCase().includes('noncomm') || name.toLowerCase().includes('non-comm') || name.toLowerCase().includes('spec'))
        );
      
      const nonCommShortCandidates = header.map((col, idx) => ({ name: col, idx }))
        .filter(({ name }) => 
          name.toLowerCase().includes('short') && 
          (name.toLowerCase().includes('noncomm') || name.toLowerCase().includes('non-comm') || name.toLowerCase().includes('spec'))
        );
      
      const openInterestCandidates = header.map((col, idx) => ({ name: col, idx }))
        .filter(({ name }) => 
          name.toLowerCase().includes('interest') || name.toLowerCase().includes('open')
        );

      console.log("\n=== Potential column matches ===");
      if (marketCodeCandidates.length > 0) {
        console.log("\nMarket Code candidates:");
        marketCodeCandidates.forEach(({ name, idx }) => console.log(`  Column ${idx}: ${name}`));
      }
      if (dateCandidates.length > 0) {
        console.log("\nDate candidates:");
        dateCandidates.forEach(({ name, idx }) => console.log(`  Column ${idx}: ${name}`));
      }
      if (longCandidates.length > 0) {
        console.log("\nCommercial Long candidates:");
        longCandidates.forEach(({ name, idx }) => console.log(`  Column ${idx}: ${name}`));
      }
      if (shortCandidates.length > 0) {
        console.log("\nCommercial Short candidates:");
        shortCandidates.forEach(({ name, idx }) => console.log(`  Column ${idx}: ${name}`));
      }
      if (nonCommLongCandidates.length > 0) {
        console.log("\nNon-Commercial Long candidates:");
        nonCommLongCandidates.forEach(({ name, idx }) => console.log(`  Column ${idx}: ${name}`));
      }
      if (nonCommShortCandidates.length > 0) {
        console.log("\nNon-Commercial Short candidates:");
        nonCommShortCandidates.forEach(({ name, idx }) => console.log(`  Column ${idx}: ${name}`));
      }
      if (openInterestCandidates.length > 0) {
        console.log("\nOpen Interest candidates:");
        openInterestCandidates.forEach(({ name, idx }) => console.log(`  Column ${idx}: ${name}`));
      }

      // Try to find market code column by searching for a known code
      const assetCodes = {
        "CL": "067651",
        "GC": "088691",
        "SI": "084691",
        "ZC": "002602",
        "ZW": "001602",
        "ZS": "005602",
        "KC": "083731",
        "ZN": "002602",
        "ZB": "020601"
      };

      console.log("\n=== Searching entire file for asset codes ===");
      const foundCodes = new Map(); // code -> { count, firstRow, columns }
      
      // Search through ALL rows
      let foundMarketCodeColumn = -1;
      let foundDateColumn = -1;
      
      for (let rowIdx = 1; rowIdx < lines.length; rowIdx++) {
        const cols = lines[rowIdx].split(",");
        
        // Try to find market code column by looking for our codes
        if (foundMarketCodeColumn === -1) {
          for (let colIdx = 0; colIdx < cols.length; colIdx++) {
            const value = cols[colIdx];
            if (Object.values(assetCodes).includes(value)) {
              foundMarketCodeColumn = colIdx;
              foundDateColumn = dateCandidates.length > 0 ? dateCandidates[0].idx : -1;
              console.log(`\nFound market code column at index ${colIdx}: "${header[colIdx]}"`);
              console.log(`Found code ${value} in row ${rowIdx + 1}`);
              break;
            }
          }
        }
        
        // If we found the column, collect all codes
        if (foundMarketCodeColumn >= 0 && cols[foundMarketCodeColumn]) {
          const code = cols[foundMarketCodeColumn];
          if (Object.values(assetCodes).includes(code)) {
            if (!foundCodes.has(code)) {
              foundCodes.set(code, {
                count: 0,
                firstRow: rowIdx + 1,
                sampleRow: cols
              });
            }
            foundCodes.get(code).count++;
          }
        }
      }

      console.log(`\nSearched ${lines.length - 1} data rows`);
      console.log(`\nFound ${foundCodes.size} of our asset codes:`);
      Object.entries(assetCodes).forEach(([asset, code]) => {
        const found = foundCodes.get(code);
        if (found) {
          console.log(`  ${asset} (${code}): ✓ FOUND - ${found.count} rows, first at row ${found.firstRow}`);
        } else {
          console.log(`  ${asset} (${code}): ✗ NOT FOUND`);
        }
      });

      // Show sample rows for one of our codes
      if (foundCodes.has("067651")) {
        console.log("\n=== Sample row for CL (067651) ===");
        const clData = foundCodes.get("067651");
        console.log(`Row ${clData.firstRow}:`);
        console.log(`  Market Code Column (${foundMarketCodeColumn}): ${clData.sampleRow[foundMarketCodeColumn]}`);
        if (foundDateColumn >= 0) {
          console.log(`  Date Column (${foundDateColumn}): ${clData.sampleRow[foundDateColumn]}`);
        }
        // Show first 15 columns
        header.slice(0, 15).forEach((h, i) => {
          console.log(`  ${i}: ${h} = ${clData.sampleRow[i]}`);
        });
      }

      // Show all column names for reference
      console.log("\n=== All column names (for reference) ===");
      console.log("First 30 columns:");
      header.slice(0, 30).forEach((col, i) => {
        console.log(`  ${i}: ${col}`);
      });
      console.log("\n... (showing first 30 of " + header.length + " columns)");

    } catch (error) {
      console.error("Error processing ZIP:", error);
    }
  });
}).on('error', (err) => {
  console.error("Request error:", err);
});
