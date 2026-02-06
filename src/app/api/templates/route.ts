import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

// GET /api/templates - Get all pipeline templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const [templates, total] = await Promise.all([
      prisma.pipeline.findMany({
        where: { isTemplate: true },
        include: {
          nodes: true,
          edges: true,
          _count: {
            select: { runs: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.pipeline.count({ where: { isTemplate: true } }),
    ]);

    return NextResponse.json({
      data: templates,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + templates.length < total,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
