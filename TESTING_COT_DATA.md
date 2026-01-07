# Testing COT Data Fetching

## Quick Test with cURL

### 1. Download the COT ZIP file
```bash
curl -o cot_data.zip "https://www.cftc.gov/files/dea/history/fut_disagg_txt_2025.zip"
```

### 2. Extract and inspect
```bash
unzip -l cot_data.zip
unzip -p cot_data.zip *.txt | head -5
```

## Postman Request

### GET Request
- **Method**: GET
- **URL**: `https://www.cftc.gov/files/dea/history/fut_disagg_txt_2025.zip`
- **Headers**: None required
- **Response**: Binary ZIP file

After downloading, you'll need to:
1. Extract the ZIP
2. Open the .txt file
3. Check the header row for column names
4. Search for your COT codes (e.g., "067651" for CL)

## Node.js Test Script

Run the test script to automatically check everything:

```bash
node test-cot-data.js
```

This will:
- Download the COT data
- Show ZIP contents
- Display CSV header
- Check if your asset codes exist
- Verify required columns
- Show sample data rows

## Manual CSV Inspection

If you extract the ZIP and open the CSV:

1. **Check the header row** - Look for these column names:
   - `CFTC_Market_Code` (or similar)
   - `Report_Date_as_YYYY-MM-DD` (or similar)
   - `Prod_Merc_Positions_Long_All` (or similar)
   - `NonComm_Positions_Long_All` (or similar)
   - `NonRept_Positions_Long_All` (or similar)
   - `Open_Interest_All` (or similar)

2. **Search for your COT codes**:
   - CL (Crude Oil): `067651`
   - GC (Gold): `088691`
   - SI (Silver): `084691`
   - ZC (Corn): `002602`
   - ZW (Wheat): `001602`
   - ZS (Soybeans): `005602`
   - KC (Coffee): `083731`
   - ZN (10Y Notes): `002602`
   - ZB (30Y Bonds): `020601`

3. **Check the date format** - Should be YYYY-MM-DD

## Common Issues

1. **Column names might be different** - CFTC sometimes changes column names
2. **COT codes might be wrong** - Verify codes match current CFTC format
3. **Year might not exist yet** - Try previous year (2024)
4. **Data format might have changed** - Check if CSV structure is different

## API Endpoint Test

You can also test your refresh endpoint directly:

### Postman Request
- **Method**: POST
- **URL**: `http://localhost:3000/api/refresh`
- **Headers**: 
  - `Content-Type: application/json`
- **Body**: (empty)

### cURL
```bash
curl -X POST http://localhost:3000/api/refresh
```
