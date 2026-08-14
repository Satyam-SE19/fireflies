import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/meetings", tags=["Meetings"])

def parse_json_safely(data_str: str, default=None):
    if default is None:
        default = []
    if not data_str:
        return default
    try:
        return json.loads(data_str)
    except Exception:
        return default

@router.get("", response_model=List[schemas.MeetingListResponse])
def get_meetings(
    q: Optional[str] = None,
    category: Optional[str] = None,
    participant: Optional[str] = None,
    sort_by: Optional[str] = "recency",
    db: Session = Depends(get_db)
):
    query = db.query(models.Meeting)

    # Filtering by category
    if category and category.lower() != "all":
        query = query.filter(models.Meeting.category.ilike(f"%{category}%"))

    # Filtering by participant
    if participant and participant.strip():
        query = query.filter(models.Meeting.participants.ilike(f"%{participant.strip()}%"))

    # Global search query (title, organizer, participants)
    if q and q.strip():
        search_term = f"%{q.strip()}%"
        query = query.filter(
            (models.Meeting.title.ilike(search_term)) |
            (models.Meeting.organizer.ilike(search_term)) |
            (models.Meeting.participants.ilike(search_term)) |
            (models.Meeting.category.ilike(search_term))
        )

    # Sorting
    if sort_by == "recency" or sort_by == "date_desc":
        query = query.order_by(models.Meeting.id.desc())
    elif sort_by == "date_asc":
        query = query.order_by(models.Meeting.id.asc())
    elif sort_by == "duration_desc":
        query = query.order_by(models.Meeting.duration.desc())
    elif sort_by == "duration_asc":
        query = query.order_by(models.Meeting.duration.asc())
    elif sort_by == "title":
        query = query.order_by(models.Meeting.title.asc())
    else:
        query = query.order_by(models.Meeting.id.desc())

    meetings = query.all()

    response = []
    for m in meetings:
        participants_list = parse_json_safely(m.participants, ["Alex Rivera", "Sarah Connor"])
        utterances_count = db.query(models.TranscriptUtterance).filter_by(meeting_id=m.id).count()
        action_items_count = db.query(models.ActionItem).filter_by(meeting_id=m.id).count()

        response.append(schemas.MeetingListResponse(
            id=m.id,
            title=m.title,
            date=m.date,
            duration=m.duration,
            organizer=m.organizer,
            participants=participants_list,
            category=m.category,
            sentiment_score=m.sentiment_score,
            media_url=m.media_url or "",
            utterances_count=utterances_count,
            action_items_count=action_items_count
        ))
    return response

@router.get("/{meeting_id}", response_model=schemas.MeetingDetailResponse)
def get_meeting_detail(meeting_id: int, db: Session = Depends(get_db)):
    m = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Meeting not found")

    participants_list = parse_json_safely(m.participants, [])

    # Format AI summary takeaways safely
    ai_summary_res = None
    if m.ai_summary:
        takeaways = parse_json_safely(m.ai_summary.key_takeaways, [])
        ai_summary_res = schemas.AiSummaryResponse(
            id=m.ai_summary.id,
            meeting_id=m.ai_summary.meeting_id,
            overview=m.ai_summary.overview,
            sentiment_summary=m.ai_summary.sentiment_summary,
            key_takeaways=takeaways
        )

    utterances_res = [
        schemas.TranscriptUtteranceResponse.from_orm(u) for u in m.utterances
    ]
    topic_chapters_res = [
        schemas.TopicChapterResponse.from_orm(t) for t in m.topic_chapters
    ]
    action_items_res = [
        schemas.ActionItemResponse.from_orm(a) for a in m.action_items
    ]
    soundbites_res = [
        schemas.SoundbiteResponse.from_orm(s) for s in m.soundbites
    ]

    return schemas.MeetingDetailResponse(
        id=m.id,
        title=m.title,
        date=m.date,
        duration=m.duration,
        organizer=m.organizer,
        participants=participants_list,
        category=m.category,
        sentiment_score=m.sentiment_score,
        media_url=m.media_url or "",
        created_at=m.created_at,
        utterances=utterances_res,
        ai_summary=ai_summary_res,
        topic_chapters=topic_chapters_res,
        action_items=action_items_res,
        soundbites=soundbites_res
    )

