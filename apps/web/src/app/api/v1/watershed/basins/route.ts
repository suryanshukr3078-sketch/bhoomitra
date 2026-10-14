import { NextResponse } from 'next/server';
import { SEED_WATERSHED_BASINS } from '@/app/(public)/watershed/watershed-data';

export async function GET() {
  return NextResponse.json({
    basins: SEED_WATERSHED_BASINS,
    total: SEED_WATERSHED_BASINS.length,
    source: 'SRISHTI-DRISHTI 30m Geospatial Master Registry',
  });
}
