import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { runPipelineSchema } from '@/lib/validations';
import { ApiError, handleApiError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/pipelines/:id/run - Start a new pipeline run
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const validated = runPipelineSchema.parse(body);

    // Get pipeline with nodes
    const pipeline = await prisma.pipeline.findUnique({
      where: { id },
      include: { nodes: true, edges: true },
    });

    if (!pipeline) {
      throw new ApiError(404, 'Pipeline not found', 'NOT_FOUND');
    }

    if (pipeline.status === 'ARCHIVED') {
      throw new ApiError(400, 'Cannot run an archived pipeline', 'PIPELINE_ARCHIVED');
    }

    if (pipeline.nodes.length === 0) {
      throw new ApiError(400, 'Pipeline has no nodes to execute', 'EMPTY_PIPELINE');
    }

    // Create the pipeline run with node runs for each node
    const run = await prisma.pipelineRun.create({
      data: {
        pipelineId: id,
        status: 'PENDING',
        input: (validated.input || {}) as object,
        nodeRuns: {
          create: pipeline.nodes.map((node) => ({
            nodeId: node.nodeId,
            status: 'PENDING',
          })),
        },
      },
      include: {
        nodeRuns: true,
      },
    });

    // TODO: In a real implementation, you would:
    // 1. Determine execution order using topological sort based on edges
    // 2. Start executing nodes (possibly via a job queue)
    // 3. Update node statuses as they complete
    // For now, we just create the run record

    // Update run status to RUNNING
    await prisma.pipelineRun.update({
      where: { id: run.id },
      data: { status: 'RUNNING' },
    });

    return NextResponse.json(
      {
        data: {
          ...run,
          status: 'RUNNING',
          message: 'Pipeline execution started',
        },
      },
      { status: 202 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
