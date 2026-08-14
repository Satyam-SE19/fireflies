from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/soundbites", tags=["Soundbites"])

@router.get("", response_model=List[schemas.SoundbiteResponse])
def get_soundbites(meeting_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.Soundbite)
    if meeting_id is not None:
        query = query.filter(models.Soundbite.meeting_id == meeting_id)
    return query.order_by(models.Soundbite.id.desc()).all()

@router.post("", response_model=schemas.SoundbiteResponse)
def create_soundbite(data: schemas.SoundbiteCreate, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == data.meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    soundbite = models.Soundbite(
        meeting_id=data.meeting_id,
        title=data.title,
        speaker_name=data.speaker_name,
        start_time=data.start_time,
        end_time=data.end_time,
        snippet_text=data.snippet_text
    )
    db.add(soundbite)
    db.commit()
    db.refresh(soundbite)
    return soundbite

@router.delete("/{soundbite_id}")
def delete_soundbite(soundbite_id: int, db: Session = Depends(get_db)):
    soundbite = db.query(models.Soundbite).filter(models.Soundbite.id == soundbite_id).first()
    if not soundbite:
        raise HTTPException(status_code=404, detail="Soundbite not found")

    db.delete(soundbite)
    db.commit()
    return {"message": "Soundbite deleted", "id": soundbite_id}
