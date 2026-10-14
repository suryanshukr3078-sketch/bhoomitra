import { NextRequest, NextResponse } from 'next/server';
import { SEED_DIGITIZATION_RECORDS } from '@/app/(public)/digitization/digitization-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('language');

  const records = lang && lang !== 'all'
    ? SEED_DIGITIZATION_RECORDS.filter((r) => r.original_language.toLowerCase().includes(lang.toLowerCase()))
    : SEED_DIGITIZATION_RECORDS;

  return NextResponse.json({
    records,
    total: records.length,
  });
}
