import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/pipelines/:id - Get pipeline details
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const pipeline = await prisma.pipeline.findUnique({
      where: { id },
      include: {
        runs: {
          orderBy: { startedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!pipeline) {
      return NextResponse.json(
        { error: "Pipeline not found" },
        { status: 404 }
      );
    }

    const dag = pipeline.dagJson as { nodes?: unknown[]; edges?: unknown[] };
    return NextResponse.json({
      id: pipeline.id,
      name: pipeline.name,
      description: pipeline.description,
      status: pipeline.status,
      nodes: dag.nodes || [],
      edges: dag.edges || [],
      ownerAgentId: pipeline.ownerAgentId,
      createdAt: pipeline.createdAt.toISOString(),
      updatedAt: pipeline.updatedAt.toISOString(),
      runs: pipeline.runs.map((r) => ({
        id: r.id,
        status: r.status,
        startedAt: r.startedAt.toISOString(),
        completedAt: r.completedAt?.toISOString() || null,
      })),
    });
  } catch (error) {
    console.error("Failed to get pipeline:", error);
    return NextResponse.json(
      { error: "Failed to get pipeline" },
      { status: 500 }
    );
  }
}

// PUT /api/pipelines/:id - Update pipeline
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if pipeline exists
    const existing = await prisma.pipeline.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Pipeline not found" },
        { status: 404 }
      );
    }

    // Can't update a running pipeline
    if (existing.status === "running") {
      return NextResponse.json(
        { error: "Cannot update a running pipeline" },
        { status: 400 }
      );
    }

    const updateData: Prisma.PipelineUpdateInput = {};

    if (body.name) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.nodes || body.edges) {
      updateData.dagJson = {
        nodes: body.nodes || [],
        edges: body.edges || [],
      } as Prisma.InputJsonValue;
    }
    if (body.status && ["draft", "completed", "failed"].includes(body.status)) {
      updateData.status = body.status;
    }

    const pipeline = await prisma.pipeline.update({
      where: { id },
      data: updateData,
    });

    const dag = pipeline.dagJson as { nodes?: unknown[]; edges?: unknown[] };
    return NextResponse.json({
      id: pipeline.id,
      name: pipeline.name,
      description: pipeline.description,
      status: pipeline.status,
      nodes: dag.nodes || [],
      edges: dag.edges || [],
      ownerAgentId: pipeline.ownerAgentId,
      createdAt: pipeline.createdAt.toISOString(),
      updatedAt: pipeline.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Failed to update pipeline:", error);
    return NextResponse.json(
      { error: "Failed to update pipeline" },
      { status: 500 }
    );
  }
}

// DELETE /api/pipelines/:id - Delete pipeline
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await prisma.pipeline.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Pipeline not found" },
        { status: 404 }
      );
    }

    // Can't delete a running pipeline
    if (existing.status === "running") {
      return NextResponse.json(
        { error: "Cannot delete a running pipeline" },
        { status: 400 }
      );
    }

    // Delete related runs first (cascade)
    await prisma.nodeRun.deleteMany({
      where: {
        pipelineRun: {
          pipelineId: id,
        },
      },
    });

    await prisma.pipelineRun.deleteMany({
      where: { pipelineId: id },
    });

    await prisma.pipeline.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete pipeline:", error);
    return NextResponse.json(
      { error: "Failed to delete pipeline" },
      { status: 500 }
    );
  }
}
