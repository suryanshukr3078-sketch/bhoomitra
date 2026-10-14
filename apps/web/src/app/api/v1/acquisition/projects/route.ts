import { NextResponse } from 'next/server';
import {
  SEED_ACQUISITION_PROJECTS,
  STANDARD_LIFECYCLE_STAGES,
} from '@/app/(public)/acquisition/acquisition-data';

export async function GET() {
  return NextResponse.json({
    projects: SEED_ACQUISITION_PROJECTS,
    total: SEED_ACQUISITION_PROJECTS.length,
    standard_lifecycle_stages: STANDARD_LIFECYCLE_STAGES,
  });
}
