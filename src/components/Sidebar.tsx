import React from 'react';
import {
  Activity,
  AlertOctagon,
  BarChart3,
  BookOpen,
  CheckCircle,
  FileText,
  GitFork,
  Radio,
  Send,
  Sliders,
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeAlertsCount: number;
  language: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeAlertsCount,
  language,
}) => {
  const t = translations[language];

  const menuItems = [
    {
      id: 'overview',
      label: t.overview,
      icon: Activity,
      badge: null,
    },
    {
      id: 'metrics',
      label: t.metrics,
      icon: BarChart3,
      badge: 'PromQL',
    },
    {
      id: 'alerts',
      label: t.alerts,
      icon: AlertOctagon,
      badge: activeAlertsCount > 0 ? `${activeAlertsCount} ${language === 'fa' ? 'فعال' : 'active'}` : null,
      badgeColor: activeAlertsCount > 0 ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : undefined,
    },
    {
      id: 'logs',
      label: t.logs,
      icon: FileText,
      badge: 'Loki',
    },
    {
      id: 'traces',
      label: t.traces,
      icon: GitFork,
      badge: 'OTLP',
    },
    {
      id: 'topology',
      label: t.topology,
      icon: Radio,
      badge: 'Live',
    },
    {
      id: 'channels',
      label: t.channels,
      icon: Send,
      badge: 'Slack/Tel',
    },
    {
      id: 'status',
      label: t.status,
      icon: CheckCircle,
      badge: '99.98%',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    },
    {
      id: 'docs',
      label: t.docs,
      icon: BookOpen,
      badge: language === 'fa' ? '۲۷ بخش' : '27 Docs',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r md:border-l md:border-r-0 border-slate-800/80 bg-[#090D16]/60 p-3 hidden md:flex flex-col justify-between select-none">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
          {t.modules}
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/20 to-indigo-500/10 text-white border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                    item.badgeColor ||
                    'bg-slate-800/80 text-slate-400 border-slate-700/80'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer system status summary */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">{t.clusterStatus}</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {t.allHealthy}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>{t.tsdbRam}</span>
          <span className="text-slate-300">418 MB</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>{t.p99Latency}</span>
          <span className="text-indigo-400 font-semibold">3.8 ms</span>
        </div>
      </div>
    </aside>
  );
};

