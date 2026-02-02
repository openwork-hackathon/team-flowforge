import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/pipelines - List all pipelines
export async function GET() {
  try {
    const pipelines = await prisma.pipeline.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        runs: {
          take: 1,
          orderBy: { startedAt: "desc" },
        },
      },
    });

    // Transform dagJson to nodes/edges for frontend
    const result = pipelines.map((p) => {
      const dag = p.dagJson as { nodes?: unknown[]; edges?: unknown[] };
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        nodes: dag.nodes || [],
        edges: dag.edges || [],
        ownerAgentId: p.ownerAgentId,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        lastRun: p.runs[0] || null,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to list pipelines:", error);
    return NextResponse.json(
      { error: "Failed to list pipelines" },
      { status: 500 }
    );
  }
}

// POST /api/pipelines - Create a new pipeline
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const nodes = body.nodes || [];
    const edges = body.edges || [];

    const pipeline = await prisma.pipeline.create({
      data: {
        name: body.name,
        description: body.description || null,
        status: "draft",
        dagJson: { nodes, edges },
        ownerAgentId: body.ownerAgentId || null,
      },
    });

    const dag = pipeline.dagJson as { nodes?: unknown[]; edges?: unknown[] };
    return NextResponse.json(
      {
        id: pipeline.id,
        name: pipeline.name,
        description: pipeline.description,
        status: pipeline.status,
        nodes: dag.nodes || [],
        edges: dag.edges || [],
        ownerAgentId: pipeline.ownerAgentId,
        createdAt: pipeline.createdAt.toISOString(),
        updatedAt: pipeline.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create pipeline:", error);
    return NextResponse.json(
      { error: "Failed to create pipeline" },
      { status: 500 }
    );
  }
}
