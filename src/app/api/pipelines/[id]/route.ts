import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { updatePipelineSchema } from '@/lib/validations';
import { ApiError, handleApiError } from '@/lib/errors';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/pipelines/:id - Get a single pipeline
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const pipeline = await prisma.pipeline.findUnique({
      where: { id },
      include: {
        nodes: true,
        edges: true,
        _count: {
          select: { runs: true },
        },
      },
    });

    if (!pipeline) {
      throw new ApiError(404, 'Pipeline not found', 'NOT_FOUND');
    }

    return NextResponse.json({ data: pipeline });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/pipelines/:id - Update a pipeline
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const validated = updatePipelineSchema.parse(body);

    // Check if pipeline exists
    const existing = await prisma.pipeline.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Pipeline not found', 'NOT_FOUND');
    }

    // Use transaction to update nodes and edges atomically
    const pipeline = await prisma.$transaction(async (tx) => {
      // Update basic fields
      const updateData: any = {};
      if (validated.name !== undefined) updateData.name = validated.name;
      if (validated.description !== undefined) updateData.description = validated.description;
      if (validated.status !== undefined) updateData.status = validated.status;
      if (validated.isTemplate !== undefined) updateData.isTemplate = validated.isTemplate;

      // If nodes are provided, replace all nodes
      if (validated.nodes !== undefined) {
        await tx.pipelineNode.deleteMany({ where: { pipelineId: id } });
        await tx.pipelineNode.createMany({
          data: validated.nodes.map((node) => ({
            pipelineId: id,
            nodeId: node.nodeId,
            type: node.type,
            label: node.label,
            positionX: node.positionX,
            positionY: node.positionY,
            config: node.config as object,
          })),
        });
      }

      // If edges are provided, replace all edges
      if (validated.edges !== undefined) {
        await tx.pipelineEdge.deleteMany({ where: { pipelineId: id } });
        await tx.pipelineEdge.createMany({
          data: validated.edges.map((edge) => ({
            pipelineId: id,
            edgeId: edge.edgeId,
            sourceNode: edge.sourceNode,
            targetNode: edge.targetNode,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            label: edge.label,
          })),
        });
      }

      return tx.pipeline.update({
        where: { id },
        data: updateData,
        include: {
          nodes: true,
          edges: true,
        },
      });
    });

    return NextResponse.json({ data: pipeline });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/pipelines/:id - Delete a pipeline
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Check if pipeline exists
    const existing = await prisma.pipeline.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Pipeline not found', 'NOT_FOUND');
    }

    await prisma.pipeline.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Pipeline deleted' });
  } catch (error) {
    return handleApiError(error);
  }
}
