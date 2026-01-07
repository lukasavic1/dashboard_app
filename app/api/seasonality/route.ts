import { calculateSeasonality } from '@/lib/data/seasonality/seasonality'
import { NextResponse } from 'next/server'

export async function GET() {
  const result = calculateSeasonality()
  return NextResponse.json(result)
}
