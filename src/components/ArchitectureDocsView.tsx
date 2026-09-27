import React, { useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  Layers,
  Palette,
  Search,
  Server,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ARCHITECTURE_SECTIONS, DocSection } from '../data/architectureDocs';

export const ArchitectureDocsView: React.FC = () => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    ARCHITECTURE_SECTIONS[0].id
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<string | null>(null);

  const filteredSections = ARCHITECTURE_SECTIONS.filter((sec) => {
    if (selectedCategory !== 'all' && sec.category !== selectedCategory) return false;
    if (
      searchQuery &&
      !sec.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !sec.contentFa.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !sec.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const activeSection =
    ARCHITECTURE_SECTIONS.find((s) => s.id === selectedSectionId) ||
    ARCHITECTURE_SECTIONS[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIndex(id);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-bold text-slate-100">
              سند جامع معماری، طراحی مهندسی و نقشه راه سیستم (PulseCore Architecture Blueprint)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            طراحی جامع و دقیق ۲۷ بخش سیستم مانیتورینگ و هشدار به همراه کالبدشکافی TSDB، دیاگرام‌های متنی و هویت بصری
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            مستند کامل فارسی + استانداردهای جهانی
          </span>
        </div>
      </div>

      {/* Main Documentation 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در فصول معماری..."
              className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-1 text-[10px] font-mono">
            {[
              { id: 'all', label: 'همه' },
              { id: 'core', label: 'هسته' },
              { id: 'backend', label: 'بک‌اند' },
              { id: 'tsdb', label: 'دیتابیس TSDB' },
              { id: 'design', label: 'هویت بصری' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-0.5 rounded-lg border transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Table of contents list */}
          <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredSections.map((sec) => {
              const isSelected = sec.id === activeSection.id;

              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSectionId(sec.id)}
                  className={`w-full text-right p-2.5 rounded-xl border text-xs font-medium transition-all flex items-start gap-2 ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/80 text-white shadow-sm shadow-indigo-500/10'
                      : 'bg-[#0B0F19] border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="font-mono text-[11px] text-indigo-400 flex-shrink-0 mt-0.5">
                    #{sec.number}
                  </span>
                  <span className="truncate">{sec.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Viewer */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800/80 space-y-6">
            {/* Active section title banner */}
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  بخش {activeSection.number}
                </span>
                <span className="text-xs font-mono text-slate-500 uppercase">
                  دسته: {activeSection.category}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-100">
                {activeSection.title}
              </h2>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {activeSection.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Rendered content */}
            <div className="text-xs sm:text-sm leading-relaxed text-slate-300 font-sans space-y-4">
              <div
                className="whitespace-pre-wrap font-sans space-y-3"
                style={{ direction: 'rtl' }}
              >
                {activeSection.contentFa}
              </div>
            </div>

            {/* Quick Copy Section Action */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => handleCopy(activeSection.contentFa, activeSection.id)}
                className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-mono transition-all"
              >
                {copiedCodeIndex === activeSection.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>متن این بخش کپی شد</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی محتوای این بخش</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
