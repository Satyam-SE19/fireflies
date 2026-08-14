"use client";

import { useState } from "react";
import { Sparkles, Send, Bot, User, Clock, ChevronRight, X, MessageSquareQuote } from "lucide-react";
import { askFred, Utterance } from "@/lib/api";

interface Message {
  id: string;
  sender: "user" | "freddie";
  text: string;
  relevantUtterances?: Utterance[];
}

interface AskFredDrawerProps {
  meetingId: number;
  onSeekToTimestamp: (time: number) => void;
  onClose?: () => void;
}

export default function AskFredDrawer({
  meetingId,
  onSeekToTimestamp,
  onClose
}: AskFredDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "freddie",
      text: "Hi Alex! I'm Freddie AI, your meeting copilot. Ask me anything about this meeting's decisions, action items, or discussion points!",
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    "What were the key decisions made?",
    "List all action items and assignees",
    "Was budget or hiring discussed?",
    "Summarize speaker contributions"
  ];

  const handleSend = async (qText?: string) => {
    const query = qText || inputQuestion.trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!qText) setInputQuestion("");
    setLoading(true);

    try {
      const response = await askFred(meetingId, query);
      const freddieMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "freddie",
        text: response.answer,
        relevantUtterances: response.relevant_utterances,
      };
      setMessages((prev) => [...prev, freddieMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "freddie",
          text: "I ran into a temporary issue retrieving data. Please ensure the backend server is online.",
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#131b2e] border border-slate-800 rounded-xl flex flex-col h-full shadow-2xl overflow-hidden">
      {/* Drawer Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-600/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>Ask Fred AI Assistant</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                GPT-4o
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Meeting Context Copilot</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3.5 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20"
              }`}
            >
              {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div className="max-w-[85%] space-y-2">
              <div
                className={`p-3 rounded-xl shadow-sm ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none leading-relaxed"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>

              {/* Citations & Jump Timestamps */}
              {msg.relevantUtterances && msg.relevantUtterances.length > 0 && (
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <MessageSquareQuote className="w-3 h-3 text-purple-400" />
                    <span>Transcript References</span>
                  </div>
                  <div className="space-y-1">
                    {msg.relevantUtterances.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => onSeekToTimestamp(u.start_time)}
                        className="w-full flex items-start gap-2 p-1.5 rounded bg-slate-900/80 hover:bg-indigo-950/50 border border-slate-800/80 hover:border-indigo-500/40 text-left transition group"
                      >
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold group-hover:bg-indigo-500 group-hover:text-white transition flex-shrink-0">
                          {formatTime(u.start_time)}
                        </span>
                        <div className="truncate">
                          <span className="text-[11px] font-semibold text-slate-300 mr-1">{u.speaker_name}:</span>
                          <span className="text-[11px] text-slate-400 italic font-sans">{u.text}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 items-center">
            <div className="w-7 h-7 rounded-full bg-purple-600/30 text-purple-400 flex items-center justify-center animate-spin">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs italic">
              Freddie is analyzing transcript context...
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-2 bg-slate-900/50 border-t border-slate-800/80 overflow-x-auto whitespace-nowrap space-x-1.5 scrollbar-none">
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-[10px] text-slate-300 hover:text-purple-300 transition"
          >
            <span>{prompt}</span>
            <ChevronRight className="w-2.5 h-2.5 text-slate-500" />
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="p-3 border-t border-slate-800 bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask Fred a question about this call..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || loading}
            className="p-2 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-40 transition"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
