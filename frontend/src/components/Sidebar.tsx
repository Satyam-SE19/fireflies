"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Video, 
  Sparkles, 
  Mic, 
  CheckSquare, 
  BarChart3, 
  Layers, 
  Settings, 
  Bot, 
  PlusCircle, 
  ChevronDown,
  UserCheck
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  onOpenCreateModal: () => void;
  onOpenComingSoon: (featureName: string) => void;
}

export default function Sidebar({ onOpenCreateModal, onOpenComingSoon }: SidebarProps) {
  const pathname = usePathname();
  const [workspace, setWorkspace] = useState("Acme Product Workspace");

  const navItems = [
    { name: "My Meetings", href: "/", icon: Video },
    { name: "Ask Fred AI", href: "/#ask-fred", icon: Sparkles, badge: "AI Copilot" },
    { name: "Soundbites", href: "/soundbites", icon: Mic },
    { name: "Action Items", href: "/tasks", icon: CheckSquare },
  ];

  const secondaryNavItems = [
    { name: "Meeting Analytics", featureKey: "Analytics & Speaker Metrics", icon: BarChart3 },
    { name: "Apps & Integrations", featureKey: "Zoom & Google Meet Integration", icon: Layers },
    { name: "Auto-Join Bot", featureKey: "Real-time Meeting Bot", icon: Bot },
    { name: "Settings", featureKey: "Workspace & Team Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#090d16] border-r border-slate-800 flex flex-col h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white">Fireflies</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Pro</span>
            </div>
            <span className="text-xs text-slate-400 block -mt-0.5">Meeting Intelligence</span>
          </div>
        </Link>
      </div>

      {/* Workspace Switcher */}
      <div className="px-3 py-3">
        <button 
          onClick={() => onOpenComingSoon("Workspace Switcher & Multi-Tenancy")}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition text-left group"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded bg-indigo-600/30 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/40">
              A
            </div>
            <span className="text-xs font-medium text-slate-200 truncate">{workspace}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition" />
        </button>
      </div>

      {/* Primary Action Button */}
      <div className="px-3 pb-3">
        <button
          onClick={onOpenCreateModal}
          className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 transition active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload / Add Meeting</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-2 py-1">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                isActive
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-2 py-1">
          Tools & Apps
        </div>
        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => onOpenComingSoon(item.featureKey)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{item.name}</span>
              </div>
              <span className="text-[9px] text-slate-500 bg-slate-800/80 px-1 py-0.5 rounded">Soon</span>
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="relative">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
                alt="Alex Rivera"
                className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
            </div>
            <div className="truncate">
              <div className="text-xs font-medium text-slate-200 truncate">Alex Rivera</div>
              <div className="text-[10px] text-slate-400 truncate">alex@acme.com</div>
            </div>
          </div>
          <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}
