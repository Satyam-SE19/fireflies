"use client";

import { X, Sparkles, Rocket, Bot, ShieldCheck } from "lucide-react";

interface ComingSoonModalProps {
  isOpen: boolean;
  featureName: string;
  onClose: () => void;
}

export default function ComingSoonModal({
  isOpen,
  featureName,
  onClose
}: ComingSoonModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-[#131b2e] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-600/30">
          <Rocket className="w-7 h-7 text-white animate-bounce" />
        </div>

        <h3 className="text-lg font-bold text-slate-100 mb-1">{featureName}</h3>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fireflies Enterprise Roadmap</span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          The <strong className="text-slate-200">{featureName}</strong> capability is currently configured as a live placeholder preview. Real-time bot joins, calendar automations, and CRM integrations are supported in Fireflies enterprise sync.
        </p>

        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 text-left mb-6 space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Planned Integration Highlights</div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>Auto-joins Zoom, Google Meet & Teams calls</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>SOC2 Type II & GDPR compliant encryption</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition"
        >
          Got It, Back to Workspace
        </button>
      </div>
    </div>
  );
}
