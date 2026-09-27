import React, { useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  FileText,
  Filter,
  Pause,
  Play,
  RotateCcw,
  Search,
  Terminal,
  Trash2,
} from 'lucide-react';
import { LogEntry } from '../types/observability';

interface LogsStreamProps {
  logs: LogEntry[];
  onClearLogs: () => void;
  onSelectTab: (tab: string) => void;
}

export const LogsStreamView: React.FC<LogsStreamProps> = ({
  logs,
  onClearLogs,
  onSelectTab,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterService, setFilterService] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const services = Array.from(new Set(logs.map((l) => l.service)));

  const filteredLogs = logs.filter((log) => {
    if (filterLevel !== 'all' && log.level !== filterLevel) return false;
    if (filterService !== 'all' && log.service !== filterService) return false;
    if (
      searchTerm &&
      !log.message.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !log.service.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !log.traceId?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleCopyLog = (log: LogEntry) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLevelBadgeColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'fatal':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'error':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'warn':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'info':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'debug':
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-bold text-slate-100">
              مدیریت و جریان زنده لاگ‌ها (Live Log Management & Streaming)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            دریافت بلادرنگ لاگ‌های ساخت‌یافته JSON با قابلیت جستجوی متن و همبستگی با Trace ID
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-indigo-600 text-white border-indigo-500'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'ادامه استریم (Resume)' : 'توقف استریم (Pause)'}</span>
          </button>

          <button
            onClick={onClearLogs}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-all"
            title="پاکسازی لاگ‌های جاری"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-2xl bg-[#0B0F19] border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی متن، پیام خطا یا Trace ID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
          />
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1 font-mono text-[11px]">
          {(['all', 'error', 'warn', 'info', 'debug'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-2.5 py-1 rounded-lg uppercase transition-all ${
                filterLevel === lvl
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Service filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[11px]">سرویس:</span>
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
          >
            <option value="all">تمام سرویس‌ها (All)</option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Terminal View Container */}
      <div className="rounded-2xl bg-[#0B0F19] border border-slate-800/80 overflow-hidden font-mono text-xs">
        <div className="p-3 border-b border-slate-800/80 flex items-center justify-between text-slate-400 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-300">
              Live Structured Log Feed ({filteredLogs.length} لاگ دریافتی)
            </span>
          </div>
          <span className="text-[10px] text-slate-500">Auto-tail: On</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-sans">
            هیچ لاگی با فیلترهای انتخابی پیدا نشد.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 max-h-[560px] overflow-y-auto">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const dateStr = new Date(log.timestamp).toLocaleTimeString();

              return (
                <div
                  key={log.id}
                  className="p-2.5 hover:bg-slate-900/50 transition-colors text-slate-300"
                >
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="p-1 text-slate-500 hover:text-slate-300 mt-0.5"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <span className="text-slate-500 text-[11px] select-none">{dateStr}</span>

                    <span
                      className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border select-none ${getLevelBadgeColor(
                        log.level
                      )}`}
                    >
                      {log.level}
                    </span>

                    <span className="text-indigo-400 font-semibold select-none">
                      [{log.service}]
                    </span>

                    <span className="flex-1 break-all text-slate-200">{log.message}</span>

                    {/* Correlation Link to Trace */}
                    {log.traceId && (
                      <button
                        onClick={() => onSelectTab('traces')}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 flex items-center gap-1 select-none flex-shrink-0"
                        title="مشاهده تریس توزیع‌شده"
                      >
                        <span>trace:{log.traceId.substring(0, 8)}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleCopyLog(log)}
                      className="text-slate-500 hover:text-slate-300 p-1 flex-shrink-0"
                      title="کپی JSON"
                    >
                      {copiedId === log.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Expanded JSON details */}
                  {isExpanded && (
                    <div className="mt-2.5 mr-6 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                      <div className="text-slate-400 font-semibold mb-1">
                        ویژگی‌های لاگ ساخت‌یافته (JSON Payload):
                      </div>
                      <pre className="text-cyan-300 overflow-x-auto">
                        {JSON.stringify(log, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