@router.post("", response_model=schemas.MeetingDetailResponse)
def create_meeting(data: schemas.MeetingCreate, db: Session = Depends(get_db)):
    date_str = data.date or datetime.date.today().strftime("%b %d, %Y")
    participants_json = json.dumps(data.participants if data.participants else ["Alex Rivera", "Sarah Connor", "Freddie AI"])

    meeting = models.Meeting(
        title=data.title,
        date=date_str,
        duration=data.duration or 1500,
        organizer=data.organizer or "Freddie AI",
        participants=participants_json,
        category=data.category or "General",
        sentiment_score=0.85,
        media_url=data.media_url or "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    # Process raw transcript if provided
    raw_lines = (data.raw_transcript or "").strip().split("\n")
    utterances = []
    current_time = 0.0

    if data.raw_transcript and len(raw_lines) > 0:
        speakers = data.participants if data.participants and len(data.participants) > 0 else ["Speaker 1", "Speaker 2"]
        for i, line in enumerate(raw_lines):
            line_str = line.strip()
            if not line_str:
                continue
            
            # Check if speaker label exists in text e.g. "Alex: Hello"
            speaker_name = speakers[i % len(speakers)]
            text = line_str
            if ":" in line_str and len(line_str.split(":")[0]) < 25:
                parts = line_str.split(":", 1)
                speaker_name = parts[0].strip()
                text = parts[1].strip()

            dur = max(3.0, len(text) * 0.15)
            u = models.TranscriptUtterance(
                meeting_id=meeting.id,
                speaker_name=speaker_name,
                speaker_avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={speaker_name}",
                start_time=round(current_time, 1),
                end_time=round(current_time + dur, 1),
                text=text,
                sentiment="positive" if "great" in text.lower() or "agree" in text.lower() else "neutral",
                category="action_item" if "will" in text.lower() or "task" in text.lower() else "general"
            )
            current_time += dur + 1.0
            db.add(u)
            utterances.append(u)
        
        meeting.duration = int(current_time)
        db.commit()

    # Generate Default AI Summary if needed
    overview = f"In this meeting titled '{data.title}', the team discussed key agenda points regarding {data.category.lower() if data.category else 'project goals'}. Key decisions were outlined, aligned on deliverables, and task ownership was established across team members."
    takeaways = [
        f"Aligned on strategic priorities for {data.title}.",
        "Established clear timeline and milestones for upcoming release.",
        "Assigned action items with target delivery dates for accountability."
    ]
    
    summary = models.AiSummary(
        meeting_id=meeting.id,
        overview=overview,
        sentiment_summary="Overall positive sentiment with active collaboration and clear goal setting.",
        key_takeaways=json.dumps(takeaways)
    )
    db.add(summary)

    # Generate Chapters
    ch1 = models.TopicChapter(
        meeting_id=meeting.id,
        title="1. Introduction & Context",
        start_time=0.0,
        summary="Opening remarks and review of context."
    )
    ch2 = models.TopicChapter(
        meeting_id=meeting.id,
        title="2. Main Core Discussion",
        start_time=round(current_time * 0.3, 1),
        summary="Detailed exploration of technical and strategic solutions."
    )
    ch3 = models.TopicChapter(
        meeting_id=meeting.id,
        title="3. Action Items & Wrap-Up",
        start_time=round(current_time * 0.75, 1),
        summary="Review of assigned tasks and next sync scheduled."
    )
    db.add_all([ch1, ch2, ch3])

    # Generate Sample Action Item
    assignee = data.participants[0] if data.participants else "Alex Rivera"
    act = models.ActionItem(
        meeting_id=meeting.id,
        text=f"Follow up on key deliverables for {data.title}",
        assignee=assignee,
        due_date="End of Week",
        completed=False
    )
    db.add(act)

    db.commit()
    return get_meeting_detail(meeting.id, db)

@router.put("/{meeting_id}", response_model=schemas.MeetingDetailResponse)
def update_meeting(meeting_id: int, data: schemas.MeetingUpdate, db: Session = Depends(get_db)):
    m = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if data.title is not None:
        m.title = data.title
    if data.date is not None:
        m.date = data.date
    if data.category is not None:
        m.category = data.category
    if data.participants is not None:
        m.participants = json.dumps(data.participants)

    db.commit()
    return get_meeting_detail(meeting_id, db)

@router.delete("/{meeting_id}")
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    m = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    db.delete(m)
    db.commit()
    return {"message": "Meeting deleted successfully", "id": meeting_id}

@router.get("/{meeting_id}/search")
def search_transcript(meeting_id: int, q: str = Query(...), db: Session = Depends(get_db)):
    if not q.strip():
        return []
    
    utterances = db.query(models.TranscriptUtterance).filter(
        models.TranscriptUtterance.meeting_id == meeting_id,
        models.TranscriptUtterance.text.ilike(f"%{q.strip()}%")
    ).all()

    return [
        {
            "utterance_id": u.id,
            "speaker_name": u.speaker_name,
            "start_time": u.start_time,
            "text": u.text
        } for u in utterances
    ]
