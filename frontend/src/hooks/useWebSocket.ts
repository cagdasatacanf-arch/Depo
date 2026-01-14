/**
 * Custom hook for WebSocket connections with auto-reconnect and heartbeat
 */
import { useState, useEffect, useRef, useCallback } from 'react';

export interface WebSocketMessage {
  type: string;
  ticker?: string;
  data?: any;
  timestamp: string;
  [key: string]: any;
}

export interface WebSocketOptions {
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  lastMessage: WebSocketMessage | null;
  reconnectCount: number;
  error: string | null;
  latency: number;
}

export function useWebSocket(url: string, options: WebSocketOptions = {}) {
  const {
    reconnectAttempts = 3,
    reconnectInterval = 2000,
    heartbeatInterval = 30000,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    lastMessage: null,
    reconnectCount: 0,
    error: null,
    latency: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPingTimeRef = useRef<number>(0);
  const reconnectCountRef = useRef<number>(0);

  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const sendHeartbeat = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      lastPingTimeRef.current = Date.now();
      wsRef.current.send(JSON.stringify({ type: 'ping' }));
    }
  }, []);

  const connect = useCallback(() => {
    // Don't reconnect if we're already connected or connecting
    if (state.isConnected || state.isConnecting) {
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`WebSocket connected to ${url}`);
        setState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          reconnectCount: 0,
        }));
        reconnectCountRef.current = 0;

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(sendHeartbeat, heartbeatInterval);

        if (onConnect) {
          onConnect();
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          // Calculate latency for pong messages
          if (message.type === 'pong') {
            const latency = Date.now() - lastPingTimeRef.current;
            setState((prev) => ({ ...prev, latency }));
          }

          setState((prev) => ({ ...prev, lastMessage: message }));

          if (onMessage) {
            onMessage(message);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState((prev) => ({
          ...prev,
          error: 'WebSocket connection error',
        }));

        if (onError) {
          onError(error);
        }
      };

      ws.onclose = () => {
        console.log(`WebSocket disconnected from ${url}`);
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));

        clearTimers();

        if (onDisconnect) {
          onDisconnect();
        }

        // Attempt reconnection if we haven't exceeded max attempts
        if (reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current += 1;
          setState((prev) => ({
            ...prev,
            reconnectCount: reconnectCountRef.current,
          }));

          const delay = reconnectInterval * Math.pow(2, reconnectCountRef.current - 1);
          console.log(
            `Reconnecting in ${delay}ms (attempt ${reconnectCountRef.current}/${reconnectAttempts})...`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setState((prev) => ({
            ...prev,
            error: `Failed to reconnect after ${reconnectAttempts} attempts`,
          }));
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to create WebSocket',
      }));
    }
  }, [
    url,
    state.isConnected,
    state.isConnecting,
    reconnectAttempts,
    reconnectInterval,
    heartbeatInterval,
    sendHeartbeat,
    clearTimers,
    onConnect,
    onMessage,
    onError,
    onDisconnect,
  ]);

  const disconnect = useCallback(() => {
    clearTimers();
    reconnectCountRef.current = reconnectAttempts; // Prevent auto-reconnect

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setState({
      isConnected: false,
      isConnecting: false,
      lastMessage: null,
      reconnectCount: 0,
      error: null,
      latency: 0,
    });
  }, [reconnectAttempts, clearTimers]);

  const send = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      wsRef.current.send(message);
      return true;
    }
    console.warn('WebSocket is not connected. Cannot send message.');
    return false;
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []); // Empty deps - only run on mount/unmount

  return {
    ...state,
    connect,
    disconnect,
    send,
  };
}
