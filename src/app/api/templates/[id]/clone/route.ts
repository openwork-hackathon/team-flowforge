import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/templates/:id/clone - Clone a template to create a new pipeline
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    
    // Find the template
    const template = await prisma.pipeline.findFirst({
      where: {
        id,
        isTemplate: true,
      },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    // Clone the template as a new pipeline
    const newPipeline = await prisma.pipeline.create({
      data: {
        name: body.name || `${template.name} (Copy)`,
        description: body.description || template.description,
        status: "draft",
        dagJson: template.dagJson as object,
        ownerAgentId: body.ownerAgentId || null,
        isTemplate: false, // This is a real pipeline, not a template
      },
    });

    return NextResponse.json({
      success: true,
      pipeline: {
        id: newPipeline.id,
        name: newPipeline.name,
        description: newPipeline.description,
        status: newPipeline.status,
        dagJson: newPipeline.dagJson,
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
