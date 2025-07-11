import { NextRequest, NextResponse } from 'next/server';
import { JobStorage } from '@/utils/job-storage.util';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await params;
    const updates = await request.json();

    const updatedJob = JobStorage.update(jobId, updates);

    if (!updatedJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update job status:', error);
    return NextResponse.json(
      { error: 'Failed to update job status' },
      { status: 500 },
    );
  }
}
