import { Activity, Wifi, Clock, RefreshCw, Radio } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WebSocketMetricsPanelProps {
  isConnected: boolean;
  isConnecting: boolean;
  latency: number;
  reconnectCount: number;
  realtimeMode: boolean;
  lastUpdated?: Date | null;
  error?: string | null;
}

export const WebSocketMetricsPanel = ({
  isConnected,
  isConnecting,
  latency,
  reconnectCount,
  realtimeMode,
  lastUpdated,
  error,
}: WebSocketMetricsPanelProps) => {
  const formatTime = (date: Date | null | undefined) => {
    if (!date) return 'N/A';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getLatencyColor = (lat: number) => {
    if (lat === 0) return 'text-muted-foreground';
    if (lat < 100) return 'text-success';
    if (lat < 300) return 'text-yellow-500';
    return 'text-destructive';
  };

  const getStatusColor = () => {
    if (isConnecting) return 'text-yellow-500';
    if (isConnected) return 'text-success';
    return 'text-destructive';
  };

  const getStatusText = () => {
    if (!realtimeMode) return 'Polling Mode';
    if (isConnecting) return 'Connecting...';
    if (isConnected) return 'Connected';
    return 'Disconnected';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          WebSocket Metrics
        </CardTitle>
        <CardDescription>Real-time connection status and performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className={cn('h-4 w-4', getStatusColor())} />
            <span className="text-sm font-medium">Connection</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-semibold', getStatusColor())}>
              {getStatusText()}
            </span>
            {isConnecting && (
              <RefreshCw className="h-3 w-3 animate-spin text-yellow-500" />
            )}
          </div>
        </div>

        {/* Mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Mode</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {realtimeMode ? 'Real-time' : 'Polling'}
          </span>
        </div>

        {/* Latency */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Latency</span>
          </div>
          <span className={cn('text-sm font-mono', getLatencyColor(latency))}>
            {latency > 0 ? `${latency}ms` : 'N/A'}
          </span>
        </div>

        {/* Reconnection Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Reconnects</span>
          </div>
          <span
            className={cn(
              'text-sm font-mono',
              reconnectCount > 0 ? 'text-yellow-500' : 'text-muted-foreground'
            )}
          >
            {reconnectCount}
          </span>
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Last Update</span>
          </div>
          <span className="text-sm text-muted-foreground font-mono">
            {formatTime(lastUpdated)}
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-xs text-destructive font-medium">Error</p>
            <p className="text-xs text-destructive/80 mt-1">{error}</p>
          </div>
        )}

        {/* Status Badge */}
        <div className="mt-4 pt-4 border-t border-border">
          <div
            className={cn(
              'flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium',
              isConnected && 'bg-success/10 text-success',
              isConnecting && 'bg-yellow-500/10 text-yellow-500',
              !isConnected && !isConnecting && realtimeMode && 'bg-destructive/10 text-destructive',
              !realtimeMode && 'bg-muted text-muted-foreground'
            )}
          >
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                isConnected && 'bg-success',
                isConnecting && 'bg-yellow-500 animate-pulse',
                !isConnected && !isConnecting && realtimeMode && 'bg-destructive',
                !realtimeMode && 'bg-gray-400'
              )}
            />
            {realtimeMode ? (
              isConnected ? (
                'WebSocket Active'
              ) : isConnecting ? (
                'Establishing Connection'
              ) : (
                'Connection Lost'
              )
            ) : (
              'Polling Mode Active'
            )}
          </div>
        </div>

        {/* Connection Info */}
        {realtimeMode && (
          <div className="text-xs text-muted-foreground text-center mt-2">
            {isConnected && (
              <p>Receiving live price updates via WebSocket</p>
            )}
            {isConnecting && (
              <p>Attempting to establish connection... ({reconnectCount + 1}/3)</p>
            )}
            {!isConnected && !isConnecting && reconnectCount >= 3 && (
              <p className="text-destructive">
                Maximum reconnection attempts reached. Switched to polling mode.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
