from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/action-items", tags=["Action Items"])

@router.get("", response_model=List[schemas.ActionItemResponse])
def get_action_items(
    meeting_id: Optional[int] = None,
    completed: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.ActionItem)
    if meeting_id is not None:
        query = query.filter(models.ActionItem.meeting_id == meeting_id)
    if completed is not None:
        query = query.filter(models.ActionItem.completed == completed)

    return query.order_by(models.ActionItem.id.desc()).all()

@router.post("", response_model=schemas.ActionItemResponse)
def create_action_item(data: schemas.ActionItemCreate, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == data.meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    item = models.ActionItem(
        meeting_id=data.meeting_id,
        text=data.text,
        assignee=data.assignee or "Unassigned",
        due_date=data.due_date or "Next Week",
        completed=data.completed or False
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/{item_id}", response_model=schemas.ActionItemResponse)
def update_action_item(item_id: int, data: schemas.ActionItemUpdate, db: Session = Depends(get_db)):
    item = db.query(models.ActionItem).filter(models.ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")

    if data.text is not None:
        item.text = data.text
    if data.assignee is not None:
        item.assignee = data.assignee
    if data.due_date is not None:
        item.due_date = data.due_date
    if data.completed is not None:
        item.completed = data.completed

    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}")
def delete_action_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.ActionItem).filter(models.ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")

    db.delete(item)
    db.commit()
    return {"message": "Action item deleted", "id": item_id}
