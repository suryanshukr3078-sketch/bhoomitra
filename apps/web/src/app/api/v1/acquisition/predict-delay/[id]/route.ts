import { NextRequest, NextResponse } from 'next/server';
import {
  SEED_ACQUISITION_PROJECTS,
  generateLocalDelayPrediction,
} from '@/app/(public)/acquisition/acquisition-data';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;
  const project =
    SEED_ACQUISITION_PROJECTS.find((p) => p.id === projectId) ||
    SEED_ACQUISITION_PROJECTS[0];

  const prediction = generateLocalDelayPrediction(project);

  return NextResponse.json(prediction);
}
