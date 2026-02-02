/**
 * Pipeline Event Types
 * Used for WebSocket and SSE real-time event communication
 */

export type PipelineEventType =
  | 'run:started'
  | 'node:started'
  | 'node:completed'
  | 'node:failed'
  | 'run:completed'
  | 'run:failed'
  | 'job:created'
  | 'job:progress';

/**
 * Pipeline Event Interface
 * Standard format for all pipeline execution events
 */
export interface PipelineEvent {
  /** Event type identifier */
  type: PipelineEventType;
  /** Pipeline run ID */
  runId: string;
  /** Node ID (for node-specific events) */
  nodeId?: string;
  /** Current status */
  status: string;
  /** Additional event data */
  data?: Record<string, unknown>;
  /** ISO timestamp when event occurred */
  timestamp: string;
}

/**
 * WebSocket subscription message from client to server
 */
export interface SubscribeMessage {
  action: 'subscribe' | 'unsubscribe';
  runId: string;
}

/**
 * WebSocket acknowledgment from server to client
 */
export interface SubscriptionAck {
  action: 'subscribed' | 'unsubscribed';
  runId: string;
  timestamp: string;
}

/**
 * Connection status event
 */
export interface ConnectionEvent {
  type: 'connected' | 'disconnected';
  runId?: string;
  scope?: 'run' | 'all';
  timestamp: string;
}

/**
 * Heartbeat event to keep connection alive
 */
export interface HeartbeatEvent {
  type: 'heartbeat';
  runId?: string;
  timestamp: string;
}
