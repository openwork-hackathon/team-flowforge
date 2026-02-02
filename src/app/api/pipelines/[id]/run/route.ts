import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PipelineNode } from "@/types/pipeline";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/pipelines/:id/run - Execute pipeline
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const pipeline = await prisma.pipeline.findUnique({
      where: { id },
    });

    if (!pipeline) {
      return NextResponse.json(
        { error: "Pipeline not found" },
        { status: 404 }
      );
    }

    // Already running
    if (pipeline.status === "running") {
      return NextResponse.json(
        { error: "Pipeline is already running" },
        { status: 400 }
      );
    }

    const dag = pipeline.dagJson as { nodes?: PipelineNode[]; edges?: unknown[] };
    const nodes = dag.nodes || [];

    // Validate: must have at least start and end nodes
    const hasStart = nodes.some((n) => n.type === "start");
    const hasEnd = nodes.some((n) => n.type === "end");

    if (!hasStart || !hasEnd) {
      return NextResponse.json(
        { error: "Pipeline must have start and end nodes" },
        { status: 400 }
      );
    }

    // Create run with initial node runs
    const run = await prisma.pipelineRun.create({
      data: {
        pipelineId: id,
        status: "running",
        nodeRuns: {
          create: nodes.map((node) => ({
            nodeId: node.id,
            status: node.type === "start" ? "completed" : "pending",
            startedAt: node.type === "start" ? new Date() : null,
            completedAt: node.type === "start" ? new Date() : null,
          })),
        },
      },
      include: {
        nodeRuns: true,
      },
    });

    // Update pipeline status
    await prisma.pipeline.update({
      where: { id },
      data: { status: "running" },
    });

    // TODO: Actually trigger Openwork jobs for job nodes
    // This would be done in a background worker or queue

    return NextResponse.json({
      id: run.id,
      pipelineId: run.pipelineId,
      status: run.status,
      startedAt: run.startedAt.toISOString(),
      nodeRuns: run.nodeRuns.map((nr) => ({
        id: nr.id,
        nodeId: nr.nodeId,
        status: nr.status,
        openworkJobId: nr.openworkJobId,
        startedAt: nr.startedAt?.toISOString() || null,
        completedAt: nr.completedAt?.toISOString() || null,
      })),
    });
  } catch (error) {
    console.error("Failed to run pipeline:", error);
    return NextResponse.json(
      { error: "Failed to run pipeline" },
      { status: 500 }
    );
  }
}
