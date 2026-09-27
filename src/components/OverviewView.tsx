import React from 'react';
import {
  Activity,
  AlertOctagon,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Flame,
  HardDrive,
  Layers,
  Radio,
  Server,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';
import {
  AlertInstance,
  MetricSeries,
  ScenarioType,
  SystemEngineStats,
} from '../types/observability';

interface OverviewViewProps {
  metrics: Record<string, MetricSeries>;
  alerts: AlertInstance[];
  engineStats: SystemEngineStats;
  scenario: ScenarioType;
  onSelectScenario: (s: ScenarioType) => void;
  onSelectTab: (tab: string) => void;
  onAcknowledgeAlert: (id: string) => void;
  onResolveAlert: (id: string) => void;
  language: Language;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  metrics,
  alerts,
  engineStats,
  scenario,
  onSelectScenario,
  onSelectTab,
  onAcknowledgeAlert,
  onResolveAlert,
  language,
}) => {
  const t = translations[language];
  const firingAlerts = alerts.filter((a) => a.state === 'Firing');
  const pendingAlerts = alerts.filter((a) => a.state === 'Pending');

  // Helper to render responsive SVG sparkline / line chart
  const renderLineChart = (
    series: MetricSeries,
    height: number = 140,
    accentColor: string = '#6366F1'
  ) => {
    if (!series || series.data.length < 2) return null;
    const values = series.data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values, min + 1);
    const width = 600;
    const padding = 10;

    const points = series.data.map((d, index) => {
      const x = padding + (index / (series.data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((d.value - min) / (max - min)) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const pathData = `M ${points.join(' L ')}`;
    const areaData = `${pathData} L ${width - padding},${height} L ${padding},${height} Z`;

    const currentVal = values[values.length - 1];

    return (
      <div className="relative w-full h-[140px] overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`grad-${series.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1="0"
            y1={height * 0.25}
            x2={width}
            y2={height * 0.25}
            stroke="#1E293B"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1={height * 0.5}
            x2={width}
            y2={height * 0.5}
            stroke="#1E293B"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1={height * 0.75}
            x2={width}
            y2={height * 0.75}
            stroke="#1E293B"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Area fill */}
          <path d={areaData} fill={`url(#grad-${series.id})`} />

          {/* Stroke path */}
          <path
            d={pathData}
            fill="none"
            stroke={accentColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Last point pulsing circle */}
          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].split(',')[0]}
              cy={points[points.length - 1].split(',')[1]}
              r="4.5"
              fill={accentColor}
              className="animate-pulse"
            />
          )}
        </svg>

        <div className="absolute top-2 left-2 flex items-baseline gap-1 text-xs font-mono bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
          <span className="text-slate-400">Current:</span>
          <span className="font-bold text-slate-100">
            {currentVal} {series.unit}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Alert if any critical incident is firing */}
      {firingAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 glow-rose animate-pulse-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5 text-rose-400 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500 text-white font-mono">
                  {t.criticalIncidentTitle}
                </span>
                <span className="font-semibold text-sm">
                  {firingAlerts.length} {t.criticalIncidentMsg}
                </span>
              </div>
              <p className="text-xs text-rose-300/90 mt-1">
                {firingAlerts[0]?.ruleName} (Value:{' '}
                <span className="font-mono font-bold">{firingAlerts[0]?.currentValue}</span> vs Threshold{' '}
                <span className="font-mono font-bold">{firingAlerts[0]?.threshold}</span>)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => onAcknowledgeAlert(firingAlerts[0]?.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow"
            >
              {t.ackBtn}
            </button>
            <button
              onClick={() => onSelectTab('alerts')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-rose-500/40 text-rose-300 hover:bg-rose-500/20 transition-all"
            >
              {t.viewDetails}
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ingestion Throughput */}
        <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>{t.ingestRate}</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {engineStats.ingestRateRps.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">{t.ptsSec}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t.protocolsSupported}</span>
          </div>
        </div>

        {/* Card 2: Active Series & Cardinality */}
        <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>{t.activeSeries}</span>
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {engineStats.activeSeriesCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">series</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-indigo-400 font-medium">
            <Database className="w-3.5 h-3.5" />
            <span>{t.cardinalityGuard}</span>
          </div>
        </div>

        {/* Card 3: Gorilla TSDB Compression */}
        <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>{t.gorillaCompression}</span>
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <HardDrive className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-300">
              {engineStats.compressionRatio}x
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({engineStats.bytesPerSample} B/sample)
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-cyan-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.spaceSavings}</span>
          </div>
        </div>

        {/* Card 4: Query Latency P99 */}
        <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>{t.queryLatency}</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {engineStats.queryLatencyP99Ms}
            </span>
            <span className="text-xs text-slate-400 font-mono">ms</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.sub5msExecution}</span>
          </div>
        </div>
      </div>

      {/* Main Real-time Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: 5xx Error Rate */}
        <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  {t.errorRateTitle}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  rate(http_requests_total&#123;status=~"5.."&#125;[2m])
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Threshold: &gt; 5.0%
            </span>
          </div>
          {renderLineChart(metrics.http_5xx_rate_pct, 140, '#EF4444')}
        </div>

        {/* Chart 2: API Latency P95 */}
        <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  {t.latencyP95Title}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  histogram_quantile(0.95, rate(request_duration_ms[5m]))
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Threshold: &gt; 450 ms
            </span>
          </div>
          {renderLineChart(metrics.api_latency_p95_ms, 140, '#F59E0B')}
        </div>

        {/* Chart 3: Database Connection Pool */}
        <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  {t.dbPoolTitle}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  postgresql_active_connections / max_connections * 100
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              Threshold: &gt; 85%
            </span>
          </div>
          {renderLineChart(metrics.db_connection_pool_pct, 140, '#6366F1')}
        </div>

        {/* Chart 4: Worker Node Memory */}
        <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  {t.workerMemoryTitle}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  node_memory_working_set_bytes / total_bytes * 100
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Threshold: &gt; 90%
            </span>
          </div>
          {renderLineChart(metrics.worker_memory_pct, 140, '#06B6D4')}
        </div>
      </div>

      {/* Gorilla TSDB Deep Dive & Architecture Live Simulation */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/20 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                {t.tsdbEngineTitle}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {t.compressionActive}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {t.tsdbSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectTab('docs')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 self-start md:self-auto"
          >
            {t.viewFormulasInDocs}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px]">{t.rawDataPoints}</span>
            <div className="text-lg font-bold text-slate-200">
              {(engineStats.rawBytes / 1024).toFixed(1)} KB
            </div>
            <p className="text-[10px] text-slate-500 font-sans">
              {t.rawPointsDesc}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-1">
            <span className="text-cyan-400 text-[11px]">{t.gorillaCompressed}</span>
            <div className="text-lg font-bold text-cyan-300">
              {(engineStats.compressedBytes / 1024).toFixed(1)} KB
            </div>
            <p className="text-[10px] text-slate-500 font-sans">
              {t.gorillaDesc}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-1">
            <span className="text-emerald-400 text-[11px]">{t.compressionRatio}</span>
            <div className="text-lg font-bold text-emerald-400">
              {engineStats.compressionRatio}:1 (91.4%)
            </div>
            <p className="text-[10px] text-slate-500 font-sans">
              {t.compressionRatioDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Scenario Injector Playground */}
      <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              {t.chaosSimulatorTitle}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            {t.chaosSimulatorDesc}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => onSelectScenario('ddos_spike')}
            className={`p-3 rounded-xl border text-right transition-all flex items-start gap-3 ${
              scenario === 'ddos_spike'
                ? 'bg-rose-500/15 border-rose-500 text-rose-200 glow-rose'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Flame className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-xs">{t.ddosTitle}</div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans leading-relaxed">
                {t.ddosDesc}
              </p>
            </div>
          </button>

          <button
            onClick={() => onSelectScenario('db_exhaustion')}
            className={`p-3 rounded-xl border text-right transition-all flex items-start gap-3 ${
              scenario === 'db_exhaustion'
                ? 'bg-amber-500/15 border-amber-500 text-amber-200 glow-amber'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Database className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-xs">{t.dbPoolExhaustTitle}</div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans leading-relaxed">
                {t.dbPoolExhaustDesc}
              </p>
            </div>
          </button>

          <button
            onClick={() => onSelectScenario('normal')}
            className={`p-3 rounded-xl border text-right transition-all flex items-start gap-3 ${
              scenario === 'normal'
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-200 glow-emerald'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-xs">{t.stableStateTitle}</div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans leading-relaxed">
                {t.stableStateDesc}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
