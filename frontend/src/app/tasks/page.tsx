"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckSquare, Trash2, ExternalLink, Filter } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CreateMeetingModal from "@/components/CreateMeetingModal";
import ComingSoonModal from "@/components/ComingSoonModal";
import { fetchActionItems, updateActionItem, deleteActionItem, ActionItem } from "@/lib/api";

export default function TasksPage() {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState<string | null>(null);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await fetchActionItems();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleToggle = async (id: number, currentCompleted: boolean) => {
    try {
      const updated = await updateActionItem(id, { completed: !currentCompleted });
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      alert("Failed to update task");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this action item?")) {
      try {
        await deleteActionItem(id);
        setItems((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        alert("Failed to delete task");
      }
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === "pending") return !item.completed;
    if (filter === "completed") return item.completed;
    return true;
  });

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
          <div className="bg-gradient-to-r from-slate-900 via-[#131b2e] to-indigo-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckSquare className="w-5 h-5 text-purple-400" />
                <h1 className="text-xl font-bold text-white tracking-tight">Action Items Manager</h1>
              </div>
              <p className="text-xs text-slate-400">
                Track deliverables, task owners, and due dates extracted by Freddie AI.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {(["all", "pending", "completed"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg capitalize font-medium transition ${
                    filter === f ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
              <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300 mb-1">No Action Items</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No tasks matching the selected filter status.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-[#131b2e] border rounded-xl p-4 transition flex items-center justify-between gap-4 ${
                    item.completed
                      ? "border-slate-800/60 opacity-60"
                      : "border-slate-800 hover:border-indigo-500/40"
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggle(item.id, item.completed)}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer flex-shrink-0"
                    />
                    <span className={`text-xs font-medium ${item.completed ? "line-through text-slate-500" : "text-slate-200"}`}>
                      {item.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[10px] px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20">
                      {item.assignee}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Due: {item.due_date}
                    </span>
                    <Link
                      href={`/meetings/${item.meeting_id}`}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 border border-slate-800 transition"
                      title="Open Meeting"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
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
