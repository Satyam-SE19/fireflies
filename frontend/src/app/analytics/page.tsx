"use client";

import { useEffect, useState } from "react";
import { BarChart3, Clock, Users, Sparkles, PieChart, TrendingUp, CheckSquare } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CreateMeetingModal from "@/components/CreateMeetingModal";
import WorkspaceModal from "@/components/WorkspaceModal";
import { fetchAnalytics } from "@/lib/api";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isWsOpen, setIsWsOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("Acme Product Workspace");

  useEffect(() => {
    fetchAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden">
      <Sidebar
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onOpenComingSoon={() => setIsWsOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          searchQuery=""
          onSearchChange={() => {}}
          onOpenCreateModal={() => setIsCreateOpen(true)}
          onOpenComingSoon={() => setIsWsOpen(true)}
        />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full text-xs">
          <div className="bg-gradient-to-r from-slate-900 via-[#131b2e] to-indigo-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <h1 className="text-xl font-bold text-white tracking-tight">Meeting Analytics & Speaker Metrics</h1>
              </div>
              <p className="text-xs text-slate-400">
                Real-time insights across team meetings, speaker talk-time distribution, and key topics.
              </p>
            </div>
          </div>

          {loading || !data ? (
            <div className="h-64 bg-slate-900/60 rounded-2xl border border-slate-800 animate-pulse" />
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-4 shadow-lg space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Meetings</div>
                  <div className="text-2xl font-bold text-white">{data.overview.total_meetings}</div>
                  <div className="text-[10px] text-emerald-400 font-semibold">+15% from last month</div>
                </div>

                <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-4 shadow-lg space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Duration</div>
                  <div className="text-2xl font-bold text-white">{data.overview.total_duration_minutes} mins</div>
                  <div className="text-[10px] text-indigo-400 font-semibold">Across 4 departments</div>
                </div>

                <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-4 shadow-lg space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Action Items Completed</div>
                  <div className="text-2xl font-bold text-white">{data.overview.tasks_completion_rate}%</div>
                  <div className="text-[10px] text-purple-400 font-semibold">High accountability</div>
                </div>

                <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-4 shadow-lg space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Avg Sentiment</div>
                  <div className="text-2xl font-bold text-emerald-400">{data.overview.avg_sentiment}</div>
                  <div className="text-[10px] text-slate-400">Positive collaboration score</div>
                </div>
              </div>

              {/* Speaker Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>Speaker Talk-Time Breakdown</span>
                  </h3>
                  <div className="space-y-3">
                    {data.speaker_distribution.map((spk: any) => (
                      <div key={spk.speaker} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-200">{spk.speaker}</span>
                          <span className="font-mono text-indigo-400 font-semibold">{spk.percentage}% ({spk.seconds}s)</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all"
                            style={{ width: `${spk.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Keywords */}
                <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Top Discussed Topics</span>
                  </h3>
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {data.top_keywords.map((kw: any) => (
                      <div
                        key={kw.word}
                        className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2"
                      >
                        <span className="font-bold text-slate-200">{kw.word}</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                          {kw.count} mentions
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <CreateMeetingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {}}
      />
      <WorkspaceModal
        isOpen={isWsOpen}
        onClose={() => setIsWsOpen(false)}
        onSelectWorkspace={setWorkspaceName}
      />
    </div>
  );
}
