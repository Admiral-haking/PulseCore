import {
  AlertInstance,
  AlertRule,
  DistributedTrace,
  LogEntry,
  MetricSeries,
  ScenarioType,
  ServiceNode,
  SystemEngineStats,
} from '../types/observability';

// Initial default alert rules
export const INITIAL_ALERT_RULES: AlertRule[] = [
  {
    id: 'rule-high-error-rate',
    name: 'نرخ خطای بحرانی ۵xx در سرویس احراز هویت (High 5xx Rate)',
    expr: 'rate(http_requests_total{status=~"5.."}[2m]) / rate(http_requests_total[2m]) * 100 > 5',
    duration: '1m',
    severity: 'critical',
    metricName: 'http_5xx_rate_pct',
    threshold: 5.0,
    comparison: '>',
    description: 'درصد پاسخ‌های ۵xx در ۲ دقیقه گذشته از ۵٪ فراتر رفته است.',
    runbookUrl: 'https://wiki.internal/ops/auth-service-5xx',
    enabled: true,
  },
  {
    id: 'rule-high-latency-p95',
    name: 'تأخیر بحرانی P95 در درگاه API (High P95 Latency)',
    expr: 'histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 450',
    duration: '2m',
    severity: 'warning',
    metricName: 'api_latency_p95_ms',
    threshold: 450,
    comparison: '>',
    description: 'تأخیر ۹۵ درصدی درخواست‌ها از ۴۵۰ میلی‌ثانیه عبور کرده است.',
    runbookUrl: 'https://wiki.internal/ops/latency-mitigation',
    enabled: true,
  },
  {
    id: 'rule-db-connections',
    name: 'اشباع استخر کانکشن‌های دیتابیس (DB Connection Exhaustion)',
    expr: 'postgresql_active_connections / postgresql_max_connections * 100 > 85',
    duration: '1m',
    severity: 'critical',
    metricName: 'db_connection_pool_pct',
    threshold: 85,
    comparison: '>',
    description: 'بیش از ۸۵ درصد کانکشن‌های PostgreSQL مصرف شده و خطر قطعی وجود دارد.',
    runbookUrl: 'https://wiki.internal/ops/postgres-connections',
    enabled: true,
  },
  {
    id: 'rule-high-memory',
    name: 'مصرف بیش از حد رم در کلاستر ورکرها (Worker Node Memory Leak)',
    expr: 'node_memory_working_set_bytes / node_memory_total_bytes * 100 > 90',
    duration: '3m',
    severity: 'warning',
    metricName: 'worker_memory_pct',
    threshold: 90,
    comparison: '>',
    description: 'مصرف رم در ورکرها رو به افزایش است و احتمال OOMKilled شدن پادها وجود دارد.',
    runbookUrl: 'https://wiki.internal/ops/k8s-oom-recovery',
    enabled: true,
  },
];

// Initial mock microservices topology
export const INITIAL_SERVICES: ServiceNode[] = [
  {
    id: 'edge-ingress',
    name: 'Cloudflare Ingress',
    type: 'ingress',
    rps: 12400,
    latencyMs: 14,
    errorRate: 0.04,
    status: 'healthy',
    dependencies: ['api-gateway'],
  },
  {
    id: 'api-gateway',
    name: 'API Gateway (Envoy/Kong)',
    type: 'gateway',
    rps: 11950,
    latencyMs: 28,
    errorRate: 0.12,
    status: 'healthy',
    dependencies: ['auth-service', 'orders-service', 'inventory-service'],
  },
  {
    id: 'auth-service',
    name: 'Auth & SSO Service',
    type: 'service',
    rps: 4200,
    latencyMs: 45,
    errorRate: 0.08,
    status: 'healthy',
    dependencies: ['redis-cache', 'postgres-primary'],
  },
  {
    id: 'orders-service',
    name: 'Orders & Checkout API',
    type: 'service',
    rps: 3100,
    latencyMs: 65,
    errorRate: 0.2,
    status: 'healthy',
    dependencies: ['postgres-primary', 'kafka-events'],
  },
  {
    id: 'inventory-service',
    name: 'Inventory Engine',
    type: 'service',
    rps: 2400,
    latencyMs: 38,
    errorRate: 0.05,
    status: 'healthy',
    dependencies: ['postgres-primary', 'redis-cache'],
  },
  {
    id: 'postgres-primary',
    name: 'PostgreSQL Primary (HA)',
    type: 'database',
    rps: 8400,
    latencyMs: 12,
    errorRate: 0.0,
    status: 'healthy',
    dependencies: [],
  },
  {
    id: 'redis-cache',
    name: 'Redis Cluster (Cache/Session)',
    type: 'cache',
    rps: 18200,
    latencyMs: 1.4,
    errorRate: 0.0,
    status: 'healthy',
    dependencies: [],
  },
];

