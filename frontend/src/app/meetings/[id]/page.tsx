"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Sparkles, 
  Search, 
  Filter, 
  Clock, 
  Users, 
  CheckSquare, 
  Mic, 
  FileText, 
  Copy, 
  Check, 
  Trash2, 
  Plus, 
  ChevronUp, 
  ChevronDown,
  MessageSquare,
  Bookmark,
  Share2
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AudioPlayer from "@/components/AudioPlayer";
import AskFredDrawer from "@/components/AskFredDrawer";
import CreateMeetingModal from "@/components/CreateMeetingModal";
import ComingSoonModal from "@/components/ComingSoonModal";
import { 
  fetchMeetingDetail, 
  deleteMeeting, 
  updateActionItem, 
  createActionItem, 
  createSoundbite, 
  deleteSoundbite, 
  MeetingDetail, 
  Utterance 
} from "@/lib/api";

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = parseInt(params.id as string, 10);

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Audio player & transcript bi-directional sync state
  const [currentTime, setCurrentTime] = useState(0);

  // Active tab state
  const [activeTab, setActiveTab] = useState<"transcript" | "summary" | "tasks" | "soundbites">("transcript");

  // Transcript search & filters state
  const [transcriptSearch, setTranscriptSearch] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState("All");
  const [smartFilter, setSmartFilter] = useState("All");
  const [matchingUtteranceIds, setMatchingUtteranceIds] = useState<number[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // New action item form state
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");

  // Toast / Copy notification state
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState<string | null>(null);

  // Refs for auto-scroll sync
  const utteranceRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await fetchMeetingDetail(meetingId);
      setMeeting(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (meetingId) loadDetail();
  }, [meetingId]);

  // Handle in-transcript search matches
  useEffect(() => {
    if (!meeting || !transcriptSearch.trim()) {
      setMatchingUtteranceIds([]);
      setCurrentMatchIndex(0);
      return;
    }

    const q = transcriptSearch.toLowerCase();
    const matches = meeting.utterances
      .filter((u) => u.text.toLowerCase().includes(q) || u.speaker_name.toLowerCase().includes(q))
      .map((u) => u.id);

    setMatchingUtteranceIds(matches);
    setCurrentMatchIndex(0);
    if (matches.length > 0) {
      scrollToUtterance(matches[0]);
    }
  }, [transcriptSearch, meeting]);

  const scrollToUtterance = (id: number) => {
    const el = utteranceRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const nextSearchMatch = () => {
    if (matchingUtteranceIds.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % matchingUtteranceIds.length;
    setCurrentMatchIndex(nextIdx);
    scrollToUtterance(matchingUtteranceIds[nextIdx]);
  };

  const prevSearchMatch = () => {
    if (matchingUtteranceIds.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + matchingUtteranceIds.length) % matchingUtteranceIds.length;
    setCurrentMatchIndex(prevIdx);
    scrollToUtterance(matchingUtteranceIds[prevIdx]);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handleActionToggle = async (itemId: number, currentCompleted: boolean) => {
    try {
      const updated = await updateActionItem(itemId, { completed: !currentCompleted });
      setMeeting((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          action_items: prev.action_items.map((item) => (item.id === itemId ? updated : item)),
        };
      });
      showToast(updated.completed ? "Action item marked complete" : "Action item reopened");
    } catch (err) {
      alert("Failed to update action item");
    }
  };

  const handleAddActionItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    try {
      const created = await createActionItem({
        meeting_id: meetingId,
        text: newTaskText.trim(),
        assignee: newTaskAssignee.trim() || meeting?.participants[0] || "Unassigned",
        due_date: "Next Week",
      });
      setMeeting((prev) => (prev ? { ...prev, action_items: [created, ...prev.action_items] } : prev));
      setNewTaskText("");
      setNewTaskAssignee("");
      showToast("Action item added!");
    } catch (err) {
      alert("Failed to add action item");
    }
  };

  const handleCreateSoundbite = async (u: Utterance) => {
    try {
      const created = await createSoundbite({
        meeting_id: meetingId,
        title: `Clip: ${u.speaker_name} (${formatTime(u.start_time)})`,
        speaker_name: u.speaker_name,
        start_time: u.start_time,
        end_time: u.end_time,
        snippet_text: u.text,
      });
      setMeeting((prev) => (prev ? { ...prev, soundbites: [created, ...prev.soundbites] } : prev));
      showToast("Soundbite clipped & saved!");
    } catch (err) {
      alert("Failed to create soundbite");
    }
  };

  const handleDeleteMeeting = async () => {
    if (confirm(`Delete meeting "${meeting?.title}"?`)) {
      try {
        await deleteMeeting(meetingId);
        router.push("/");
      } catch (err) {
        alert("Failed to delete meeting.");
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#0b0f19] items-center justify-center text-slate-400 gap-2">
        <Sparkles className="w-5 h-5 animate-spin text-indigo-500" />
        <span className="text-xs font-medium">Loading Fireflies meeting workspace...</span>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex h-screen bg-[#0b0f19] items-center justify-center flex-col text-slate-300">
        <h2 className="text-lg font-bold mb-2">Meeting Not Found</h2>
        <Link href="/" className="text-xs text-indigo-400 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Filter utterances
  const filteredUtterances = meeting.utterances.filter((u) => {
    if (selectedSpeaker !== "All" && u.speaker_name !== selectedSpeaker) return false;
    if (smartFilter === "Questions" && u.category !== "question") return false;
    if (smartFilter === "Action Items" && u.category !== "action_item") return false;
    if (smartFilter === "Metrics" && u.category !== "metric") return false;
    return true;
  });

  const speakersList = ["All", ...Array.from(new Set(meeting.utterances.map((u) => u.speaker_name)))];

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onOpenComingSoon={(feat) => setComingSoonFeature(feat)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          searchQuery=""
          onSearchChange={() => {}}
          onOpenCreateModal={() => setIsCreateOpen(true)}
          onOpenComingSoon={(feat) => setComingSoonFeature(feat)}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Main Meeting Workspace Panel */}
          <div className="flex-1 flex flex-col min-w-0 p-5 space-y-4 overflow-y-auto">
            {/* Top Navigation & Actions Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {meeting.title}
                    </h1>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-semibold">
                      {meeting.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span>{meeting.date}</span>
                    <span>•</span>
                    <span>Organizer: {meeting.organizer}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => showToast("Shareable transcript URL copied to clipboard!")}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
                <button
                  onClick={handleDeleteMeeting}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition"
                  title="Delete Meeting"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Audio Player Container */}
            <AudioPlayer
              mediaUrl={meeting.media_url}
              duration={meeting.duration}
              currentTime={currentTime}
              onSeek={handleSeek}
              onTimeUpdate={(t) => setCurrentTime(t)}
            />

            {/* View Tabs Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("transcript")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                    activeTab === "transcript"
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Transcript</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono">
                    {meeting.utterances.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("summary")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                    activeTab === "summary"
                      ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>AI Summary</span>
                </button>

                <button
                  onClick={() => setActiveTab("tasks")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                    activeTab === "tasks"
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Action Items</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                    {meeting.action_items.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("soundbites")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                    activeTab === "soundbites"
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>Soundbites</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono">
                    {meeting.soundbites.length}
                  </span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: TRANSCRIPT */}
            {activeTab === "transcript" && (
              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                {/* Search & Filter Controls Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
                  {/* Search inside transcript */}
                  <div className="flex items-center gap-2 w-full sm:w-80 relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
                    <input
                      type="text"
                      value={transcriptSearch}
                      onChange={(e) => setTranscriptSearch(e.target.value)}
                      placeholder="Search within transcript..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-16 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    {matchingUtteranceIds.length > 0 && (
                      <div className="absolute right-2 flex items-center gap-1 text-[10px] text-slate-400">
                        <span>{currentMatchIndex + 1}/{matchingUtteranceIds.length}</span>
                        <button onClick={prevSearchMatch} className="hover:text-white p-0.5">
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button onClick={nextSearchMatch} className="hover:text-white p-0.5">
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Speaker Filter */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-400">Speaker:</span>
                      <select
                        value={selectedSpeaker}
                        onChange={(e) => setSelectedSpeaker(e.target.value)}
                        className="bg-transparent text-slate-200 font-medium cursor-pointer focus:outline-none"
                      >
                        {speakersList.map((spk) => (
                          <option key={spk} value={spk} className="bg-slate-900">
                            {spk}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Smart Topic Filter Pills */}
                    <div className="flex items-center gap-1 overflow-x-auto">
                      {["All", "Questions", "Action Items", "Metrics"].map((f) => (
                        <button
                          key={f}
                          onClick={() => setSmartFilter(f)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                            smartFilter === f
                              ? "bg-purple-600 text-white"
                              : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Utterances List */}
                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  {filteredUtterances.map((u) => {
                    const isActive = currentTime >= u.start_time && currentTime <= u.end_time;
                    const isSearchMatch = matchingUtteranceIds.includes(u.id);

                    return (
                      <div
                        key={u.id}
                        ref={(el) => { utteranceRefs.current[u.id] = el; }}
                        onClick={() => handleSeek(u.start_time)}
                        className={`group p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/40"
                            : isSearchMatch
                            ? "bg-purple-950/30 border-purple-500/50"
                            : "bg-[#131b2e] border-slate-800/90 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={u.speaker_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.speaker_name}`}
                              alt={u.speaker_name}
                              className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700"
                            />
                            <span className="font-bold text-xs text-slate-200 group-hover:text-indigo-300 transition">
                              {u.speaker_name}
                            </span>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-indigo-400 border border-slate-800">
                              {formatTime(u.start_time)}
                            </span>
                            {u.category && u.category !== "general" && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {u.category}
                              </span>
                            )}
                          </div>

                          {/* Quick Actions on line: Clip Soundbite & Copy Text */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateSoundbite(u);
                              }}
                              className="px-2 py-1 rounded bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white text-[10px] font-medium flex items-center gap-1 border border-slate-800 transition"
                              title="Clip Soundbite"
                            >
                              <Mic className="w-3 h-3" />
                              <span>Soundbite</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(`[${formatTime(u.start_time)}] ${u.speaker_name}: ${u.text}`);
                                setCopiedId(u.id);
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
                              title="Copy text line"
                            >
                              {copiedId === u.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-sans pl-8">
                          {u.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: AI SUMMARY & NOTES */}
            {activeTab === "summary" && (
              <div className="space-y-5 overflow-y-auto flex-1 pr-1 text-xs">
                {/* Executive Overview */}
                <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <h3 className="font-bold text-sm text-slate-100">Executive Summary</h3>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      High Confidence
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {meeting.ai_summary?.overview || "No AI summary compiled yet."}
                  </p>
                </div>

                {/* Key Takeaways */}
                <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <span>Key Takeaways</span>
                  </h3>
                  <div className="space-y-2">
                    {meeting.ai_summary?.key_takeaways?.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agenda Outline & Chapters */}
                <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
                  <h3 className="font-bold text-sm text-slate-100">Chapter Outline & Timestamps</h3>
                  <div className="space-y-2">
                    {meeting.topic_chapters.map((chap) => (
                      <div
                        key={chap.id}
                        onClick={() => {
                          handleSeek(chap.start_time);
                          setActiveTab("transcript");
                        }}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition">
                            {formatTime(chap.start_time)}
                          </span>
                          <span className="font-medium text-slate-200 group-hover:text-indigo-300 transition">
                            {chap.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">{chap.summary}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: ACTION ITEMS */}
            {activeTab === "tasks" && (
              <div className="space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
                {/* Inline New Action Item Form */}
                <form onSubmit={handleAddActionItem} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-3 items-center">
                  <input
                    type="text"
                    required
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Add a new action item..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    placeholder="Assignee (e.g. Alex)"
                    className="w-36 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 shadow transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                </form>

                {/* Action Items List */}
                <div className="space-y-2.5">
                  {meeting.action_items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                        item.completed
                          ? "bg-slate-900/40 border-slate-800/60 opacity-60"
                          : "bg-[#131b2e] border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleActionToggle(item.id, item.completed)}
                          className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                        />
                        <span className={`font-medium text-xs ${item.completed ? "line-through text-slate-500" : "text-slate-200"}`}>
                          {item.text}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20">
                          {item.assignee}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          Due: {item.due_date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: SOUNDBITES */}
            {activeTab === "soundbites" && (
              <div className="space-y-3 overflow-y-auto flex-1 pr-1 text-xs">
                {meeting.soundbites.length === 0 ? (
                  <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                    <Mic className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 font-medium">No Soundbites Saved Yet</p>
                    <p className="text-slate-500 text-[11px] mt-1">
                      Click the "Soundbite" button on any transcript line to clip audio!
                    </p>
                  </div>
                ) : (
                  meeting.soundbites.map((sb) => (
                    <div
                      key={sb.id}
                      className="bg-[#131b2e] border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            handleSeek(sb.start_time);
                            setActiveTab("transcript");
                          }}
                          className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow transition hover:scale-105"
                        >
                          <Mic className="w-4 h-4" />
                        </button>
                        <div>
                          <div className="font-bold text-xs text-slate-200">{sb.title}</div>
                          <div className="text-[11px] text-slate-400 italic font-sans mt-0.5">
                            "{sb.snippet_text}"
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          await deleteSoundbite(sb.id);
                          setMeeting((prev) => (prev ? { ...prev, soundbites: prev.soundbites.filter((s) => s.id !== sb.id) } : prev));
                          showToast("Soundbite deleted");
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right AI Copilot Side Panel (Ask Fred) */}
          <div className="hidden lg:block w-80 border-l border-slate-800 p-4 bg-[#090d16]/70">
            <AskFredDrawer
              meetingId={meeting.id}
              onSeekToTimestamp={(t) => {
                handleSeek(t);
                setActiveTab("transcript");
              }}
            />
          </div>
        </div>
      </div>

      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-xl border border-indigo-400 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-purple-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <CreateMeetingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(m) => router.push(`/meetings/${m.id}`)}
      />

      <ComingSoonModal
        isOpen={!!comingSoonFeature}
        featureName={comingSoonFeature || ""}
        onClose={() => setComingSoonFeature(null)}
      />
    </div>
  );
}
