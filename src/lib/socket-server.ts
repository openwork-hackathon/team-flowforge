/**
 * WebSocket Server for Real-time Pipeline Events
 * Uses Socket.io for bidirectional communication
 */
import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { RunEvent, subscribeToRun, RunEventType } from './websocket-events';

// Singleton instance
let io: Server | null = null;

// Track client subscriptions for cleanup
const clientSubscriptions = new Map<string, Set<() => void>>();

export interface PipelineEvent {
  type: 'run:started' | 'node:started' | 'node:completed' | 'node:failed' | 'run:completed' | 'run:failed' | 'job:created' | 'job:progress';
  runId: string;
  nodeId?: string;
  status: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Convert internal RunEvent to PipelineEvent format
 */
function toPipelineEvent(runId: string, event: RunEvent): PipelineEvent {
  const statusMap: Record<RunEventType, string> = {
    [RunEventType.RUN_STARTED]: 'running',
    [RunEventType.RUN_COMPLETED]: 'completed',
    [RunEventType.RUN_FAILED]: 'failed',
    [RunEventType.NODE_STARTED]: 'running',
    [RunEventType.NODE_COMPLETED]: 'completed',
    [RunEventType.NODE_FAILED]: 'failed',
    [RunEventType.JOB_CREATED]: 'job_created',
    [RunEventType.JOB_PROGRESS]: 'in_progress',
  };

  return {
    type: event.type as PipelineEvent['type'],
    runId,
    nodeId: event.nodeId,
    status: statusMap[event.type] || 'unknown',
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
}

/**
 * Initialize Socket.io server
 */
export function initSocketServer(httpServer: HTTPServer): Server {
  if (io) {
    console.log('[Socket.io] Server already initialized');
    return io;
  }

  io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);
    
    // Track subscriptions for this client
    clientSubscriptions.set(socket.id, new Set());

    // Handle subscribe to specific run
    socket.on('subscribe', (runId: string) => {
      if (!runId || typeof runId !== 'string') {
        socket.emit('error', { message: 'Invalid runId' });
        return;
      }

      console.log(`[Socket.io] Client ${socket.id} subscribing to run: ${runId}`);
      
      // Join the room for this run
      socket.join(`run:${runId}`);
      
      // Subscribe to events from the execution engine
      const unsubscribe = subscribeToRun(runId, (event: RunEvent) => {
        const pipelineEvent = toPipelineEvent(runId, event);
        // Emit to the specific room
        io?.to(`run:${runId}`).emit('pipeline:event', pipelineEvent);
      });

      // Track for cleanup
      clientSubscriptions.get(socket.id)?.add(unsubscribe);

      // Confirm subscription
      socket.emit('subscribed', { runId, timestamp: new Date().toISOString() });
    });

    // Handle unsubscribe from specific run
    socket.on('unsubscribe', (runId: string) => {
      if (!runId || typeof runId !== 'string') {
        socket.emit('error', { message: 'Invalid runId' });
        return;
      }

      console.log(`[Socket.io] Client ${socket.id} unsubscribing from run: ${runId}`);
      socket.leave(`run:${runId}`);
      socket.emit('unsubscribed', { runId, timestamp: new Date().toISOString() });
    });

    // Handle subscribe to all events (dashboard monitoring)
    socket.on('subscribe:all', () => {
      console.log(`[Socket.io] Client ${socket.id} subscribing to all events`);
      socket.join('run:*');
      
      const unsubscribe = subscribeToRun('*', (event: RunEvent) => {
        const pipelineEvent = toPipelineEvent('*', event);
        io?.to('run:*').emit('pipeline:event', pipelineEvent);
      });

      clientSubscriptions.get(socket.id)?.add(unsubscribe);
      socket.emit('subscribed', { runId: '*', timestamp: new Date().toISOString() });
    });

    // Handle client disconnect
    socket.on('disconnect', (reason) => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}, reason: ${reason}`);
      
      // Cleanup all subscriptions for this client
      const subs = clientSubscriptions.get(socket.id);
      if (subs) {
        for (const unsubscribe of subs) {
          unsubscribe();
        }
        clientSubscriptions.delete(socket.id);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`[Socket.io] Socket error for ${socket.id}:`, error);
    });
  });

  console.log('[Socket.io] Server initialized');
  return io;
}

/**
 * Get the Socket.io server instance
 */
export function getSocketServer(): Server | null {
  return io;
}

/**
 * Broadcast event to a specific run's subscribers
 */
export function broadcastToRun(runId: string, event: PipelineEvent): void {
  if (io) {
    io.to(`run:${runId}`).emit('pipeline:event', event);
  }
}

/**
 * Get connected client count
 */
export async function getConnectedClientCount(): Promise<number> {
  if (!io) return 0;
  const sockets = await io.fetchSockets();
  return sockets.length;
}

/**
 * Get subscribers for a specific run
 */
export async function getRunSubscribers(runId: string): Promise<number> {
  if (!io) return 0;
  const sockets = await io.in(`run:${runId}`).fetchSockets();
  return sockets.length;
}
