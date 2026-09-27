export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertState = 'OK' | 'Pending' | 'Firing' | 'Resolved';

export interface MetricDataPoint {
  timestamp: number;
  value: number;
}

export interface MetricSeries {
  id: string;
  name: string;
  labels: Record<string, string>;
  data: MetricDataPoint[];
  color: string;
  unit: string;
  type: 'gauge' | 'counter' | 'histogram';
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'fatal' | 'debug';
  service: string;
  message: string;
  traceId?: string;
  spanId?: string;
  attributes?: Record<string, any>;
}

export interface TraceSpan {
  id: string;
  name: string;
  service: string;
  startTime: number; // offset ms
  duration: number; // ms
  status: 'ok' | 'error';
  parentId?: string;
  tags: Record<string, string>;
}

export interface DistributedTrace {
  id: string;
  traceId: string;
  rootService: string;
  name: string;
  duration: number;
  status: 'ok' | 'error';
  timestamp: number;
  spans: TraceSpan[];
}

export interface AlertRule {
  id: string;
  name: string;
  expr: string;
  duration: string; // e.g. "2m"
  severity: AlertSeverity;
  threshold: number;
  comparison: '>' | '>=' | '<' | '<=' | '==';
  metricName: string;
  description: string;
  runbookUrl?: string;
  enabled: boolean;
}

export interface AlertInstance {
  id: string;
  ruleId: string;
  ruleName: string;
  state: AlertState;
  severity: AlertSeverity;
  currentValue: number;
  threshold: number;
  startedAt: number;
  pendingSince?: number;
  resolvedAt?: number;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
  silencedUntil?: number;
  service: string;
  details: string;
  notes?: string;
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'slack' | 'telegram' | 'webhook' | 'pagerduty' | 'email';
  destination: string;
  enabled: boolean;
  events: ('firing' | 'resolved' | 'acknowledged')[];
  lastDelivery?: {
    status: 'success' | 'failed';
    timestamp: number;
  };
}

export interface ServiceNode {
  id: string;
  name: string;
  type: 'ingress' | 'gateway' | 'service' | 'database' | 'cache' | 'worker';
  rps: number;
  latencyMs: number;
  errorRate: number;
  status: 'healthy' | 'degraded' | 'critical';
  dependencies: string[];
}

export interface SystemEngineStats {
  ingestRateRps: number;
  activeSeriesCount: number;
  totalDataPoints: number;
  rawBytes: number;
  compressedBytes: number;
  compressionRatio: number;
  bytesPerSample: number;
  queryLatencyP99Ms: number;
  tsdbWriteAmplification: number;
  goroutines: number;
  memoryUsageMb: number;
}

export type ScenarioType = 'normal' | 'ddos_spike' | 'db_exhaustion' | 'memory_leak';
