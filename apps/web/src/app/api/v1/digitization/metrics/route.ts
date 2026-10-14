import { NextResponse } from 'next/server';
import { SEED_DIGITIZATION_METRICS } from '@/app/(public)/digitization/digitization-data';

export async function GET() {
  return NextResponse.json(SEED_DIGITIZATION_METRICS);
}
