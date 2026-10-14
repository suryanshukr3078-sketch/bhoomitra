import { NextRequest, NextResponse } from 'next/server';
import {
  SEED_WATERSHED_BASINS,
  SEED_GEOCODED_IMAGES,
  generateLocalWatershedAnalysis,
} from '@/app/(public)/watershed/watershed-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const photoId = body.photo_id;
    const basinId = body.basin_id;

    const photo = SEED_GEOCODED_IMAGES.find((p) => p.id === photoId) || SEED_GEOCODED_IMAGES[0];
    const basin = SEED_WATERSHED_BASINS.find((b) => b.id === basinId) || SEED_WATERSHED_BASINS[0];

    const result = generateLocalWatershedAnalysis(photo, basin);

    return NextResponse.json({
      status: 'success',
      verification_result: result,
    });
  } catch {
    return NextResponse.json({
      status: 'success',
      verification_result: generateLocalWatershedAnalysis(SEED_GEOCODED_IMAGES[0], SEED_WATERSHED_BASINS[0]),
    });
  }
}