export function generateInitialHistory(pointsCount: number = 30): Record<string, MetricSeries> {
  const now = Date.now();
  const step = 5000; // 5 seconds
  const seriesMap: Record<string, MetricSeries> = {
    http_5xx_rate_pct: {
      id: 's-5xx',
      name: 'rate(http_5xx_errors_pct)',
      labels: { service: 'auth-service', env: 'production' },
      data: [],
      color: '#EF4444',
      unit: '%',
      type: 'gauge',
    },
    api_latency_p95_ms: {
      id: 's-latency',
      name: 'latency_p95_duration_ms',
      labels: { gateway: 'kong-main', region: 'eu-central' },
      data: [],
      color: '#F59E0B',
      unit: 'ms',
      type: 'histogram',
    },
    db_connection_pool_pct: {
      id: 's-db',
      name: 'postgresql_pool_usage_pct',
      labels: { cluster: 'db-aurora-01', db: 'orders' },
      data: [],
      color: '#6366F1',
      unit: '%',
      type: 'gauge',
    },
    worker_memory_pct: {
      id: 's-mem',
      name: 'worker_node_memory_used_pct',
      labels: { nodepool: 'compute-pool-a', tenant: 'system' },
      data: [],
      color: '#06B6D4',
      unit: '%',
      type: 'gauge',
    },
    ingest_throughput_rps: {
      id: 's-ingest',
      name: 'tsdb_ingest_points_per_sec',
      labels: { collector: 'pulsecore-agent', host: 'cluster-edge' },
      data: [],
      color: '#10B981',
      unit: 'pts/s',
      type: 'counter',
    },
  };

  for (let i = pointsCount - 1; i >= 0; i--) {
    const t = now - i * step;
    seriesMap.http_5xx_rate_pct.data.push({
      timestamp: t,
      value: +(0.4 + Math.random() * 0.8).toFixed(2),
    });
    seriesMap.api_latency_p95_ms.data.push({
      timestamp: t,
      value: +(110 + Math.random() * 35).toFixed(1),
    });
    seriesMap.db_connection_pool_pct.data.push({
      timestamp: t,
      value: +(42 + Math.random() * 12).toFixed(1),
    });
    seriesMap.worker_memory_pct.data.push({
      timestamp: t,
      value: +(64 + Math.random() * 4).toFixed(1),
    });
    seriesMap.ingest_throughput_rps.data.push({
      timestamp: t,
      value: Math.floor(48000 + Math.random() * 6000),
    });
  }

  return seriesMap;
}

// Generate next tick metrics based on active incident scenario
export function getNextMetricValue(
  metricKey: string,
  scenario: ScenarioType,
  currentValue: number
): number {
  const noise = (Math.random() - 0.5) * 2;

  switch (scenario) {
    case 'ddos_spike':
      if (metricKey === 'http_5xx_rate_pct') {
        return Math.min(28.5, Math.max(12.0, currentValue + (1.2 + Math.random() * 1.5)));
      }
      if (metricKey === 'api_latency_p95_ms') {
        return Math.min(880, Math.max(480, currentValue + (30 + Math.random() * 40)));
      }
      if (metricKey === 'ingest_throughput_rps') {
        return Math.floor(125000 + Math.random() * 20000);
      }
      break;

    case 'db_exhaustion':
      if (metricKey === 'db_connection_pool_pct') {
        return Math.min(99.4, Math.max(82.0, currentValue + (2.5 + Math.random() * 2.0)));
      }
      if (metricKey === 'api_latency_p95_ms') {
        return Math.min(620, Math.max(380, currentValue + (15 + Math.random() * 25)));
      }
      break;

    case 'memory_leak':
      if (metricKey === 'worker_memory_pct') {
        return Math.min(98.2, Math.max(75.0, currentValue + (1.0 + Math.random() * 1.2)));
      }
      break;

    case 'normal':
    default:
      if (metricKey === 'http_5xx_rate_pct') {
        return +(Math.max(0.2, Math.min(2.1, currentValue > 3 ? currentValue * 0.75 : 0.5 + Math.random() * 0.7))).toFixed(2);
      }
      if (metricKey === 'api_latency_p95_ms') {
        return +(Math.max(90, Math.min(220, currentValue > 250 ? currentValue * 0.8 : 120 + noise * 15))).toFixed(1);
      }
      if (metricKey === 'db_connection_pool_pct') {
        return +(Math.max(35, Math.min(58, currentValue > 65 ? currentValue * 0.85 : 45 + noise * 5))).toFixed(1);
      }
      if (metricKey === 'worker_memory_pct') {
        return +(Math.max(55, Math.min(72, currentValue > 75 ? currentValue * 0.9 : 64 + noise * 2))).toFixed(1);
      }
      if (metricKey === 'ingest_throughput_rps') {
        return Math.floor(52000 + Math.random() * 5000);
      }
      break;
  }

  return currentValue + noise;
}

