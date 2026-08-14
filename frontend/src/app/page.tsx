"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Video, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Clock, 
  Users, 
  Sparkles, 
  CheckSquare, 
  Trash2, 
  ExternalLink,
  Smile,
  LayoutGrid,
  List as ListIcon
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CreateMeetingModal from "@/components/CreateMeetingModal";
import ComingSoonModal from "@/components/ComingSoonModal";
import { fetchMeetings, deleteMeeting, MeetingListItem } from "@/lib/api";

export default function MeetingsDashboard() {
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("recency");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState<string | null>(null);

  const categories = ["All", "Product Strategy", "Sales & CS", "Engineering", "Operations"];

  const loadMeetings = async () => {
    setLoading(true);
    try {
      const data = await fetchMeetings({
        q: searchQuery,
        category: categoryFilter,
        sort_by: sortBy
      });
      setMeetings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, [searchQuery, categoryFilter, sortBy]);

  const handleDelete = async (id: number, title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete meeting "${title}"?`)) {
      try {
        await deleteMeeting(id);
        setMeetings((prev) => prev.filter((m) => m.id !== id));
      } catch (err) {
        alert("Failed to delete meeting.");
      }
    }
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    return `${mins} min${mins !== 1 ? 's' : ''}`;
  };

  // KPI Metrics Calculation
  const totalDurationMinutes = Math.round(meetings.reduce((acc, m) => acc + m.duration, 0) / 60);
  const totalTasks = meetings.reduce((acc, m) => acc + m.action_items_count, 0);

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onOpenComingSoon={(feat) => setComingSoonFeature(feat)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          onOpenCreateModal={() => setIsCreateOpen(true)}
          onOpenComingSoon={(feat) => setComingSoonFeature(feat)}
        />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Welcome Banner & KPI Summary */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-[#131b2e] to-indigo-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-white tracking-tight">Meetings Library</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-semibold border border-indigo-500/30">
                  {meetings.length} Recorded
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Browse interactive transcripts, AI summaries, soundbites, and Ask Fred copilot insights.
              </p>
            </div>

            {/* Metrics Chips */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Duration</div>
                  <div className="text-xs font-bold text-slate-200">{totalDurationMinutes} mins</div>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Action Items</div>
                  <div className="text-xs font-bold text-slate-200">{totalTasks} tasks</div>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl flex items-center gap-2.5">
                <Smile className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Avg Sentiment</div>
                  <div className="text-xs font-bold text-emerald-400">89% Positive</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Sorting Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    categoryFilter === cat
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Controls: Sorting & Layout Toggle */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="recency" className="bg-slate-900">Most Recent</option>
                  <option value="duration_desc" className="bg-slate-900">Longest Duration</option>
                  <option value="title" className="bg-slate-900">Title (A-Z)</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded transition ${viewMode === "grid" ? "bg-slate-800 text-indigo-400" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded transition ${viewMode === "list" ? "bg-slate-800 text-indigo-400" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <ListIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Meetings Cards Grid / List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-52 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
              <Video className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300 mb-1">No Meetings Found</h3>
              <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                No meetings matched your search criteria. Try clearing search filters or add a new meeting.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition"
              >
                + Upload New Meeting
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {meetings.map((m) => (
                <Link
                  key={m.id}
                  href={`/meetings/${m.id}`}
                  className="group bg-[#131b2e] hover:bg-[#18233c] border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 shadow-lg transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Subtle Card Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition" />

                  <div>
                    {/* Top Row: Category & Delete */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-semibold">
                        {m.category}
                      </span>
                      <button
                        onClick={(e) => handleDelete(m.id, m.title, e)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition opacity-0 group-hover:opacity-100"
                        title="Delete Meeting"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-sm text-slate-100 group-hover:text-indigo-300 transition line-clamp-2 mb-2 leading-snug">
                      {m.title}
                    </h3>

                    {/* Meta info: Date & Duration */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-4">
                      <span>{m.date}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{formatDuration(m.duration)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {/* Participants Avatar Stack */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                      <div className="flex items-center -space-x-2">
                        {m.participants.slice(0, 3).map((p, idx) => (
                          <img
                            key={idx}
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p}`}
                            alt={p}
                            title={p}
                            className="w-6 h-6 rounded-full bg-slate-800 border-2 border-[#131b2e]"
                          />
                        ))}
                        {m.participants.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-[#131b2e] flex items-center justify-center text-[9px] font-bold text-slate-300">
                            +{m.participants.length - 3}
                          </div>
                        )}
                      </div>

                      {/* Action items badge & Open link */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-medium">
                          {m.action_items_count} Action Items
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {meetings.map((m) => (
                <Link
                  key={m.id}
                  href={`/meetings/${m.id}`}
                  className="group bg-[#131b2e] hover:bg-[#18233c] border border-slate-800 hover:border-indigo-500/40 rounded-xl p-4 transition flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 flex-shrink-0">
                      <Video className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-sm text-slate-100 group-hover:text-indigo-300 truncate">
                        {m.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span>{m.date}</span>
                        <span>•</span>
                        <span>{formatDuration(m.duration)}</span>
                        <span>•</span>
                        <span className="text-indigo-400">{m.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                      {m.action_items_count} Action Items
                    </span>
                    <button
                      onClick={(e) => handleDelete(m.id, m.title, e)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateMeetingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => loadMeetings()}
      />

      <ComingSoonModal
        isOpen={!!comingSoonFeature}
        featureName={comingSoonFeature || ""}
        onClose={() => setComingSoonFeature(null)}
      />
    </div>
  );
}
