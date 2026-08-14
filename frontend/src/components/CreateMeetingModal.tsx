"use client";

import { useState } from "react";
import { X, Sparkles, Upload, FileText, Calendar, Tag, Users, Check } from "lucide-react";
import { createMeeting, MeetingDetail } from "@/lib/api";

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newMeeting: MeetingDetail) => void;
}

export default function CreateMeetingModal({
  isOpen,
  onClose,
  onSuccess
}: CreateMeetingModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Product Strategy");
  const [participantsText, setParticipantsText] = useState("Alex Rivera, Sarah Connor, John Miller");
  const [rawTranscript, setRawTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"paste" | "upload">("paste");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const participants = participantsText.split(",").map((p) => p.trim()).filter(Boolean);
      const newMeeting = await createMeeting({
        title: title.trim(),
        category,
        participants,
        raw_transcript: rawTranscript.trim() || undefined,
        organizer: "Alex Rivera",
        duration: rawTranscript.length > 0 ? Math.max(900, rawTranscript.length * 3) : 1800
      });
      onSuccess(newMeeting);
      onClose();
    } catch (err) {
      alert("Failed to create meeting. Please verify FastAPI backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawTranscript(content);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#131b2e] border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Add / Upload New Meeting</h3>
              <p className="text-[11px] text-slate-400">Process transcript with Freddie AI summarization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1">
              <label className="text-slate-300 font-medium flex items-center gap-1">
                <span>Meeting Title *</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Sprint Planning & Architecture"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span>Department</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="Product Strategy">Product Strategy</option>
                <option value="Sales & CS">Sales & CS</option>
                <option value="Engineering">Engineering</option>
                <option value="Operations">Operations</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-1">
            <label className="text-slate-300 font-medium flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Participants (comma separated)</span>
            </label>
            <input
              type="text"
              value={participantsText}
              onChange={(e) => setParticipantsText(e.target.value)}
              placeholder="e.g. Alex Rivera, Sarah Connor, John Miller"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Transcript input method tabs */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-semibold text-slate-300">Transcript Data</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTab("paste")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    tab === "paste"
                      ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Paste Text
                </button>
                <button
                  type="button"
                  onClick={() => setTab("upload")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    tab === "upload"
                      ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>

            {tab === "paste" ? (
              <textarea
                rows={6}
                value={rawTranscript}
                onChange={(e) => setRawTranscript(e.target.value)}
                placeholder={`Alex Rivera: Welcome everyone to today's roadmap review.\nSarah Connor: We've reduced AI latency by 40% this sprint.\nJohn Miller: UI designs are ready for handoff.`}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 transition"
              />
            ) : (
              <div className="border-2 border-dashed border-slate-800 rounded-xl p-6 text-center hover:border-indigo-500/50 transition bg-slate-950/50">
                <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <p className="text-slate-300 font-medium mb-1">Select a transcript file (.txt, .vtt, .json)</p>
                <p className="text-slate-500 text-[11px] mb-3">Freddie AI will parse speakers and timestamps automatically</p>
                <input
                  type="file"
                  accept=".txt,.vtt,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="transcript-file-input"
                />
                <label
                  htmlFor="transcript-file-input"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium cursor-pointer transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>Choose File</span>
                </label>
              </div>
            )}
          </div>

          {/* Footer Submit Button */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium flex items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  <span>Processing AI Summary...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Process Meeting & Generate Insights</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
