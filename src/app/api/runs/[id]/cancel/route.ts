import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiError, handleApiError } from '@/lib/errors';
import { stopRunPolling } from '@/lib/job-poller';
import { emitRunEvent, RunEventType } from '@/lib/websocket-events';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/runs/:id/cancel - Cancel a running pipeline
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const run = await prisma.pipelineRun.findUnique({
      where: { id },
      include: { nodeRuns: true },
    });

    if (!run) {
      throw new ApiError(404, 'Run not found', 'NOT_FOUND');
    }

    if (run.status !== 'RUNNING' && run.status !== 'PENDING') {
      throw new ApiError(
        400,
        `Cannot cancel a run with status ${run.status}`,
        'INVALID_STATUS'
      );
    }

    // Stop all job polling for this run
    stopRunPolling(id);

    // Update all pending/running nodes to FAILED
    await prisma.nodeRun.updateMany({
      where: {
        pipelineRunId: id,
        status: { in: ['PENDING', 'RUNNING'] },
      },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        error: 'Cancelled by user',
      },
    });

    // Update run status
    const updatedRun = await prisma.pipelineRun.update({
      where: { id },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        output: { cancelled: true, cancelledAt: new Date().toISOString() },
      },
      include: { nodeRuns: true },
    });

    // Emit cancellation event
    emitRunEvent(id, {
      type: RunEventType.RUN_FAILED,
      error: 'Cancelled by user',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      data: {
        ...updatedRun,
        message: 'Pipeline run cancelled',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
