import { NextRequest } from 'next/server';
import { subscribeToRun, RunEvent } from '@/lib/websocket-events';
import prisma from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/runs/:id/events - Server-Sent Events for real-time pipeline updates
 * 
 * Usage:
 *   const eventSource = new EventSource('/api/runs/run-id-here/events');
 *   eventSource.onmessage = (e) => console.log(JSON.parse(e.data));
 *   eventSource.addEventListener('node:completed', (e) => console.log(e.data));
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  // Verify run exists
  const run = await prisma.pipelineRun.findUnique({
    where: { id },
  });

  if (!run) {
    return new Response(JSON.stringify({ error: 'Run not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection message
      const connectMsg = `data: ${JSON.stringify({
        type: 'connected',
        runId: id,
        status: run.status,
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(encoder.encode(connectMsg));

      // Subscribe to run events
      const unsubscribe = subscribeToRun(id, (event: RunEvent) => {
        try {
          // Send as SSE format: "event: type\ndata: json\n\n"
          const eventStr = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(eventStr));

          // Also send as generic message event
          const msgStr = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(msgStr));

          // Close stream on terminal events
          if (event.type === 'run:completed' || event.type === 'run:failed') {
            setTimeout(() => {
              unsubscribe();
              controller.close();
            }, 1000); // Small delay to ensure message is sent
          }
        } catch (error) {
          console.error('[SSE] Error sending event:', error);
        }
      });

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        console.log(`[SSE] Client disconnected from run ${id}`);
        unsubscribe();
      });

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = `data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`;
          controller.enqueue(encoder.encode(heartbeat));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      // Cleanup on close
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
