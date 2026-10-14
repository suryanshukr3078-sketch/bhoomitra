import { NextRequest, NextResponse } from 'next/server';
import { SEED_GEOCODED_IMAGES } from '@/app/(public)/watershed/watershed-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const basinId = searchParams.get('basin_id');

  const images = basinId
    ? SEED_GEOCODED_IMAGES.filter((img) => img.basin_id === basinId)
    : SEED_GEOCODED_IMAGES;

  return NextResponse.json({
    images,
    total: images.length,
    basin_filter: basinId || 'all',
  });
}
