import { NextRequest } from 'next/server';
import { subscribeToRun, RunEvent } from '@/lib/websocket-events';

/**
 * GET /api/events - Server-Sent Events for ALL pipeline run updates
 * Useful for monitoring dashboards
 * 
 * Usage:
 *   const eventSource = new EventSource('/api/events');
 *   eventSource.onmessage = (e) => console.log(JSON.parse(e.data));
 */
export async function GET(request: NextRequest) {
  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection message
      const connectMsg = `data: ${JSON.stringify({
        type: 'connected',
        scope: 'all',
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(encoder.encode(connectMsg));

      // Subscribe to ALL run events (using wildcard)
      const unsubscribe = subscribeToRun('*', (event: RunEvent) => {
        try {
          // Send as SSE format: "event: type\ndata: json\n\n"
          const eventStr = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(eventStr));

          // Also send as generic message event
          const msgStr = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(msgStr));
        } catch (error) {
          console.error('[SSE Global] Error sending event:', error);
        }
      });

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        console.log('[SSE Global] Client disconnected');
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
