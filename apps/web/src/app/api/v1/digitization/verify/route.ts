import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({
      status: 'success',
      record_id: body.record_id,
      decision: body.decision || 'approved',
      verified_by: body.verifier_name || 'Revenue Official',
      verified_at: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      status: 'success',
      decision: 'approved',
      verified_at: new Date().toISOString(),
    });
  }
}
