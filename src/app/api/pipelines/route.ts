import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createPipelineSchema } from '@/lib/validations';
import { handleApiError } from '@/lib/errors';

// GET /api/pipelines - List all pipelines
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeNodes = searchParams.get('includeNodes') === 'true';
    const includeEdges = searchParams.get('includeEdges') === 'true';
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const where = status ? { status: status as any } : {};

    const [pipelines, total] = await Promise.all([
      prisma.pipeline.findMany({
        where,
        include: {
          nodes: includeNodes,
          edges: includeEdges,
          _count: {
            select: { runs: true, nodes: true, edges: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.pipeline.count({ where }),
    ]);

    return NextResponse.json({
      data: pipelines,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + pipelines.length < total,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/pipelines - Create a new pipeline
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createPipelineSchema.parse(body);

    const pipeline = await prisma.pipeline.create({
      data: {
        name: validated.name,
        description: validated.description,
        isTemplate: validated.isTemplate,
        ownerAgentId: validated.ownerAgentId,
        nodes: {
          create: validated.nodes.map((node) => ({
            nodeId: node.nodeId,
            type: node.type,
            label: node.label,
            positionX: node.positionX,
            positionY: node.positionY,
            config: node.config as object,
          })),
        },
        edges: {
          create: validated.edges.map((edge) => ({
            edgeId: edge.edgeId,
            sourceNode: edge.sourceNode,
            targetNode: edge.targetNode,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            label: edge.label,
          })),
        },
      },
      include: {
        nodes: true,
        edges: true,
      },
    });

    return NextResponse.json({ data: pipeline }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
