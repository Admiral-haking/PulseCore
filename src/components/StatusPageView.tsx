import React from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Globe,
  Radio,
  ShieldCheck,
} from 'lucide-react';

export const StatusPageView: React.FC = () => {
  const components = [
    { name: 'درگاه دریافت تله‌متری (Ingestion API Gateway)', status: 'operational', uptime: '99.99%' },
    { name: 'موتور دیتابیس سری‌های زمانی (PulseCore TSDB Engine)', status: 'operational', uptime: '100.0%' },
    { name: 'موتور کوئری‌های پرومتئوس (PromQL Query Engine)', status: 'operational', uptime: '99.98%' },
    { name: 'موتور ارزیابی هشدارها (Alert Evaluation Engine)', status: 'operational', uptime: '100.0%' },
    { name: 'لایه توزیع اعلان‌ها (Notification Dispatch Network)', status: 'operational', uptime: '99.96%' },
    { name: 'موتور ذخیره لاگ‌ها و تریس‌ها (Logs & OTLP Traces)', status: 'operational', uptime: '99.95%' },
  ];

  // Generate 90 days mock bar heatmap
  const days = Array.from({ length: 90 }, (_, i) => {
    // Inject a couple of minor incidents in past
    if (i === 14) return 'degraded';
    if (i === 42) return 'incident';
    return 'operational';
  });

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          تمام سرویس‌ها در وضعیت پایدار هستند (ALL SYSTEMS OPERATIONAL)
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
          صفحه وضعیت عمومی و پایداری سیستم (PulseCore Status Page)
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          پایش بلادرنگ آپ‌تایم، سلامت سرویس‌ها و گزارش شفاف سوانح عملیاتی در ۹۰ روز گذشته
        </p>
      </div>

      {/* SLA Metric Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0B0F19] border border-slate-800 text-center space-y-2">
        <span className="text-xs font-mono uppercase text-slate-400">میانگین آپ‌تایم در ۹۰ روز گذشته</span>
        <div className="text-4xl font-extrabold font-mono text-emerald-400">
          ۹۹.۹۸٪
        </div>
        <p className="text-xs text-slate-500">
          کمتر از ۱۲ دقیقه توقف برنامه‌ریزی‌شده در کل ۳ ماه گذشته
        </p>
      </div>

      {/* 90-Day Status Bar Heatmap */}
      <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>نمودار پایداری روزانه (۹۰ روز قبل)</span>
          <span className="text-emerald-400 font-semibold">امروز (پایدار)</span>
        </div>

        {/* 90 bars */}
        <div className="flex items-center justify-between gap-[2px] h-9">
          {days.map((status, index) => (
            <div
              key={index}
              title={`روز ${90 - index} قبل: ${status}`}
              className={`flex-1 h-full rounded-[2px] transition-all hover:scale-110 ${
                status === 'operational'
                  ? 'bg-emerald-500/80 hover:bg-emerald-400'
                  : status === 'degraded'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
          <span>۹۰ روز پیش</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> پایدار
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> کاهش سرعت
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> سانحه
            </span>
          </div>
          <span>امروز</span>
        </div>
      </div>

      {/* System Components List */}
      <div className="rounded-2xl bg-[#0B0F19] border border-slate-800 overflow-hidden divide-y divide-slate-800">
        <div className="p-4 bg-slate-950/60 text-xs font-mono text-slate-400 font-semibold">
          وضعیت تفکیکی اجزای زیرساخت
        </div>

        {components.map((comp, idx) => (
          <div
            key={idx}
            className="p-4 flex items-center justify-between text-xs transition-colors hover:bg-slate-900/40"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="font-semibold text-slate-200">{comp.name}</span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-slate-400">Uptime: {comp.uptime}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                OPERATIONAL
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Incident Post-Mortem */}
      <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-200">
            گزارش سانحه اخیر و رفع نقص (Post-Mortem History)
          </h3>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
            <span className="font-bold text-slate-300">
              افزایش تأخیر کوئری‌های پیچیده در کلاستر ثانویه
            </span>
            <span>۱۴ روز پیش (مدت رفع: ۸ دقیقه)</span>
          </div>
          <p className="text-slate-400 font-sans leading-relaxed text-[11px]">
            <strong>شرح رخداد:</strong> به دلیل بروز یک کوئری سنگین با کاردینالیتی بالا روی بافر ذخیره‌سازی، تأخیر P99 کوئری‌ها موقتاً به ۳۸۰ میلی‌ثانیه افزایش یافت. با فعال‌سازی خودکار مکانیزم Circuit Breaker و کش LRU، شرایط فوراً به وضعیت پایدار بازگشت.
          </p>
        </div>
      </div>
    </div>
  );
};
