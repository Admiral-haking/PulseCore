import React, { useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  ExternalLink,
  FileText,
  Github,
  X,
} from 'lucide-react';

interface GitHubReadmeModalProps {
  isOpen: boolean;
  onClose: () => void;
  readmeContent: string;
}

export const GitHubReadmeModal: React.FC<GitHubReadmeModalProps> = ({
  isOpen,
  onClose,
  readmeContent,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(readmeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Github className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                GitHub Repository README.md
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready for GitHub
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Complete English presentation with badges, architecture diagrams, Gorilla formulas & API specs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy README.md</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 font-mono text-xs text-slate-300 bg-slate-950/90 leading-relaxed space-y-4 select-text">
          <pre className="whitespace-pre-wrap font-mono text-[11px] text-slate-200">
            {readmeContent}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#0B0F19] flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>File location: /README.md (Open Source Apache 2.0)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
