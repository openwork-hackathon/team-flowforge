import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// POST /api/templates/:id/clone - Clone a template to create a new pipeline
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    // Find the template with its nodes and edges
    const template = await prisma.pipeline.findFirst({
      where: {
        id,
        isTemplate: true,
      },
      include: {
        nodes: true,
        edges: true,
      },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    // Clone the template as a new pipeline with its nodes and edges
    const newPipeline = await prisma.pipeline.create({
      data: {
        name: body.name || `${template.name} (Copy)`,
        description: body.description || template.description,
        status: "DRAFT",
        ownerAgentId: body.ownerAgentId || null,
        isTemplate: false,
        nodes: {
          create: template.nodes.map((n) => ({
            nodeId: n.nodeId,
            type: n.type,
            label: n.label,
            positionX: n.positionX,
            positionY: n.positionY,
            config: n.config as object,
          })),
        },
        edges: {
          create: template.edges.map((e) => ({
            edgeId: e.edgeId,
            sourceNode: e.sourceNode,
            targetNode: e.targetNode,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle,
            label: e.label,
          })),
        },
      },
      include: {
        nodes: true,
        edges: true,
      },
    });

    return NextResponse.json({
      success: true,
      id: newPipeline.id,
      pipeline: {
        id: newPipeline.id,
        name: newPipeline.name,
        description: newPipeline.description,
        status: newPipeline.status,
        nodes: newPipeline.nodes,
        edges: newPipeline.edges,
        createdAt: newPipeline.createdAt,
      },
      message: `Created pipeline from template: ${template.name}`,
    });
  } catch (error) {
    console.error("Error cloning template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clone template" },
      { status: 500 }
    );
  }
}
