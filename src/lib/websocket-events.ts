/**
 * WebSocket Event Types for Pipeline Execution
 */
export enum RunEventType {
  // Pipeline run events
  RUN_STARTED = 'run:started',
  RUN_COMPLETED = 'run:completed',
  RUN_FAILED = 'run:failed',

  // Node events
  NODE_STARTED = 'node:started',
  NODE_COMPLETED = 'node:completed',
  NODE_FAILED = 'node:failed',

  // Job events
  JOB_CREATED = 'job:created',
  JOB_PROGRESS = 'job:progress',
}

export interface RunEvent {
  type: RunEventType;
  nodeId?: string;
  pipelineId?: string;
  jobId?: string;
  error?: string;
  output?: Record<string, unknown>;
  outputs?: Array<{ nodeId: string; output: unknown }>;
  progress?: number;
  timestamp: string;
}

// In-memory subscriber map (in production, use Redis pub/sub)
type EventCallback = (event: RunEvent) => void;
const subscribers = new Map<string, Set<EventCallback>>();

/**
 * Subscribe to events for a specific run
 */
export function subscribeToRun(runId: string, callback: EventCallback): () => void {
  if (!subscribers.has(runId)) {
    subscribers.set(runId, new Set());
  }
  subscribers.get(runId)!.add(callback);

  // Return unsubscribe function
  return () => {
    const subs = subscribers.get(runId);
    if (subs) {
      subs.delete(callback);
      if (subs.size === 0) {
        subscribers.delete(runId);
      }
    }
  };
}

/**
 * Emit an event for a specific run
 */
export function emitRunEvent(runId: string, event: RunEvent): void {
  console.log(`[WebSocket] Emitting event for run ${runId}:`, event.type);
  
  const subs = subscribers.get(runId);
  if (subs) {
    for (const callback of Array.from(subs)) {
      try {
        callback(event);
      } catch (error) {
        console.error('[WebSocket] Error in event callback:', error);
      }
    }
  }

  // Also emit to "all" subscribers (for dashboard monitoring)
  const allSubs = subscribers.get('*');
  if (allSubs) {
    for (const callback of Array.from(allSubs)) {
      try {
        callback({ ...event, pipelineId: event.pipelineId });
      } catch (error) {
        console.error('[WebSocket] Error in all-events callback:', error);
      }
    }
  }
}

/**
 * Get current subscriber count for a run
 */
export function getSubscriberCount(runId: string): number {
  return subscribers.get(runId)?.size || 0;
}
