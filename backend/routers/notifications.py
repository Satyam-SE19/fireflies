from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

class NotificationItem(BaseModel):
    id: int
    title: str
    message: str
    timestamp: str
    type: str  # task, summary, soundbite, system
    read: bool
    link: str

# In-memory / seeded notifications
notifications_db: List[NotificationItem] = [
    NotificationItem(
        id=1,
        title="Action Item Completed",
        message="Sarah Connor completed 'Publish updated FastAPI timestamp specifications'",
        timestamp="10 mins ago",
        type="task",
        read=False,
        link="/meetings/1"
    ),
    NotificationItem(
        id=2,
        title="AI Summary Compiled",
        message="Freddie AI processed summary for 'Q3 Product Strategy & AI Roadmap Sync'",
        timestamp="1 hour ago",
        type="summary",
        read=False,
        link="/meetings/1"
    ),
    NotificationItem(
        id=3,
        title="New Soundbite Clipped",
        message="Sarah Connor clipped soundbite '40% Latency Reduction Benchmark'",
        timestamp="3 hours ago",
        type="soundbite",
        read=True,
        link="/soundbites"
    ),
    NotificationItem(
        id=4,
        title="Weekly Analytics Ready",
        message="Your team logged 14.5 hours of meetings with 89% positive sentiment",
        timestamp="1 day ago",
        type="system",
        read=True,
        link="/analytics"
    )
]

@router.get("", response_model=List[NotificationItem])
def get_notifications():
    return notifications_db

@router.put("/{notification_id}/read")
def mark_read(notification_id: int):
    for item in notifications_db:
        if item.id == notification_id:
            item.read = True
            return item
    return {"message": "Notification updated"}

@router.post("/clear")
def clear_all():
    global notifications_db
    notifications_db = []
    return {"message": "Notifications cleared"}
