import { NextRequest } from 'next/server';
import { subscribeToRun, RunEvent } from '@/lib/websocket-events';
import prisma from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/runs/:id/events - Server-Sent Events for a specific pipeline run
 * 
 * Usage:
 *   const eventSource = new EventSource('/api/runs/run_123/events');
 *   eventSource.addEventListener('node:started', (e) => console.log(JSON.parse(e.data)));
 *   eventSource.addEventListener('run:completed', (e) => console.log(JSON.parse(e.data)));
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const { id: runId } = await context.params;

  // Verify the run exists
  const run = await prisma.pipelineRun.findUnique({
    where: { id: runId },
    select: { id: true, status: true },
  });

  if (!run) {
    return new Response(
      JSON.stringify({ error: 'Pipeline run not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let closed = false;

      const sendEvent = (eventType: string, data: object) => {
        if (closed) return;
        try {
          // Send as SSE format with event type
          const eventStr = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(eventStr));
        } catch (error) {
          console.error('[SSE] Error sending event:', error);
        }
      };

      // Send initial connection message with current run status
      sendEvent('connected', {
        runId,
        status: run.status,
        timestamp: new Date().toISOString(),
      });

      // If run is already completed/failed, send final status and close
      if (run.status === 'COMPLETED' || run.status === 'FAILED') {
        sendEvent(run.status === 'COMPLETED' ? 'run:completed' : 'run:failed', {
          runId,
          type: run.status === 'COMPLETED' ? 'run:completed' : 'run:failed',
          status: run.status.toLowerCase(),
          timestamp: new Date().toISOString(),
        });
        closed = true;
        controller.close();
        return;
      }

      // Subscribe to events for this specific run
      const unsubscribe = subscribeToRun(runId, (event: RunEvent) => {
        if (closed) return;

        // Create the pipeline event format
        const pipelineEvent = {
          type: event.type,
          runId,
          nodeId: event.nodeId,
          status: getStatusFromEventType(event.type),
          data: {
            pipelineId: event.pipelineId,
            jobId: event.jobId,
            error: event.error,
            output: event.output,
            outputs: event.outputs,
            progress: event.progress,
          },
          timestamp: event.timestamp,
        };

        sendEvent(event.type, pipelineEvent);

        // Auto-close on terminal events
        if (event.type === 'run:completed' || event.type === 'run:failed') {
          console.log(`[SSE] Run ${runId} finished, closing stream`);
          closed = true;
          setTimeout(() => {
            try {
              controller.close();
            } catch {
              // Already closed
            }
          }, 100);
        }
      });

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        console.log(`[SSE] Client disconnected from run ${runId}`);
        closed = true;
        unsubscribe();
      });

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        if (closed) {
          clearInterval(heartbeatInterval);
          return;
        }
        sendEvent('heartbeat', {
          runId,
          timestamp: new Date().toISOString(),
        });
      }, 30000);

      // Cleanup on abort
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}

function getStatusFromEventType(eventType: string): string {
  switch (eventType) {
    case 'run:started':
    case 'node:started':
      return 'running';
    case 'run:completed':
    case 'node:completed':
      return 'completed';
    case 'run:failed':
    case 'node:failed':
      return 'failed';
    case 'job:created':
      return 'job_created';
    case 'job:progress':
      return 'in_progress';
    default:
      return 'unknown';
  }
}
