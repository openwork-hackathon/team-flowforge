'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * Pipeline Event interface matching the server-side PipelineEvent
 */
export interface PipelineEvent {
  type:
    | 'run:started'
    | 'node:started'
    | 'node:completed'
    | 'node:failed'
    | 'run:completed'
    | 'run:failed'
    | 'job:created'
    | 'job:progress';
  runId: string;
  nodeId?: string;
  status: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

export interface UsePipelineEventsOptions {
  /** Use WebSocket (Socket.io) instead of SSE. Default: false */
  useWebSocket?: boolean;
  /** Auto-reconnect on disconnect. Default: true */
  autoReconnect?: boolean;
  /** Callback when connection state changes */
  onConnectionChange?: (connected: boolean) => void;
}

export interface UsePipelineEventsReturn {
  /** Array of received events */
  events: PipelineEvent[];
  /** Current connection status */
  connected: boolean;
  /** Latest event received */
  latestEvent: PipelineEvent | null;
  /** Whether the run is in a terminal state */
  isComplete: boolean;
  /** Error if any */
  error: Error | null;
  /** Manually disconnect */
  disconnect: () => void;
  /** Manually reconnect */
  reconnect: () => void;
  /** Clear events */
  clearEvents: () => void;
}

/**
 * React hook for subscribing to real-time pipeline events
 * 
 * @example
 * ```tsx
 * function PipelineMonitor({ runId }: { runId: string }) {
 *   const { events, connected, isComplete, latestEvent } = usePipelineEvents(runId);
 * 
 *   return (
 *     <div>
 *       <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
 *       <p>Complete: {isComplete ? 'Yes' : 'No'}</p>
 *       <ul>
 *         {events.map((event, i) => (
 *           <li key={i}>{event.type}: {event.nodeId || 'pipeline'}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePipelineEvents(
  runId: string | null,
  options: UsePipelineEventsOptions = {}
): UsePipelineEventsReturn {
  const { useWebSocket = false, autoReconnect = true, onConnectionChange } = options;

  const [events, setEvents] = useState<PipelineEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setConnected(false);
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setIsComplete(false);
    setError(null);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    // Will trigger re-connection via useEffect
    setConnected(false);
  }, [disconnect]);

  useEffect(() => {
    if (!runId) return;

    const handleEvent = (event: PipelineEvent) => {
      setEvents((prev) => [...prev, event]);
      
      // Check for terminal states
      if (event.type === 'run:completed' || event.type === 'run:failed') {
        setIsComplete(true);
      }
    };

    if (useWebSocket) {
      // Socket.io connection
      const socket = io({
        path: '/api/socket',
        transports: ['websocket', 'polling'],
        reconnection: autoReconnect,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('[usePipelineEvents] Socket connected');
        setConnected(true);
        setError(null);
        onConnectionChange?.(true);
        
        // Subscribe to the run
        socket.emit('subscribe', runId);
      });

      socket.on('disconnect', () => {
        console.log('[usePipelineEvents] Socket disconnected');
        setConnected(false);
        onConnectionChange?.(false);
      });

      socket.on('connect_error', (err) => {
        console.error('[usePipelineEvents] Connection error:', err);
        setError(new Error(err.message));
      });

      socket.on('pipeline:event', (event: PipelineEvent) => {
        if (event.runId === runId || event.runId === '*') {
          handleEvent(event);
        }
      });

      socket.on('subscribed', (data: { runId: string }) => {
        console.log('[usePipelineEvents] Subscribed to:', data.runId);
      });

      socket.on('error', (error: { message: string }) => {
        console.error('[usePipelineEvents] Socket error:', error);
        setError(new Error(error.message));
      });

      return () => {
        socket.emit('unsubscribe', runId);
        socket.disconnect();
      };
    } else {
      // Server-Sent Events connection
      const eventSource = new EventSource(`/api/runs/${runId}/events`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('[usePipelineEvents] SSE connected');
        setConnected(true);
        setError(null);
        onConnectionChange?.(true);
      };

      eventSource.onerror = (err) => {
        console.error('[usePipelineEvents] SSE error:', err);
        setConnected(false);
        onConnectionChange?.(false);
        
        if (eventSource.readyState === EventSource.CLOSED) {
          setError(new Error('Connection closed'));
        }
      };

      // Listen to specific event types
      const eventTypes = [
        'connected',
        'run:started',
        'node:started',
        'node:completed',
        'node:failed',
        'run:completed',
        'run:failed',
        'job:created',
        'job:progress',
        'heartbeat',
      ];

      eventTypes.forEach((eventType) => {
        eventSource.addEventListener(eventType, ((e: MessageEvent) => {
          if (eventType === 'heartbeat' || eventType === 'connected') return;
          
          try {
            const event = JSON.parse(e.data) as PipelineEvent;
            handleEvent(event);
          } catch (err) {
            console.error('[usePipelineEvents] Failed to parse event:', err);
          }
        }) as EventListener);
      });

      return () => {
        eventSource.close();
      };
    }
  }, [runId, useWebSocket, autoReconnect, onConnectionChange]);

  const latestEvent = events.length > 0 ? events[events.length - 1] : null;

  return {
    events,
    connected,
    latestEvent,
    isComplete,
    error,
    disconnect,
    reconnect,
    clearEvents,
  };
}

/**
 * Hook for monitoring all pipeline events (dashboard use)
 */
export function useAllPipelineEvents(
  options: Omit<UsePipelineEventsOptions, 'useWebSocket'> = {}
): UsePipelineEventsReturn {
  const { autoReconnect = true, onConnectionChange } = options;

  const [events, setEvents] = useState<PipelineEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setConnected(false);
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setError(null);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setConnected(false);
  }, [disconnect]);

  useEffect(() => {
    // Use SSE for all events (simpler for monitoring)
    const eventSource = new EventSource('/api/events');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('[useAllPipelineEvents] Connected');
      setConnected(true);
      setError(null);
      onConnectionChange?.(true);
    };

    eventSource.onerror = () => {
      setConnected(false);
      onConnectionChange?.(false);
    };

    eventSource.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        if (event.type && event.type !== 'connected' && event.type !== 'heartbeat') {
          setEvents((prev) => [...prev.slice(-99), event]); // Keep last 100 events
        }
      } catch (err) {
        console.error('[useAllPipelineEvents] Failed to parse:', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [autoReconnect, onConnectionChange]);

  const latestEvent = events.length > 0 ? events[events.length - 1] : null;

  return {
    events,
    connected,
    latestEvent,
    isComplete: false, // N/A for all events
    error,
    disconnect,
    reconnect,
    clearEvents,
  };
}
