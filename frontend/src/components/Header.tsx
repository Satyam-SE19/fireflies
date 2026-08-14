"use client";

import { Search, Bell, Plus, Sparkles, Wifi } from "lucide-react";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCreateModal: () => void;
  onOpenComingSoon: (feature: string) => void;
}

export default function Header({
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  onOpenComingSoon
}: HeaderProps) {
  return (
    <header className="h-16 bg-[#090d16]/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Global Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search meetings, participants, topics, or transcripts..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Backend Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
          <Wifi className="w-3 h-3 animate-pulse" />
          <span>API Connected</span>
        </div>

        {/* Ask Fred Quick Prompt */}
        <a
          href="#ask-fred"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition text-xs font-medium"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Ask Fred AI</span>
        </a>

        {/* Notifications Icon */}
        <button
          onClick={() => onOpenComingSoon("Notification Center")}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-slate-950" />
        </button>

        {/* Add Meeting Primary Button */}
        <button
          onClick={onOpenCreateModal}
          className="py-1.5 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Meeting</span>
        </button>
      </div>
    </header>
  );
}
