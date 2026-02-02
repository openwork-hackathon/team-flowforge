import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/runs/:id - Get run details with node statuses
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const run = await prisma.pipelineRun.findUnique({
      where: { id },
      include: {
        pipeline: true,
        nodeRuns: {
          orderBy: { startedAt: "asc" },
        },
      },
    });

    if (!run) {
      return NextResponse.json(
        { error: "Run not found" },
        { status: 404 }
      );
    }

    const dag = run.pipeline.dagJson as { nodes?: unknown[]; edges?: unknown[] };

    return NextResponse.json({
      id: run.id,
      pipelineId: run.pipelineId,
      pipeline: {
        id: run.pipeline.id,
        name: run.pipeline.name,
        nodes: dag.nodes || [],
        edges: dag.edges || [],
      },
      status: run.status,
      startedAt: run.startedAt.toISOString(),
      completedAt: run.completedAt?.toISOString() || null,
      nodeRuns: run.nodeRuns.map((nr) => ({
        id: nr.id,
        nodeId: nr.nodeId,
        status: nr.status,
        openworkJobId: nr.openworkJobId,
        result: nr.result,
        startedAt: nr.startedAt?.toISOString() || null,
        completedAt: nr.completedAt?.toISOString() || null,
      })),
    });
  } catch (error) {
    console.error("Failed to get run:", error);
    return NextResponse.json(
      { error: "Failed to get run" },
      { status: 500 }
    );
  }
}
