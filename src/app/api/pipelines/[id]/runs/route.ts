import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiError, handleApiError } from '@/lib/errors';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/pipelines/:id/runs - Get all runs for a pipeline
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const includeNodeRuns = searchParams.get('includeNodeRuns') === 'true';
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check if pipeline exists
    const pipeline = await prisma.pipeline.findUnique({ where: { id } });
    if (!pipeline) {
      throw new ApiError(404, 'Pipeline not found', 'NOT_FOUND');
    }

    const where: any = { pipelineId: id };
    if (status) {
      where.status = status;
    }

    const [runs, total] = await Promise.all([
      prisma.pipelineRun.findMany({
        where,
        include: {
          nodeRuns: includeNodeRuns,
          _count: {
            select: { nodeRuns: true },
          },
        },
        orderBy: { startedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.pipelineRun.count({ where }),
    ]);

    return NextResponse.json({
      data: runs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + runs.length < total,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
