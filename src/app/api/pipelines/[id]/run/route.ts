import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { runPipelineSchema } from '@/lib/validations';
import { ApiError, handleApiError } from '@/lib/errors';
import { startPipelineExecution, topologicalSort } from '@/lib/execution-engine';

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/pipelines/:id/run - Start a new pipeline run
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const validated = runPipelineSchema.parse(body);

    // Get pipeline with nodes and edges
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

    // Validate DAG structure before creating run
    const nodeConfigs = pipeline.nodes.map((n) => ({
      nodeId: n.nodeId,
      type: n.type,
      label: n.label,
      config: n.config as Record<string, unknown>,
    }));
    const edgeConfigs = pipeline.edges.map((e) => ({
      sourceNode: e.sourceNode,
      targetNode: e.targetNode,
      label: e.label || undefined,
    }));

    try {
      topologicalSort(nodeConfigs, edgeConfigs);
    } catch (error) {
      throw new ApiError(
        400,
        error instanceof Error ? error.message : 'Invalid pipeline structure',
        'INVALID_DAG'
      );
    }

    // Create the pipeline run with node runs for each node
    const run = await prisma.pipelineRun.create({
      data: {
        pipelineId: id,
        status: 'RUNNING',
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

    // Start pipeline execution asynchronously (don't await)
    const inputData = (validated.input || {}) as Record<string, unknown>;
    
    startPipelineExecution({
      runId: run.id,
      pipelineId: id,
      nodes: nodeConfigs,
      edges: edgeConfigs,
      input: inputData,
    }).catch((error) => {
      console.error('[RunAPI] Execution failed:', error);
      // Update run status to failed
      prisma.pipelineRun.update({
        where: { id: run.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          output: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      }).catch(console.error);
    });

    return NextResponse.json(
      {
        data: {
          ...run,
          message: 'Pipeline execution started',
          eventsUrl: `/api/runs/${run.id}/events`,
        },
      },
      { status: 202 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
