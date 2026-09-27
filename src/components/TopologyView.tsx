import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Database,
  Globe,
  Radio,
  RefreshCw,
  Server,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ServiceNode } from '../types/observability';

interface TopologyViewProps {
  services: ServiceNode[];
}

export const TopologyView: React.FC<TopologyViewProps> = ({ services }) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const selectedService = services.find((s) => s.id === selectedServiceId);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-bold text-slate-100">
              نقشه وابستگی سرویس‌ها و توپولوژی (Service Dependency Map)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            پایش بلادرنگ گراف فراخوانی مایکروسرویس‌ها، نرخ درخواست در ثانیه (RPS) و تأخیر ارتباطی
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Topology
          </span>
        </div>
      </div>

      {/* Topology Canvas Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Node Graph Area */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0B0F19] border border-slate-800/80 relative min-h-[460px] flex flex-col justify-between">
          <div className="text-xs font-mono text-slate-500 mb-4 flex items-center justify-between">
            <span>لایه‌های زیرساختی (Edge Ingress &gt; Gateway &gt; Services &gt; Storage)</span>
            <span>روی هر گره کلیک کنید</span>
          </div>

          {/* Layer 1: Ingress & Gateway */}
          <div className="flex items-center justify-center gap-6">
            {services
              .filter((s) => s.type === 'ingress' || s.type === 'gateway')
              .map((service) => (
                <div
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col items-center text-center w-48 ${
                    selectedServiceId === service.id
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/20'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-xs text-slate-100">{service.name}</span>
                  <div className="mt-2 text-[11px] font-mono text-slate-400 space-y-0.5">
                    <div>{service.rps.toLocaleString()} RPS</div>
                    <div className="text-cyan-400">{service.latencyMs} ms</div>
                  </div>
                </div>
              ))}
          </div>

          {/* Connection connector graphic line */}
          <div className="flex justify-center my-2">
            <div className="w-0.5 h-6 bg-indigo-500/30" />
          </div>

          {/* Layer 2: Core Microservices */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {services
              .filter((s) => s.type === 'service')
              .map((service) => (
                <div
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col items-center text-center w-44 ${
                    selectedServiceId === service.id
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/20'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2">
                    <Server className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-slate-100">{service.name}</span>
                  <div className="mt-2 text-[11px] font-mono text-slate-400 space-y-0.5">
                    <div>{service.rps.toLocaleString()} RPS</div>
                    <div className="text-cyan-400">{service.latencyMs} ms</div>
                  </div>
                </div>
              ))}
          </div>

          {/* Connection connector graphic line */}
          <div className="flex justify-center my-2">
            <div className="w-0.5 h-6 bg-indigo-500/30" />
          </div>

          {/* Layer 3: Persistence and Caching */}
          <div className="flex items-center justify-center gap-6">
            {services
              .filter((s) => s.type === 'database' || s.type === 'cache')
              .map((service) => (
                <div
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col items-center text-center w-48 ${
                    selectedServiceId === service.id
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/20'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-2">
                    <Database className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-xs text-slate-100">{service.name}</span>
                  <div className="mt-2 text-[11px] font-mono text-slate-400 space-y-0.5">
                    <div>{service.rps.toLocaleString()} RPS</div>
                    <div className="text-emerald-400">{service.latencyMs} ms</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Selected Node Inspector Drawer */}
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800/80 space-y-4">
          <h3 className="text-xs font-mono font-semibold uppercase text-slate-400">
            مشخصات گره انتخاب‌شده (Service Details)
          </h3>

          {selectedService ? (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px]">SERVICE NAME:</span>
                <div className="font-bold text-slate-200 text-sm">{selectedService.name}</div>
                <div className="text-indigo-400 text-[11px]">Type: {selectedService.type}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px]">THROUGHPUT:</span>
                  <div className="font-bold text-slate-200 text-sm">
                    {selectedService.rps.toLocaleString()}
                  </div>
                  <div className="text-slate-400 text-[10px]">req/sec</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px]">AVG LATENCY:</span>
                  <div className="font-bold text-cyan-400 text-sm">
                    {selectedService.latencyMs} ms
                  </div>
                  <div className="text-slate-400 text-[10px]">p95 response</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-slate-500 text-[10px]">DOWNSTREAM DEPENDENCIES:</span>
                {selectedService.dependencies.length > 0 ? (
                  <ul className="space-y-1 text-slate-300">
                    {selectedService.dependencies.map((dep) => (
                      <li key={dep} className="flex items-center gap-1.5 text-[11px]">
                        <ArrowRight className="w-3 h-3 text-indigo-400" />
                        <span>{dep}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-slate-500 text-[11px]">گره پایانی (Leaf Store)</div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 font-sans text-xs">
              روی یکی از گره‌های توپولوژی در نمودار کلیک کنید تا اطلاعات ترافیکی و وابستگی‌ها نمایش داده شود.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
