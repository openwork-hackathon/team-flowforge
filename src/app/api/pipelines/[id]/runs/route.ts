import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/pipelines/:id/runs - List runs for a pipeline
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verify pipeline exists
    const pipeline = await prisma.pipeline.findUnique({
      where: { id },
    });

    if (!pipeline) {
      return NextResponse.json(
        { error: "Pipeline not found" },
        { status: 404 }
      );
    }

    const runs = await prisma.pipelineRun.findMany({
      where: { pipelineId: id },
      orderBy: { startedAt: "desc" },
      include: {
        nodeRuns: {
          orderBy: { startedAt: "asc" },
        },
      },
    });

    return NextResponse.json(
      runs.map((run) => ({
        id: run.id,
        pipelineId: run.pipelineId,
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
      }))
    );
  } catch (error) {
    console.error("Failed to list runs:", error);
    return NextResponse.json(
      { error: "Failed to list runs" },
      { status: 500 }
    );
  }
}
