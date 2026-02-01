import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { completeNode, failNode } from '@/lib/execution-engine';
import { stopPolling } from '@/lib/job-poller';

/**
 * POST /api/webhooks/openwork - Webhook for Openwork job completion
 * 
 * Expected payload:
 * {
 *   jobId: string;
 *   status: 'completed' | 'failed' | 'cancelled';
 *   result?: unknown;
 *   error?: string;
 *   metadata?: {
 *     runId: string;
 *     nodeId: string;
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Webhook] Received Openwork webhook:', body);

    const { jobId, status, result, error, metadata } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Missing jobId' },
        { status: 400 }
      );
    }

    // Find the NodeRun by openworkJobId
    const nodeRun = await prisma.nodeRun.findFirst({
      where: { openworkJobId: jobId },
      include: {
        pipelineRun: true,
      },
    });

    if (!nodeRun) {
      console.log(`[Webhook] No NodeRun found for job ${jobId}`);
      return NextResponse.json(
        { error: 'NodeRun not found for this job' },
        { status: 404 }
      );
    }

    // Stop polling since we got webhook
    const pollKey = `${nodeRun.pipelineRunId}:${nodeRun.nodeId}`;
    stopPolling(pollKey);

    // Handle based on status
    if (status === 'completed' || status === 'done') {
      await completeNode(nodeRun.pipelineRunId, nodeRun.nodeId, {
        jobId,
        result,
        webhookReceived: true,
      });
      
      return NextResponse.json({
        success: true,
        message: 'Node marked as completed',
      });
    }

    if (status === 'failed' || status === 'cancelled') {
      await failNode(
        nodeRun.pipelineRunId,
        nodeRun.nodeId,
        error || `Job ${status}`
      );
      
      return NextResponse.json({
        success: true,
        message: 'Node marked as failed',
      });
    }

    // Unknown status - log but don't fail
    console.log(`[Webhook] Unknown job status: ${status}`);
    return NextResponse.json({
      success: true,
      message: `Status ${status} acknowledged`,
    });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/openwork - Webhook verification endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'FlowForge Openwork webhook endpoint',
    timestamp: new Date().toISOString(),
  });
}
