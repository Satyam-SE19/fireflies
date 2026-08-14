"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mic, Trash2, Sparkles, ExternalLink, Play } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CreateMeetingModal from "@/components/CreateMeetingModal";
import ComingSoonModal from "@/components/ComingSoonModal";
import { fetchSoundbites, deleteSoundbite, Soundbite } from "@/lib/api";

export default function SoundbitesPage() {
  const [soundbites, setSoundbites] = useState<Soundbite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState<string | null>(null);

  const loadSoundbites = async () => {
    setLoading(true);
    try {
      const data = await fetchSoundbites();
      setSoundbites(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSoundbites();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Delete this soundbite clip?")) {
      try {
        await deleteSoundbite(id);
        setSoundbites((prev) => prev.filter((s) => s.id !== id));
      } catch (err) {
        alert("Failed to delete soundbite");
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden">
      <Sidebar
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onOpenComingSoon={(feat) => setComingSoonFeature(feat)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          searchQuery=""
          onSearchChange={() => {}}
          onOpenCreateModal={() => setIsCreateOpen(true)}
          onOpenComingSoon={(feat) => setComingSoonFeature(feat)}
        />

        <main className="p-6 space-y-6 max-w-6xl mx-auto w-full">
          <div className="bg-gradient-to-r from-slate-900 via-[#131b2e] to-purple-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Mic className="w-5 h-5 text-indigo-400" />
                <h1 className="text-xl font-bold text-white tracking-tight">Soundbites Library</h1>
              </div>
              <p className="text-xs text-slate-400">
                Key audio highlights clipped across all recorded workspace meetings.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-semibold text-xs border border-purple-500/30">
              {soundbites.length} Saved Clips
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : soundbites.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
              <Mic className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300 mb-1">No Soundbites Clipped Yet</h3>
              <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                Open any meeting transcript and click "Soundbite" on a line to clip key moments!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {soundbites.map((sb) => (
                <div
                  key={sb.id}
                  className="bg-[#131b2e] border border-slate-800 hover:border-indigo-500/40 rounded-xl p-4 transition flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow flex-shrink-0">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-xs text-slate-200 truncate">{sb.title}</h4>
                      <p className="text-xs text-slate-400 italic font-sans mt-0.5 truncate">
                        "{sb.snippet_text}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/meetings/${sb.meeting_id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-400 text-xs font-semibold border border-slate-800 flex items-center gap-1 transition"
                    >
                      <span>Jump to Meeting</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                    <button
                      onClick={() => handleDelete(sb.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <CreateMeetingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {}}
      />

      <ComingSoonModal
        isOpen={!!comingSoonFeature}
        featureName={comingSoonFeature || ""}
        onClose={() => setComingSoonFeature(null)}
      />
    </div>
  );
}
