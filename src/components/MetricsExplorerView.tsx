import React, { useState } from 'react';
import {
  BarChart2,
  Check,
  ChevronDown,
  Clock,
  Code2,
  Copy,
  Cpu,
  Database,
  Filter,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { MetricSeries, SystemEngineStats } from '../types/observability';

interface MetricsExplorerProps {
  metrics: Record<string, MetricSeries>;
  engineStats: SystemEngineStats;
}

export const MetricsExplorerView: React.FC<MetricsExplorerProps> = ({
  metrics,
  engineStats,
}) => {
  const [selectedMetricKey, setSelectedMetricKey] = useState<string>('http_5xx_rate_pct');
  const [queryInput, setQueryInput] = useState<string>(
    'rate(http_requests_total{status=~"5.."}[2m])'
  );
  const [queryMode, setQueryMode] = useState<'range' | 'instant'>('range');
  const [timeRange, setTimeRange] = useState<'5m' | '15m' | '1h' | '6h' | '24h'>('15m');
  const [copiedQuery, setCopiedQuery] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedQuantile, setSelectedQuantile] = useState<'p50' | 'p95' | 'p99'>('p95');

  const presetQueries = [
    {
      label: 'نرخ خطای ۵xx در گیت‌وی',
      promql: 'rate(http_requests_total{status=~"5.."}[2m])',
      key: 'http_5xx_rate_pct',
    },
    {
      label: 'تأخیر P95 درخواست‌ها',
      promql: 'histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))',
      key: 'api_latency_p95_ms',
    },
    {
      label: 'درصد اشباع کانکشن‌های دیتابیس',
      promql: 'postgresql_active_connections / postgresql_max_connections * 100',
      key: 'db_connection_pool_pct',
    },
    {
      label: 'مصرف حافظه ورکرها',
      promql: 'node_memory_working_set_bytes / node_memory_total_bytes * 100',
      key: 'worker_memory_pct',
    },
    {
      label: 'نرخ پردازش اینجست TSDB',
      promql: 'sum(tsdb_ingest_points_per_sec) by (collector)',
      key: 'ingest_throughput_rps',
    },
  ];

  const activeSeries = metrics[selectedMetricKey] || metrics.http_5xx_rate_pct;
  const values = activeSeries?.data.map((d) => d.value) || [];
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 0;
  const avgVal = values.length ? +(values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : 0;
  
  // Sorted for quantile
  const sorted = [...values].sort((a, b) => a - b);
  const p50 = sorted.length ? sorted[Math.floor(sorted.length * 0.5)] : 0;
  const p95 = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] : 0;
  const p99 = sorted.length ? sorted[Math.floor(sorted.length * 0.99)] : 0;

  const handleApplyPreset = (item: (typeof presetQueries)[0]) => {
    setQueryInput(item.promql);
    setSelectedMetricKey(item.key);
    simulateRunQuery();
  };

  const simulateRunQuery = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
    }, 280);
  };

  const handleCopyQuery = () => {
    navigator.clipboard.writeText(queryInput);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  // SVG Chart with crosshair/grid
  const renderVisualExplorerChart = () => {
    if (!activeSeries || activeSeries.data.length < 2) return null;
    const width = 800;
    const height = 260;
    const padX = 40;
    const padY = 25;

    const dataPoints = activeSeries.data;
    const min = Math.min(...values);
    const max = Math.max(...values, min + 1);

    const points = dataPoints.map((d, index) => {
      const x = padX + (index / (dataPoints.length - 1)) * (width - padX * 2);
      const y = height - padY - ((d.value - min) / (max - min)) * (height - padY * 2);
      return { x, y, val: d.value, time: d.timestamp };
    });

    const pathString = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaString = `${pathString} L ${width - padX} ${height - padY} L ${padX} ${height - padY} Z`;

    return (
      <div className="relative w-full h-[280px] bg-slate-950/60 rounded-xl p-2 border border-slate-800/80">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="explorerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={activeSeries.color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={activeSeries.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => {
            const y = padY + ratio * (height - padY * 2);
            const valAtY = (max - ratio * (max - min)).toFixed(1);
            return (
              <g key={i}>
                <line
                  x1={padX}
                  y1={y}
                  x2={width - padX}
                  y2={y}
                  stroke="#1E293B"
                  strokeDasharray="4 4"
                />
                <text
                  x={padX - 8}
                  y={y + 4}
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {valAtY}
                </text>
              </g>
            );
          })}

          {/* Area */}
          <path d={areaString} fill="url(#explorerGrad)" />

          {/* Line */}
          <path
            d={pathString}
            fill="none"
            stroke={activeSeries.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={i === points.length - 1 ? 5 : 2}
              fill={activeSeries.color}
              stroke="#090D16"
              strokeWidth="1.5"
            />
          ))}
        </svg>

        {/* Legend overlay */}
        <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-xs font-mono backdrop-blur flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: activeSeries.color }}
            />
            <span className="font-semibold text-slate-200">{activeSeries.name}</span>
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">
            Last: <strong className="text-indigo-400">{values[values.length - 1]}</strong>{' '}
            {activeSeries.unit}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-bold text-slate-100">
              کاوشگر متریک‌ها و موتور کوئری PromQL (Metrics Explorer & Query Engine)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            اجرای لحظه‌ای کوئری‌های پرومتئوس، تجمیع چندبعدی، و پایش کارکرد دیتابیس سری‌های زمانی
          </p>
        </div>

        {/* Range picker */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          {(['5m', '15m', '1h', '6h', '24h'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                timeRange === r
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* PromQL Query Console Bar */}
      <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">کنسول دستورات PromQL:</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-0.5 font-mono text-[11px]">
              <button
                onClick={() => setQueryMode('range')}
                className={`px-2 py-0.5 rounded ${
                  queryMode === 'range' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                Range Query
              </button>
              <button
                onClick={() => setQueryMode('instant')}
                className={`px-2 py-0.5 rounded ${
                  queryMode === 'instant' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                Instant Query
              </button>
            </div>

            <button
              onClick={handleCopyQuery}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
              title="کپی کردن کوئری"
            >
              {copiedQuery ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-indigo-400 font-mono text-xs select-none">
              &gt;
            </span>
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && simulateRunQuery()}
              placeholder="مثال: rate(http_requests_total[2m])"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2 text-xs font-mono text-indigo-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <button
            onClick={simulateRunQuery}
            disabled={isExecuting}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            {isExecuting ? (
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>اجرا (Run)</span>
          </button>
        </div>

        {/* Preset Queries Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            کوئری‌های پرکاربرد:
          </span>
          {presetQueries.map((preset, i) => (
            <button
              key={i}
              onClick={() => handleApplyPreset(preset)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-900 border border-slate-800 text-slate-300 hover:border-indigo-500/50 hover:text-indigo-300 transition-all"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Chart & Aggregation Stats */}
      <div className="space-y-4">
        {renderVisualExplorerChart()}

        {/* Statistics Bar: Min, Max, Avg, Quantiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 text-xs font-mono space-y-1">
            <span className="text-slate-400 text-[11px]">کمینه (Min):</span>
            <div className="text-base font-bold text-slate-200">
              {minVal} {activeSeries.unit}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 text-xs font-mono space-y-1">
            <span className="text-slate-400 text-[11px]">بیشینه (Max):</span>
            <div className="text-base font-bold text-rose-400">
              {maxVal} {activeSeries.unit}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 text-xs font-mono space-y-1">
            <span className="text-slate-400 text-[11px]">میانگین (Avg):</span>
            <div className="text-base font-bold text-indigo-300">
              {avgVal} {activeSeries.unit}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 text-xs font-mono space-y-1">
            <span className="text-slate-400 text-[11px]">صدک ۵۰ (p50):</span>
            <div className="text-base font-bold text-slate-300">
              {p50} {activeSeries.unit}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0F19] border border-amber-500/30 text-xs font-mono space-y-1">
            <span className="text-amber-400 text-[11px]">صدک ۹۵ (p95):</span>
            <div className="text-base font-bold text-amber-300">
              {p95} {activeSeries.unit}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0F19] border border-rose-500/30 text-xs font-mono space-y-1">
            <span className="text-rose-400 text-[11px]">صدک ۹۹ (p99):</span>
            <div className="text-base font-bold text-rose-300">
              {p99} {activeSeries.unit}
            </div>
          </div>
        </div>
      </div>

      {/* Bit-level Gorilla TSDB Compression Inspector */}
      <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800/80 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-200">
              کالبدشکافی بیتی فشرده‌سازی Gorilla TSDB روی سری فعال
            </h3>
            <p className="text-xs text-slate-400">
              نحوه فشرده‌سازی زمان‌سنج (Delta-of-Delta) و مقادیر ممیز شناور (Float64 XOR) در حافظه
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Timestamp Delta-of-Delta visualization */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>۱. فشرده‌سازی Timestamp (Delta-of-Delta):</span>
              <span className="text-emerald-400 font-bold">۱ بیت (D=0)</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              از آنجایی که بازه ارسال نقاط داده ۵ ثانیه ثابت است، اختلاف دو دلتای متوالی برابر با صفر است:
              <br />
              <code className="text-cyan-300">D = (t[n] - t[n-1]) - (t[n-1] - t[n-2]) = 0</code>
              <br />
              سیستم به جای ۶۴ بیت، فقط یک تک بیت <code className="text-emerald-400">0</code> در جریان بیتی (BitStream) می‌نویسد!
            </p>
          </div>

          {/* Float64 XOR visualization */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>۲. فشرده‌سازی مقادیر (Float64 XOR):</span>
              <span className="text-cyan-400 font-bold">~۹ بیت میانگین</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              عملگر XOR بین مقدار فعلی و قبلی انجام می‌شود. بیت‌های صفر آغازین و پایانی در حافظه حذف شده و فقط بیت‌های متغیر ذخیره می‌شوند.
              <br />
              صرفه‌جویی واقعی حاصل‌شده: <strong className="text-emerald-400">۹۱.۴٪ کاهش حجم</strong> در مقایسه با دیتابیس‌های سنتی.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
