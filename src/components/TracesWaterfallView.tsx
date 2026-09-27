import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Code2,
  Database,
  ExternalLink,
  GitFork,
  Layers,
  Search,
  Server,
  Zap,
} from 'lucide-react';
import { DistributedTrace, TraceSpan } from '../types/observability';

interface TracesWaterfallProps {
  traces: DistributedTrace[];
}

export const TracesWaterfallView: React.FC<TracesWaterfallProps> = ({ traces }) => {
  const [selectedTraceId, setSelectedTraceId] = useState<string>(
    traces[0]?.traceId || ''
  );
  const [selectedSpan, setSelectedSpan] = useState<TraceSpan | null>(null);

  const activeTrace = traces.find((t) => t.traceId === selectedTraceId) || traces[0];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <GitFork className="w-5 h-5 text-cyan-400" />
          <h1 className="text-lg font-bold text-slate-100">
            ردگیری توزیع‌شده و آبشار اسپان‌ها (Distributed Tracing & Waterfall)
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          پروتکل OpenTelemetry (OTLP)، اندازه‌گیری تأخیر در سطح میکروثانیه و کشف گلوگاه‌های سیستمی
        </p>
      </div>

      {/* Traces Grid & Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Trace List */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-semibold uppercase text-slate-400 flex items-center justify-between">
            <span>تریس‌های اخیر (Recent Traces)</span>
            <span>تعداد: {traces.length}</span>
          </h3>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {traces.map((trace) => {
              const isSelected = trace.traceId === selectedTraceId;
              const isError = trace.status === 'error';

              return (
                <div
                  key={trace.id}
                  onClick={() => {
                    setSelectedTraceId(trace.traceId);
                    setSelectedSpan(null);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                      : 'bg-[#0B0F19] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 truncate">
                      {trace.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                        isError
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {trace.status}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{trace.rootService}</span>
                    <span className="text-cyan-300 font-bold">{trace.duration} ms</span>
                  </div>

                  <div className="mt-1 text-[10px] text-slate-500 font-mono">
                    ID: {trace.traceId.substring(0, 16)}...
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Waterfall DAG */}
        <div className="lg:col-span-2 space-y-4">
          {activeTrace ? (
            <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800/80 space-y-5">
              {/* Trace Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      TRACE_ID: {activeTrace.traceId}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                        activeTrace.status === 'error'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {activeTrace.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 mt-1">
                    {activeTrace.name}
                  </h3>
                </div>

                <div className="text-right text-xs font-mono text-slate-400">
                  <div>
                    مجموع زمان اجرا:{' '}
                    <strong className="text-cyan-400 font-bold text-sm">
                      {activeTrace.duration} ms
                    </strong>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    تعداد کل اسپان‌ها: {activeTrace.spans.length}
                  </div>
                </div>
              </div>

              {/* Waterfall Timeline Graph */}
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-800/60 pb-1">
                  <span>نام اسپان و سرویس (Span / Service)</span>
                  <span>تایم‌لاین و تأخیر (Duration)</span>
                </div>

                <div className="space-y-2">
                  {activeTrace.spans.map((span) => {
                    const totalDuration = activeTrace.duration || 1;
                    const leftPct = (span.startTime / totalDuration) * 100;
                    const widthPct = Math.max(2, (span.duration / totalDuration) * 100);
                    const isError = span.status === 'error';
                    const isSelected = selectedSpan?.id === span.id;

                    return (
                      <div
                        key={span.id}
                        onClick={() => setSelectedSpan(span)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 border-cyan-500'
                            : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-indigo-400 font-bold text-[11px]">
                              [{span.service}]
                            </span>
                            <span className="text-slate-200 text-xs truncate">
                              {span.name}
                            </span>
                          </div>

                          <span
                            className={`text-[11px] font-bold ${
                              isError ? 'text-rose-400' : 'text-cyan-400'
                            }`}
                          >
                            {span.duration} ms
                          </span>
                        </div>

                        {/* Bar representation */}
                        <div className="relative w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className={`absolute h-full rounded-full transition-all ${
                              isError ? 'bg-rose-500' : 'bg-cyan-500'
                            }`}
                            style={{
                              left: `${leftPct}%`,
                              width: `${widthPct}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Span Metadata Details */}
              {selectedSpan && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-slate-800 pb-1.5">
                    <span>اطلاعات اسپان انتخابی: {selectedSpan.name}</span>
                    <span className="text-cyan-400">{selectedSpan.duration} ms</span>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1">
                    <div>
                      <strong>سرویس:</strong> {selectedSpan.service}
                    </div>
                    <div>
                      <strong>وضعیت:</strong> {selectedSpan.status}
                    </div>
                    <div>
                      <strong>تگ‌ها و خصوصیات OTLP:</strong>
                    </div>
                    <pre className="text-indigo-300 p-2 rounded bg-[#0B0F19] border border-slate-800 overflow-x-auto text-[10px]">
                      {JSON.stringify(selectedSpan.tags, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              هیچ تریسی در حال حاضر انتخاب نشده است.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
