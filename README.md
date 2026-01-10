This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Automatic COT Report Refresh

The application automatically checks for and fetches new COT reports when needed. This is handled through:

### Cron Job (Recommended)

A cron job runs automatically to check for new COT reports. The cron job:
- Checks if there's a newer report available than what's in the database
- Only fetches and processes data when a newer report is found (optimized)
- Handles edge cases (Tuesday/Thursday releases, holidays, etc.)

#### Vercel Deployment

If deployed on Vercel, the cron job is configured in `vercel.json`:
- **Main Schedule**: Runs Tuesday, Thursday, and Friday at 8:35 PM UTC (3:35 PM EST)
- **Schedule**: `35 20 * * 2,4,5` (cron format)
- **Retry Schedule**: Also runs at 8:40, 8:45, 8:50, and 8:55 PM UTC on the same days
- **Schedule**: `40,45,50,55 20 * * 2,4,5` (cron format)
- This runs 5 minutes after the typical publication time (3:30 PM EST) to ensure reports are available
- If a fetch fails, it will automatically retry at the next scheduled time (every 5 minutes)
- Covers the typical Friday releases and occasional Tuesday/Thursday releases

The cron job endpoint is: `/api/cron/refresh-cot`

#### Other Platforms

If not using Vercel, you can set up an external cron service to call:
```
GET https://your-domain.com/api/cron/refresh-cot
```

**Security**: In production, protect the endpoint with a secret token:
1. Set `CRON_SECRET` environment variable
2. Configure your cron service to send: `Authorization: Bearer <CRON_SECRET>`

### Automatic Dashboard Check

When users load the dashboard:
- A lightweight check runs in the background (non-blocking)
- If data is stale (>10 days old), it triggers a background refresh
- This ensures users always have fresh data without manual intervention

### Manual Refresh

Users can also manually refresh data using the "Refresh" button in the dashboard header.

### How It Works

1. **Check Phase**: The system compares the latest report date in the database with the latest available report date from the CFTC
2. **Fetch Phase**: Only if a newer report exists, the system fetches and processes the data
3. **Processing**: Each asset is processed only if:
   - The report is newer than what's in the database
   - The report is recent (within 10 days)
   - The asset has sufficient history (at least 2 weeks)

This optimization prevents unnecessary API calls and processing, saving resources and ensuring efficient operation.

### Manual Refresh Rate Limiting

Users can manually trigger a refresh using the Refresh button, but this is rate-limited:
- **Limit**: 3 manual refreshes per day per user
- **Purpose**: Prevents abuse and unnecessary load
- **Display**: The refresh button shows remaining refreshes and is disabled when the limit is reached
- **Tooltip**: Hover over the info icon next to the refresh button to see when automatic fetching happens

### Database Migration

After pulling these changes, you'll need to run a database migration to add the `RefreshAttempt` table:

```bash
npx prisma migrate dev --name add_refresh_attempts
```

Or if you prefer to create the migration manually:

```sql
CREATE TABLE "RefreshAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "RefreshAttempt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RefreshAttempt_userId_createdAt_idx" ON "RefreshAttempt"("userId", "createdAt");

ALTER TABLE "RefreshAttempt" ADD CONSTRAINT "RefreshAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```
