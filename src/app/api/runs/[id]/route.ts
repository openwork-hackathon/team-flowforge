import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiError, handleApiError } from '@/lib/errors';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/runs/:id - Get a specific run with all details
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const run = await prisma.pipelineRun.findUnique({
      where: { id },
      include: {
        pipeline: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
          },
        },
        nodeRuns: {
          orderBy: { startedAt: 'asc' },
        },
      },
    });

    if (!run) {
      throw new ApiError(404, 'Run not found', 'NOT_FOUND');
    }

    // Calculate some stats
    const stats = {
      totalNodes: run.nodeRuns.length,
      completed: run.nodeRuns.filter((n) => n.status === 'COMPLETED').length,
      failed: run.nodeRuns.filter((n) => n.status === 'FAILED').length,
      pending: run.nodeRuns.filter((n) => n.status === 'PENDING').length,
      running: run.nodeRuns.filter((n) => n.status === 'RUNNING').length,
      skipped: run.nodeRuns.filter((n) => n.status === 'SKIPPED').length,
    };

    return NextResponse.json({
      data: {
        ...run,
        stats,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
