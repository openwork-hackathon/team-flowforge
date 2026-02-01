import { NextResponse } from 'next/server';
import { getPollingStatus, resumePolling } from '@/lib/job-poller';

/**
 * GET /api/jobs/polling - Get current job polling status
 */
export async function GET() {
  const status = getPollingStatus();
  return NextResponse.json({ data: status });
}

/**
 * POST /api/jobs/polling - Resume polling for all running jobs
 * Call this on server startup or to recover from connection issues
 */
export async function POST() {
  try {
    await resumePolling();
    const status = getPollingStatus();
    return NextResponse.json({
      data: {
        message: 'Polling resumed for running jobs',
        ...status,
      },
    });
  } catch (error) {
    console.error('[JobPolling] Error resuming polling:', error);
    return NextResponse.json(
      {
        error: 'Failed to resume polling',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
