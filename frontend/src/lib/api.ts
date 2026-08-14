const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface Utterance {
  id: number;
  meeting_id: number;
  speaker_name: string;
  speaker_avatar?: string;
  start_time: number;
  end_time: number;
  text: string;
  sentiment?: "positive" | "neutral" | "negative";
  category?: "general" | "question" | "action_item" | "metric";
}

export interface AiSummary {
  id: number;
  meeting_id: number;
  overview: string;
  sentiment_summary?: string;
  key_takeaways: string[];
}

export interface TopicChapter {
  id: number;
  meeting_id: number;
  title: string;
  start_time: number;
  summary?: string;
}

export interface ActionItem {
  id: number;
  meeting_id: number;
  text: string;
  assignee: string;
  due_date: string;
  completed: boolean;
}

export interface Soundbite {
  id: number;
  meeting_id: number;
  title: string;
  speaker_name: string;
  start_time: number;
  end_time: number;
  snippet_text: string;
  created_at?: string;
}

export interface MeetingListItem {
  id: number;
  title: string;
  date: string;
  duration: number;
  organizer: string;
  participants: string[];
  category: string;
  sentiment_score: number;
  media_url: string;
  utterances_count: number;
  action_items_count: number;
}

export interface MeetingDetail extends MeetingListItem {
  created_at?: string;
  utterances: Utterance[];
  ai_summary?: AiSummary;
  topic_chapters: TopicChapter[];
  action_items: ActionItem[];
  soundbites: Soundbite[];
}

export async function fetchMeetings(params?: {
  q?: string;
  category?: string;
  participant?: string;
  sort_by?: string;
}): Promise<MeetingListItem[]> {
  const url = new URL(`${API_BASE_URL}/meetings`);
  if (params?.q) url.searchParams.append("q", params.q);
  if (params?.category) url.searchParams.append("category", params.category);
  if (params?.participant) url.searchParams.append("participant", params.participant);
  if (params?.sort_by) url.searchParams.append("sort_by", params.sort_by);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch meetings");
  return res.json();
}

export async function fetchMeetingDetail(id: number): Promise<MeetingDetail> {
  const res = await fetch(`${API_BASE_URL}/meetings/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch meeting detail");
  return res.json();
}

export async function createMeeting(data: {
  title: string;
  date?: string;
  duration?: number;
  organizer?: string;
  participants?: string[];
  category?: string;
  raw_transcript?: string;
  media_url?: string;
}): Promise<MeetingDetail> {
  const res = await fetch(`${API_BASE_URL}/meetings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create meeting");
  return res.json();
}

export async function updateMeeting(id: number, data: {
  title?: string;
  date?: string;
  participants?: string[];
  category?: string;
}): Promise<MeetingDetail> {
  const res = await fetch(`${API_BASE_URL}/meetings/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update meeting");
  return res.json();
}

export async function deleteMeeting(id: number): Promise<{ message: string; id: number }> {
  const res = await fetch(`${API_BASE_URL}/meetings/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete meeting");
  return res.json();
}

export async function searchTranscript(id: number, q: string) {
  const res = await fetch(`${API_BASE_URL}/meetings/${id}/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error("Transcript search failed");
  return res.json();
}

export async function fetchActionItems(meetingId?: number): Promise<ActionItem[]> {
  const url = meetingId ? `${API_BASE_URL}/action-items?meeting_id=${meetingId}` : `${API_BASE_URL}/action-items`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch action items");
  return res.json();
}

export async function createActionItem(data: {
  meeting_id: number;
  text: string;
  assignee?: string;
  due_date?: string;
  completed?: boolean;
}): Promise<ActionItem> {
  const res = await fetch(`${API_BASE_URL}/action-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create action item");
  return res.json();
}

export async function updateActionItem(id: number, data: {
  text?: string;
  assignee?: string;
  due_date?: string;
  completed?: boolean;
}): Promise<ActionItem> {
  const res = await fetch(`${API_BASE_URL}/action-items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update action item");
  return res.json();
}

export async function deleteActionItem(id: number) {
  const res = await fetch(`${API_BASE_URL}/action-items/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete action item");
  return res.json();
}

export async function fetchSoundbites(meetingId?: number): Promise<Soundbite[]> {
  const url = meetingId ? `${API_BASE_URL}/soundbites?meeting_id=${meetingId}` : `${API_BASE_URL}/soundbites`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch soundbites");
  return res.json();
}

export async function createSoundbite(data: {
  meeting_id: number;
  title: string;
  speaker_name: string;
  start_time: number;
  end_time: number;
  snippet_text: string;
}): Promise<Soundbite> {
  const res = await fetch(`${API_BASE_URL}/soundbites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create soundbite");
  return res.json();
}

export async function deleteSoundbite(id: number) {
  const res = await fetch(`${API_BASE_URL}/soundbites/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete soundbite");
  return res.json();
}

export async function askFred(meeting_id: number, question: string): Promise<{
  answer: string;
  relevant_utterances: Utterance[];
}> {
  const res = await fetch(`${API_BASE_URL}/ai/ask-fred`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ meeting_id, question }),
  });
  if (!res.ok) throw new Error("Ask Fred query failed");
  return res.json();
}

// Notifications API
export async function fetchNotifications() {
  const res = await fetch(`${API_BASE_URL}/notifications`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function markNotificationRead(id: number) {
  await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: "PUT" });
}

// Workspaces API
export async function fetchWorkspaces() {
  const res = await fetch(`${API_BASE_URL}/workspaces`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function createWorkspace(name: string) {
  const res = await fetch(`${API_BASE_URL}/workspaces`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function activateWorkspace(id: number) {
  const res = await fetch(`${API_BASE_URL}/workspaces/${id}/activate`, { method: "PUT" });
  return res.json();
}

// Analytics API
export async function fetchAnalytics() {
  const res = await fetch(`${API_BASE_URL}/analytics`, { cache: "no-store" });
  if (!res.ok) throw new Error("Analytics fetch failed");
  return res.json();
}

// Integrations API
export async function fetchIntegrations() {
  const res = await fetch(`${API_BASE_URL}/integrations`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function toggleIntegration(id: string) {
  const res = await fetch(`${API_BASE_URL}/integrations/${id}/toggle`, { method: "PUT" });
  return res.json();
}

export async function fetchWebhooks() {
  const res = await fetch(`${API_BASE_URL}/integrations/webhooks`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function createWebhook(url: string, event?: string) {
  const res = await fetch(`${API_BASE_URL}/integrations/webhooks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, event }),
  });
  return res.json();
}

// Bot & Team Settings API
export async function fetchBotConfig() {
  const res = await fetch(`${API_BASE_URL}/settings/bot`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch bot config");
  return res.json();
}

export async function updateBotConfig(data: any) {
  const res = await fetch(`${API_BASE_URL}/settings/bot`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchTeamMembers() {
  const res = await fetch(`${API_BASE_URL}/settings/team`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function inviteTeamMember(name: string, email: string, role?: string) {
  const res = await fetch(`${API_BASE_URL}/settings/team`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, role }),
  });
  return res.json();
}

export async function fetchApiKeys() {
  const res = await fetch(`${API_BASE_URL}/settings/api-keys`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function createApiKey(name: string) {
  const res = await fetch(`${API_BASE_URL}/settings/api-keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
}