// Generate contextual simulated log
export function generateLogForScenario(scenario: ScenarioType): LogEntry {
  const now = Date.now();
  const id = `log-${Math.random().toString(36).substring(2, 9)}`;
  const traceId = `trc-${Math.random().toString(16).substring(2, 10)}`;

  if (scenario === 'ddos_spike') {
    const isError = Math.random() > 0.35;
    return {
      id,
      timestamp: now,
      level: isError ? 'error' : 'warn',
      service: isError ? 'auth-service' : 'api-gateway',
      message: isError
        ? 'Upstream connection timeout: upstream service returned HTTP 504 Gateway Timeout on /oauth/token'
        : 'Rate limit threshold reached for IP range 185.190.x.x, applying backpressure',
      traceId,
      attributes: {
        http_status: isError ? 504 : 429,
        client_ip: '185.190.142.' + Math.floor(Math.random() * 250),
        duration_ms: isError ? 3001 : 12,
        user_agent: 'curl/7.88.1 (SYN_FLOOD_SUSPECT)',
      },
    };
  }

  if (scenario === 'db_exhaustion') {
    const isError = Math.random() > 0.4;
    return {
      id,
      timestamp: now,
      level: isError ? 'fatal' : 'error',
      service: 'orders-service',
      message: isError
        ? 'FATAL: remaining connection slots are reserved for non-replication superuser connections (error code 53300)'
        : 'HikariCP pool db-aurora-01: connection acquisition timeout after 5000ms. Active: 198/200, Pending: 42',
      traceId,
      attributes: {
        db_pool: 'orders-master',
        wait_time_ms: 5002,
        active_conns: 198,
        query: 'SELECT * FROM orders WHERE customer_id = $1 FOR UPDATE',
      },
    };
  }

  if (scenario === 'memory_leak') {
    return {
      id,
      timestamp: now,
      level: 'warn',
      service: 'inventory-worker',
      message: 'Garbage Collection pause exceeded SLA threshold (STW pause: 420ms). Heap usage at 94.2%',
      traceId,
      attributes: {
        heap_used_mb: 3840,
        heap_max_mb: 4096,
        gc_phase: 'MarkSweepCompact',
        thread_count: 142,
      },
    };
  }

  // Normal logs
  const normalLogs = [
    {
      level: 'info' as const,
      service: 'auth-service',
      message: 'JWT token issued successfully for user_uuid: usr_9921',
      attributes: { tenant_id: 'acme-corp', auth_method: 'oauth2_pkce' },
    },
    {
      level: 'info' as const,
      service: 'api-gateway',
      message: 'Route matched: POST /v1/orders -> orders-service (200 OK in 24ms)',
      attributes: { status: 200, duration_ms: 24 },
    },
    {
      level: 'debug' as const,
      service: 'redis-cache',
      message: 'Cache hit for key: session:token:88319f (TTL: 1820s)',
      attributes: { cache_hit: true, latency_us: 420 },
    },
    {
      level: 'info' as const,
      service: 'inventory-service',
      message: 'Stock reservation committed for SKU-88412 (quantity: 2)',
      attributes: { sku: 'SKU-88412', warehouse: 'eu-west-1' },
    },
  ];

  const pick = normalLogs[Math.floor(Math.random() * normalLogs.length)];
  return {
    id,
    timestamp: now,
    level: pick.level,
    service: pick.service,
    message: pick.message,
    traceId,
    attributes: pick.attributes,
  };
}

