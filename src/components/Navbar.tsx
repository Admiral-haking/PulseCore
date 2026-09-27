import React from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  BookOpen,
  CheckCircle2,
  Command,
  Flame,
  Github,
  Globe,
  Radio,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';
import { ScenarioType } from '../types/observability';

interface NavbarProps {
  scenario: ScenarioType;
  onSelectScenario: (s: ScenarioType) => void;
  audioAlerts: boolean;
  onToggleAudio: () => void;
  activeAlertsCount: number;
  onOpenCommandPalette: () => void;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  language: Language;
  onToggleLanguage: () => void;
  onOpenReadmeModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  scenario,
  onSelectScenario,
  audioAlerts,
  onToggleAudio,
  activeAlertsCount,
  onOpenCommandPalette,
  currentTab,
  onSelectTab,
  language,
  onToggleLanguage,
  onOpenReadmeModal,
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090D16]/90 backdrop-blur-md px-4 py-2.5 flex items-center justify-between">
      {/* Brand & Live status */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => onSelectTab('overview')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
            <div className="w-full h-full bg-[#090D16] rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#090D16]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                PulseCore
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
                v2.4 TSDB
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {t.brandSubtitle}
            </p>
          </div>
        </div>

        {/* System Ingestion Live indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>{t.ingest}</span>
          <span className="text-emerald-400 font-bold">52,400 pts/s</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{t.gorilla}</span>
          <span className="text-cyan-400 font-semibold">1.37B/sample</span>
        </div>
      </div>

      {/* Middle: Scenario Simulator Injector */}
      <div className="hidden md:flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
        <span className="text-[11px] font-medium text-slate-400 px-2 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          {t.scenario}
        </span>

        <button
          onClick={() => onSelectScenario('normal')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            scenario === 'normal'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          {t.normal}
        </button>

        <button
          onClick={() => onSelectScenario('ddos_spike')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            scenario === 'ddos_spike'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm glow-rose'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Flame className="w-3 h-3 text-rose-400 animate-bounce" />
          {t.ddos}
        </button>

        <button
          onClick={() => onSelectScenario('db_exhaustion')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            scenario === 'db_exhaustion'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm glow-amber'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          {t.dbExhaustion}
        </button>
      </div>

      {/* Right Tools: Language, Audio chime, GitHub Readme, Quick docs, Command Palette */}
      <div className="flex items-center gap-2">
        {/* Language Switcher Button */}
        <button
          onClick={onToggleLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-xs font-mono text-slate-300 hover:border-indigo-500/50 hover:text-white transition-all"
          title="Switch Language (English / فارسی)"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-bold">{language === 'en' ? 'FA' : 'EN'}</span>
        </button>

        {/* GitHub README Preview & Copy */}
        <button
          onClick={onOpenReadmeModal}
          className="p-2 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:text-white transition-all"
          title="View GitHub README.md"
        >
          <Github className="w-4 h-4" />
        </button>

        {/* Toggle Audio alert */}
        <button
          onClick={onToggleAudio}
          title={audioAlerts ? 'Audio alert active' : 'Audio alert muted'}
          className={`p-2 rounded-lg border transition-all ${
            audioAlerts
              ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300'
              : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          {audioAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Command Palette shortcut */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-all font-mono"
        >
          <Command className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden xl:inline">{t.searchCommands}</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300">
            ⌘K
          </kbd>
        </button>

        {/* Jump to Handbook Blueprint */}
        <button
          onClick={() => onSelectTab('docs')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
            currentTab === 'docs'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
              : 'border-slate-700/80 bg-slate-800/80 text-slate-200 hover:bg-slate-700'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
          <span className="hidden md:inline">{t.architectureHandbook}</span>
          <span className="md:hidden">{t.shortDocs}</span>
        </button>

        {/* Alert Bell */}
        <button
          onClick={() => onSelectTab('alerts')}
          className="relative p-2 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:text-white transition-all"
        >
          <Bell className="w-4 h-4" />
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full border-2 border-[#090D16] animate-pulse">
              {activeAlertsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

