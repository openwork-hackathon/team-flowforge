import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/templates/:id - Get a specific template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}