// Generate realistic distributed trace
export function generateSampleTrace(scenario: ScenarioType): DistributedTrace {
  const now = Date.now();
  const traceId = `0444cc54-${Math.random().toString(16).substring(2, 10)}`;

  if (scenario === 'ddos_spike' || scenario === 'db_exhaustion') {
    return {
      id: traceId,
      traceId,
      rootService: 'api-gateway',
      name: 'POST /api/v1/checkout/process',
      duration: scenario === 'db_exhaustion' ? 5120 : 3040,
      status: 'error',
      timestamp: now,
      spans: [
        {
          id: 'sp-1',
          name: 'HTTP POST /api/v1/checkout/process',
          service: 'api-gateway',
          startTime: 0,
          duration: scenario === 'db_exhaustion' ? 5120 : 3040,
          status: 'error',
          tags: { 'http.status_code': scenario === 'db_exhaustion' ? '500' : '504', 'client.ip': '185.190.142.9' },
        },
        {
          id: 'sp-2',
          name: 'gRPC Auth.ValidateSession',
          service: 'auth-service',
          startTime: 8,
          duration: 38,
          status: 'ok',
          parentId: 'sp-1',
          tags: { 'user.id': 'usr_3914', 'cache.hit': 'true' },
        },
        {
          id: 'sp-3',
          name: 'HTTP POST /orders/create',
          service: 'orders-service',
          startTime: 48,
          duration: scenario === 'db_exhaustion' ? 5060 : 2980,
          status: 'error',
          parentId: 'sp-1',
          tags: { 'error.type': scenario === 'db_exhaustion' ? 'PoolTimeoutException' : 'UpstreamTimeout' },
        },
        {
          id: 'sp-4',
          name: 'SQL BEGIN TRANSACTION & LOCK',
          service: 'postgres-primary',
          startTime: 70,
          duration: scenario === 'db_exhaustion' ? 5010 : 2890,
          status: 'error',
          parentId: 'sp-3',
          tags: {
            'db.statement': 'SELECT * FROM inventory WHERE sku = $1 FOR UPDATE',
            'error.message': 'connection acquisition timeout after 5000ms',
          },
        },
      ],
    };
  }

  // Normal fast trace
  return {
    id: traceId,
    traceId,
    rootService: 'api-gateway',
    name: 'GET /api/v1/user/profile',
    duration: 48,
    status: 'ok',
    timestamp: now,
    spans: [
      {
        id: 'sp-10',
        name: 'HTTP GET /api/v1/user/profile',
        service: 'api-gateway',
        startTime: 0,
        duration: 48,
        status: 'ok',
        tags: { 'http.status_code': '200', 'http.method': 'GET' },
      },
      {
        id: 'sp-11',
        name: 'VerifyToken (Redis)',
        service: 'auth-service',
        startTime: 4,
        duration: 12,
        status: 'ok',
        parentId: 'sp-10',
        tags: { 'redis.cmd': 'GET session:usr_99', 'cache.hit': 'true' },
      },
      {
        id: 'sp-12',
        name: 'PostgreSQL Read User Details',
        service: 'postgres-primary',
        startTime: 18,
        duration: 26,
        status: 'ok',
        parentId: 'sp-10',
        tags: { 'db.statement': 'SELECT id, name, email, plan FROM users WHERE id = $1' },
      },
    ],
  };
}

// Calculate Gorilla TSDB Compression Simulation
export function calculateGorillaCompression(totalPoints: number) {
  // Raw point: 8 bytes timestamp (int64) + 8 bytes float64 value = 16 bytes
  const rawBytes = totalPoints * 16;
  // Gorilla compression achieves ~1.37 bytes/sample on continuous floats
  // Timestamp delta-of-delta: 1 bit for 0 delta, 9 bits for small delta (~1-2 bits avg)
  // Float64 XOR: ~1.2 bytes avg
  const compressedBytes = Math.round(totalPoints * 1.37);
  const ratio = +(rawBytes / (compressedBytes || 1)).toFixed(2);
  const bytesPerSample = +(compressedBytes / (totalPoints || 1)).toFixed(2);

  return {
    rawBytes,
    compressedBytes,
    ratio,
    bytesPerSample,
  };
}
