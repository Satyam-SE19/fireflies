"use client";

import { useEffect, useState } from "react";
import { X, Check, Plus, Building } from "lucide-react";
import { fetchWorkspaces, createWorkspace, activateWorkspace } from "@/lib/api";

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkspace: (name: string) => void;
}

export default function WorkspaceModal({ isOpen, onClose, onSelectWorkspace }: WorkspaceModalProps) {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [newWsName, setNewWsName] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchWorkspaces().then(setWorkspaces).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = async (id: number, name: string) => {
    await activateWorkspace(id);
    onSelectWorkspace(name);
    onClose();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    const created = await createWorkspace(newWsName.trim());
    setWorkspaces((prev) => [...prev, created]);
    setNewWsName("");
    handleSelect(created.id, created.name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-[#131b2e] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-100">Switch Workspace</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              onClick={() => handleSelect(ws.id, ws.name)}
              className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                ws.active
                  ? "bg-indigo-600/20 border-indigo-500/40 text-white"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="font-bold text-xs">{ws.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{ws.members_count} members • {ws.plan}</div>
              </div>
              {ws.active && <Check className="w-4 h-4 text-indigo-400" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleCreate} className="flex gap-2 pt-2 border-t border-slate-800">
          <input
            type="text"
            required
            value={newWsName}
            onChange={(e) => setNewWsName(e.target.value)}
            placeholder="New workspace name..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>
        </form>
      </div>
    </div>
  );
}
