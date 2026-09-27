import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle,
  Clock,
  Code2,
  ExternalLink,
  Flame,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  VolumeX,
} from 'lucide-react';
import { AlertInstance, AlertRule, AlertState } from '../types/observability';

interface AlertsManagerProps {
  alerts: AlertInstance[];
  rules: AlertRule[];
  onAcknowledgeAlert: (id: string) => void;
  onResolveAlert: (id: string) => void;
  onSilenceAlert: (id: string, minutes: number) => void;
  onToggleRule: (ruleId: string) => void;
  onAddRule: (rule: AlertRule) => void;
}

export const AlertsManagerView: React.FC<AlertsManagerProps> = ({
  alerts,
  rules,
  onAcknowledgeAlert,
  onResolveAlert,
  onSilenceAlert,
  onToggleRule,
  onAddRule,
}) => {
  const [activeTab, setActiveTab] = useState<'incidents' | 'rules' | 'statemachine'>('incidents');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New rule form state
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleExpr, setNewRuleExpr] = useState('');
  const [newRuleThreshold, setNewRuleThreshold] = useState<number>(10);
  const [newRuleDuration, setNewRuleDuration] = useState('2m');
  const [newRuleSeverity, setNewRuleSeverity] = useState<'critical' | 'warning' | 'info'>('warning');

  // Count states
  const okCount = rules.length - alerts.filter((a) => a.state === 'Firing' || a.state === 'Pending').length;
  const pendingCount = alerts.filter((a) => a.state === 'Pending').length;
  const firingCount = alerts.filter((a) => a.state === 'Firing').length;
  const resolvedCount = alerts.filter((a) => a.state === 'Resolved').length;

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName || !newRuleExpr) return;

    const newRule: AlertRule = {
      id: `rule-${Date.now()}`,
      name: newRuleName,
      expr: newRuleExpr,
      duration: newRuleDuration,
      severity: newRuleSeverity,
      threshold: Number(newRuleThreshold),
      comparison: '>',
      metricName: 'custom_metric',
      description: 'قانون تعریف شده توسط کاربر',
      enabled: true,
    };

    onAddRule(newRule);
    setIsAddModalOpen(false);
    setNewRuleName('');
    setNewRuleExpr('');
  };

  const filteredAlerts = alerts.filter((a) =>
    a.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h1 className="text-lg font-bold text-slate-100">
              مدیریت هشدارها و ماشین وضعیت سوانح (Alert Engine & State Machine)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ارزیابی پیوسته قوانین، ماشین وضعیت ۴ مرحله‌ای، و پیشگیری از خستگی ناشی از هشدار
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'incidents'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            سوانح فعال ({firingCount + pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('statemachine')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'statemachine'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ماشین وضعیت (State Machine)
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'rules'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            قوانین هشدار ({rules.length})
          </button>
        </div>
      </div>

      {/* State Machine Visualizer (Always shown or featured) */}
      <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            وضعیت بلادرنگ ماشین ارزیابی (Real-Time State Machine Flow)
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Evaluation Interval: 10s</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Node 1: OK */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                وضعیت نرمال (OK)
              </span>
              <span className="text-lg font-bold font-mono text-emerald-300">
                {Math.max(0, okCount)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-sans">
              پارامترها و متریک‌ها در محدوده مجاز تعریف‌شده قرار دارند.
            </p>
            <div className="mt-2 text-[10px] text-emerald-500/80 font-mono flex items-center gap-1">
              <span>Threshold not breached</span>
            </div>
          </div>

          {/* Node 2: Pending */}
          <div
            className={`p-4 rounded-xl bg-slate-950/80 border transition-all ${
              pendingCount > 0
                ? 'border-amber-500 glow-amber'
                : 'border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 animate-spin text-amber-400" />
                در انتظار (Pending)
              </span>
              <span className="text-lg font-bold font-mono text-amber-300">
                {pendingCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-sans">
              آستانه نقض شده است؛ سیستم در حال بررسی تداوم خطا به مدت <code className="text-amber-300">for: 2m</code> است.
            </p>
            <div className="mt-2 text-[10px] text-amber-400 font-mono">
              جلوگیری از نویز لحظه‌ای (Anti-Flapping)
            </div>
          </div>

          {/* Node 3: Firing */}
          <div
            className={`p-4 rounded-xl bg-slate-950/80 border transition-all ${
              firingCount > 0
                ? 'border-rose-500 glow-rose animate-pulse-subtle'
                : 'border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 animate-bounce text-rose-400" />
                شلیک‌شده (Firing)
              </span>
              <span className="text-lg font-bold font-mono text-rose-300">
                {firingCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-sans">
              مدت زمان پایداری خطا پر شد؛ اعلان به اسلک، تلگرام و PagerDuty ارسال گردید.
            </p>
            <div className="mt-2 text-[10px] text-rose-400 font-mono">
              Dispatching Notifications
            </div>
          </div>

          {/* Node 4: Resolved */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                برطرف‌شده (Resolved)
              </span>
              <span className="text-lg font-bold font-mono text-indigo-300">
                {resolvedCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-sans">
              مقادیر مجدداً به زیر آستانه برگشت؛ اعلان رفع نقص به تیم فنی ارسال شد.
            </p>
            <div className="mt-2 text-[10px] text-indigo-400 font-mono">
              Auto-Recovery Verified
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو در سوانح و سرویس‌ها..."
                className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Incidents List */}
          <div className="rounded-2xl bg-[#0B0F19] border border-slate-800/80 overflow-hidden">
            <div className="p-3 border-b border-slate-800/80 text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>لیست هشدارهای فعال و لاگ سوانح</span>
              <span>تعداد کل: {filteredAlerts.length}</span>
            </div>

            {filteredAlerts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-sm font-semibold text-slate-200">
                  هیچ سانحه فعالی وجود ندارد!
                </div>
                <p className="text-xs text-slate-500">
                  تمام متریک‌ها در شرایط ایمن هستند و سیستم در وضعیت پایدار قرار دارد.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase tracking-wider ${
                            alert.severity === 'critical'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {alert.severity}
                        </span>

                        <span
                          className={`text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full ${
                            alert.state === 'Firing'
                              ? 'bg-rose-500 text-white'
                              : alert.state === 'Pending'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-indigo-500/20 text-indigo-300'
                          }`}
                        >
                          State: {alert.state}
                        </span>

                        <span className="text-xs font-semibold text-slate-200">
                          {alert.ruleName}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                        <span>
                          مقدار جاری:{' '}
                          <strong className="text-rose-400 font-bold">
                            {alert.currentValue}
                          </strong>
                        </span>
                        <span>|</span>
                        <span>آستانه: &gt; {alert.threshold}</span>
                        <span>|</span>
                        <span>سرویس: {alert.service}</span>
                      </div>

                      <p className="text-xs text-slate-400 font-sans">{alert.details}</p>

                      {alert.acknowledgedBy && (
                        <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          تایید شده توسط {alert.acknowledgedBy} ({alert.notes})
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {alert.state !== 'Resolved' && (
                        <>
                          <button
                            onClick={() => onAcknowledgeAlert(alert.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700"
                          >
                            تایید (Ack)
                          </button>
                          <button
                            onClick={() => onSilenceAlert(alert.id, 30)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700 flex items-center gap-1"
                          >
                            <VolumeX className="w-3 h-3" />
                            سکوت ۳۰m
                          </button>
                          <button
                            onClick={() => onResolveAlert(alert.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600/80 hover:bg-emerald-600 text-white transition-all shadow"
                          >
                            رفع سانحه
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Alert Rules */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">
              قوانین ارزیابی هشدارها (Defined Alert Rules)
            </h3>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              تعریف قانون جدید
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800/80 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        rule.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {rule.severity}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-200 mt-1.5">
                      {rule.name}
                    </h4>
                  </div>

                  <button
                    onClick={() => onToggleRule(rule.id)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-all ${
                      rule.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {rule.enabled ? 'ACTIVE' : 'MUTED'}
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-indigo-300 overflow-x-auto">
                  <code>{rule.expr}</code>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>مدت ارزیابی (for): {rule.duration}</span>
                  <span>آستانه: {rule.comparison} {rule.threshold}</span>
                </div>

                {rule.runbookUrl && (
                  <a
                    href={rule.runbookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono pt-1"
                  >
                    <span>Runbook مستندات رفع سانحه</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: State Machine Details */}
      {activeTab === 'statemachine' && (
        <div className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100">
              منطق فنی و ساختار ماشین وضعیت (Alert State Machine Specification)
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 space-y-2 border border-slate-800 leading-relaxed">
            <div className="text-indigo-400 font-bold">// Alert Evaluation State Machine Loop (10-second ticks)</div>
            <div>
              1. <strong>OK</strong>: Query Evaluator checks metric against threshold. If breached, move to <strong>Pending</strong> and record <code>pendingSince = now()</code>.
            </div>
            <div>
              2. <strong>Pending</strong>: Condition is monitored every cycle. If continuous breach persists for <code>&gt; rule.duration (e.g. 2m)</code>, transition to <strong>Firing</strong>.
            </div>
            <div>
              3. <strong>Firing</strong>: Alert notification payload dispatched to registered channels with deduplication hash: <code>hash(rule_id + labels)</code>.
            </div>
            <div>
              4. <strong>Resolved</strong>: Once the metric returns within normal bounds, auto-dispatch resolved notification and reset state back to <strong>OK</strong>.
            </div>
          </div>
        </div>
      )}

      {/* New Rule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0B0F19] border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100">
                ایجاد قانون هشدار جدید (New Alert Rule DSL)
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">عنوان قانون:</label>
                <input
                  type="text"
                  required
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  placeholder="مثال: نرخ خطای بالای ۵xx در پرداخت"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">فرمول PromQL:</label>
                <input
                  type="text"
                  required
                  value={newRuleExpr}
                  onChange={(e) => setNewRuleExpr(e.target.value)}
                  placeholder="مثال: rate(http_requests_total{status='500'}[2m]) > 10"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">مقدار آستانه:</label>
                  <input
                    type="number"
                    value={newRuleThreshold}
                    onChange={(e) => setNewRuleThreshold(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">مدت زمان (for):</label>
                  <input
                    type="text"
                    value={newRuleDuration}
                    onChange={(e) => setNewRuleDuration(e.target.value)}
                    placeholder="2m"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">سطح اهمیت:</label>
                  <select
                    value={newRuleSeverity}
                    onChange={(e: any) => setNewRuleSeverity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  ذخیره قانون
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
