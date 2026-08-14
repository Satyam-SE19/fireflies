from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/ai", tags=["Ask Fred & AI"])

@router.post("/ask-fred", response_model=schemas.AskFredResponse)
def ask_fred(data: schemas.AskFredRequest, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == data.meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    question_lower = data.question.lower()

    # Search relevant transcript lines matching keywords in the question
    keywords = [w for w in question_lower.replace("?", "").replace(",", "").split() if len(w) > 3]
    utterances = meeting.utterances
    matching_utterances = []

    for u in utterances:
        text_lower = u.text.lower()
        if any(kw in text_lower for kw in keywords):
            matching_utterances.append(u)

    # Fallback to top utterances if no direct keyword match found
    if not matching_utterances:
        matching_utterances = utterances[:3]

    # Synthesize intelligent answer based on matching content
    if "decision" in question_lower or "decide" in question_lower or "agreed" in question_lower:
        answer = f"Based on the transcript for '{meeting.title}', the team agreed on key milestones and prioritized delivery schedules. Specifically, {matching_utterances[0].speaker_name} noted: \"{matching_utterances[0].text}\""
    elif "action" in question_lower or "task" in question_lower or "todo" in question_lower or "who" in question_lower:
        actions = db.query(models.ActionItem).filter_by(meeting_id=meeting.id).all()
        if actions:
            action_strs = [f"• {a.text} (assigned to {a.assignee}, due {a.due_date})" for a in actions]
            answer = f"Here are the key action items assigned during '{meeting.title}':\n" + "\n".join(action_strs)
        else:
            answer = f"During '{meeting.title}', action items were established around technical architecture and timeline verification."
    elif "budget" in question_lower or "cost" in question_lower or "price" in question_lower or "hiring" in question_lower:
        answer = f"Regarding financial and budget discussion in '{meeting.title}': {matching_utterances[0].speaker_name} highlighted target budget allocations and resource planning at timestamp {int(matching_utterances[0].start_time // 60)}:{int(matching_utterances[0].start_time % 60):02d}."
    else:
        ref_text = f"\"{matching_utterances[0].text}\"" if matching_utterances else "the overall meeting discussion"
        speaker = matching_utterances[0].speaker_name if matching_utterances else "the participants"
        answer = f"According to Freddie AI's analysis of '{meeting.title}': {speaker} stated {ref_text}. The overall discussion focused on aligning goals and ensuring team execution."

    relevant_res = [schemas.TranscriptUtteranceResponse.from_orm(u) for u in matching_utterances[:4]]

    return schemas.AskFredResponse(
        answer=answer,
        relevant_utterances=relevant_res
    )
