import { NextResponse } from 'next/server';
import { SEED_ACQUISITION_METRICS } from '@/app/(public)/acquisition/acquisition-data';

export async function GET() {
  return NextResponse.json(SEED_ACQUISITION_METRICS);
}
