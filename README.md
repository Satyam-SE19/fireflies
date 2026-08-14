# Fireflies.ai Web Application Clone 🚀

A modern, high-fidelity functional clone of the **Fireflies.ai** meeting-assistant platform built with Next.js (TypeScript) on the frontend, Python FastAPI on the backend, and SQLite for structured data persistence.

---

## 🌟 Features Overview

1. **Meetings Library / Dashboard**:
   - Recreates the iconic Fireflies home view.
   - Comprehensive card & list views with meeting metadata, participant avatar stacks, duration badges, and department tags.
   - Global search & real-time filters (by department category, participant, and title).
   - Recency & duration sorting.

2. **Interactive Transcript & Audio Player**:
   - Custom HTML5 Audio Player with animated waveform visualizers, jump controls (-10s / +10s), volume toggle, and playback speed controls (0.5x, 1x, 1.25x, 1.5x, 2x).
   - **Bi-Directional Synchronization**: Clicking any transcript line seeks the audio player to that exact timestamp; playing audio highlights the active utterance line in real-time.
   - Search within transcript with match highlight counters and stepper navigation.
   - Speaker filter & Smart category filters (Questions, Action Items, Metrics).

3. **"Ask Fred" AI Copilot Assistant**:
   - Conversational AI assistant side-panel powered by FastAPI.
   - Quick prompt chips for fast meeting queries (*"What were key decisions?"*, *"List action items"*).
   - **Interactive Citations**: Clickable timestamp badges on AI responses (`[00:43] Sarah Connor`) that jump audio and transcript to exact line locations.

4. **AI Summary & Outline Chapters**:
   - Auto-generated Executive Summary and Key Takeaways.
   - Outline chapters with clickable timestamp links.

5. **Action Items & Tasks Manager**:
   - Interactive task checklist with instant check state updates.
   - Assignee tags, due dates, and inline task creation.

6. **Soundbites Library**:
   - Clip audio snippets from any transcript line and manage saved soundbites across meetings.

7. **Meeting CRUD & Auto-Processing**:
   - Create new meetings by uploading transcript files (`.txt`, `.vtt`, `.json`) or pasting text directly.
   - Automatic speaker line extraction, AI overview compilation, and task generation.

8. **Fireflies Experience & Placeholders**:
   - Fireflies Dark Slate aesthetic with electric purple highlights (`#6366f1` / `#8b5cf6`).
   - "Coming Soon" interactive previews for Live Call Bot, Zoom/Google Meet auto-join, and CRM integration.

---

## 🏗️ Technical Architecture & Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Python 3.14, FastAPI, SQLAlchemy ORM, Pydantic v2, Uvicorn.
- **Database**: SQLite (`fireflies.db`) with full relational schema.

---

## 🗄️ Database Schema (SQLite)

The SQLite database (`backend/fireflies.db`) uses the following schema design:

```
+-------------------+       +-----------------------+
|     MEETINGS      |1    N | TRANSCRIPT_UTTERANCES |
+-------------------+-------+-----------------------+
| id (PK)           |<-----+| id (PK)               |
| title             |       | meeting_id (FK)       |
| date              |       | speaker_name          |
| duration          |       | speaker_avatar        |
| organizer         |       | start_time            |
| participants      |       | end_time              |
| category          |       | text                  |
| sentiment_score   |       | sentiment             |
| media_url         |       | category              |
+-------------------+       +-----------------------+
          | 1
          |
          | 1               +-----------------------+
          +---------------->|      AI_SUMMARIES     |
          |                 +-----------------------+
          |                 | id (PK)               |
          |                 | meeting_id (FK)       |
          |                 | overview              |
          |                 | sentiment_summary     |
          |                 | key_takeaways (JSON)  |
          |                 +-----------------------+
          | 1
          |                 +-----------------------+
          +---------------->|     TOPIC_CHAPTERS    | N
          |                 +-----------------------+
          |                 | id (PK)               |
          |                 | meeting_id (FK)       |
          |                 | title                 |
          |                 | start_time            |
          |                 | summary               |
          |                 +-----------------------+
          | 1
          |                 +-----------------------+
          +---------------->|      ACTION_ITEMS     | N
          |                 +-----------------------+
          |                 | id (PK)               |
          |                 | meeting_id (FK)       |
          |                 | text                  |
          |                 | assignee              |
          |                 | due_date              |
          |                 | completed             |
          |                 +-----------------------+
          | 1
          |                 +-----------------------+
          +---------------->|       SOUNDBITES      | N
          |                 +-----------------------+
          |                 | id (PK)               |
          |                 | meeting_id (FK)       |
          |                 | title                 |
          |                 | speaker_name          |
          |                 | start_time            |
          |                 | end_time              |
          |                 | snippet_text          |
          +-----------------------------------------+
```

---

## ⚡ Quick Start & Setup Instructions

### Prerequisites
- Node.js (v18+) & NPM
- Python (v3.10+)

### 1. Backend Setup & Database Seeding

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Seed SQLite database with pre-populated meetings
python seed.py

# Run FastAPI backend server (Port 8000)
python main.py
```
*Backend API documentation will be available at `http://localhost:8000/docs`.*

### 2. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Run Next.js dev server (Port 3000)
npm run dev
```
*Open `http://localhost:3000` in your web browser to interact with the app.*

---

## 🔌 API Reference

- `GET /api/meetings`: List meetings (supports `q`, `category`, `participant`, `sort_by`).
- `GET /api/meetings/{id}`: Detailed view of a meeting with utterances, summary, topics, tasks, and soundbites.
- `POST /api/meetings`: Create a new meeting (auto-generates summary & tasks from raw text/file).
- `PUT /api/meetings/{id}`: Update meeting metadata.
- `DELETE /api/meetings/{id}`: Delete meeting and all cascade children.
- `POST /api/ai/ask-fred`: Ask Fred AI copilot query endpoint.
- `GET /api/action-items`: List action items (supports `meeting_id` and `completed` filters).
- `POST /api/action-items`: Add a new action item.
- `PUT /api/action-items/{id}`: Toggle task completion or edit attributes.
- `GET /api/soundbites`: List saved audio clips.
- `POST /api/soundbites`: Clip a new soundbite from transcript.

---

## 📝 Assumptions Made

1. **User Authentication**: Default logged-in user (`Alex Rivera`) is assumed for workspace actions.
2. **Audio Streaming**: Media player utilizes standard web audio samples with synced mathematical waveforms for demonstration.
3. **Speech-to-Text & AI**: Transcript files uploaded/pasted are parsed via FastAPI smart-regex logic to seed utterances, AI overview bullet points, and task assignees.
