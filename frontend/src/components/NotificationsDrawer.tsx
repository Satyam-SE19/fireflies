"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckSquare, Sparkles, Mic, Info, X, Check } from "lucide-react";
import { fetchNotifications, markNotificationRead } from "@/lib/api";

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsDrawer({ isOpen, onClose }: NotificationsDrawerProps) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications().then(setItems).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRead = async (id: number) => {
    await markNotificationRead(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "task":
        return <CheckSquare className="w-4 h-4 text-emerald-400" />;
      case "summary":
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case "soundbite":
        return <Mic className="w-4 h-4 text-indigo-400" />;
      default:
        return <Info className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="absolute top-14 right-4 z-50 w-96 bg-[#131b2e] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in text-xs">
      <div className="p-3.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-slate-100">Notifications Center</h3>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 p-1">
        {items.length === 0 ? (
          <div className="p-6 text-center text-slate-400">No notifications</div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleRead(item.id)}
              className={`p-3 transition flex items-start gap-3 cursor-pointer ${
                item.read ? "bg-transparent opacity-70" : "bg-indigo-950/20"
              }`}
            >
              <div className="mt-0.5">{getIcon(item.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-slate-200 truncate">{item.title}</span>
                  <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{item.message}</p>
                {item.link && (
                  <Link
                    href={item.link}
                    onClick={onClose}
                    className="inline-block text-[10px] font-semibold text-indigo-400 hover:underline mt-1"
                  >
                    View Details →
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
