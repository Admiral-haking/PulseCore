import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  BarChart3,
  BookOpen,
  CheckCircle,
  Command,
  FileText,
  Flame,
  GitFork,
  Radio,
  Search,
  Send,
  Zap,
} from 'lucide-react';
import { ScenarioType } from '../types/observability';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  onSelectScenario: (s: ScenarioType) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onSelectScenario,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    {
      label: 'داشبورد مرکزی و وضعیت کلی',
      category: 'ناوبری',
      icon: Activity,
      action: () => {
        onSelectTab('overview');
        onClose();
      },
    },
    {
      label: 'کاوشگر متریک‌ها و کوئری PromQL',
      category: 'ناوبری',
      icon: BarChart3,
      action: () => {
        onSelectTab('metrics');
        onClose();
      },
    },
    {
      label: 'مدیریت هشدارها و سوانح فعال',
      category: 'ناوبری',
      icon: AlertOctagon,
      action: () => {
        onSelectTab('alerts');
        onClose();
      },
    },
    {
      label: 'جریان زنده لاگ‌های ساخت‌یافته',
      category: 'ناوبری',
      icon: FileText,
      action: () => {
        onSelectTab('logs');
        onClose();
      },
    },
    {
      label: 'ردگیری توزیع‌شده OTLP Waterfall',
      category: 'ناوبری',
      icon: GitFork,
      action: () => {
        onSelectTab('traces');
        onClose();
      },
    },
    {
      label: 'نقشه توپولوژی مایکروسرویس‌ها',
      category: 'ناوبری',
      icon: Radio,
      action: () => {
        onSelectTab('topology');
        onClose();
      },
    },
    {
      label: 'سند جامع معماری و نقشه راه سیستم',
      category: 'مستندات',
      icon: BookOpen,
      action: () => {
        onSelectTab('docs');
        onClose();
      },
    },
    {
      label: 'تزریق سانحه: حمله DDoS و خطای ۵۰۴',
      category: 'شبیه‌ساز',
      icon: Flame,
      action: () => {
        onSelectScenario('ddos_spike');
        onClose();
      },
    },
    {
      label: 'تزریق سانحه: اشباع کانکشن‌های دیتابیس',
      category: 'شبیه‌ساز',
      icon: Zap,
      action: () => {
        onSelectScenario('db_exhaustion');
        onClose();
      },
    },
    {
      label: 'بازنشانی سیستم به حالت پایدار و سبز',
      category: 'شبیه‌ساز',
      icon: CheckCircle,
      action: () => {
        onSelectScenario('normal');
        onClose();
      },
    },
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-2xl overflow-hidden font-sans">
        <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="دستور یا ماژول مورد نظر خود را تایپ کنید..."
            className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              هیچ دستوری پیدا نشد.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900/80 text-right transition-colors text-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-indigo-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-slate-300 group-hover:text-white">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-500 border border-slate-800/80">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
