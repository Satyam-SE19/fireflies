from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

# Utterance Schemas
class TranscriptUtteranceBase(BaseModel):
    speaker_name: str
    speaker_avatar: Optional[str] = None
    start_time: float
    end_time: float
    text: str
    sentiment: Optional[str] = "neutral"
    category: Optional[str] = "general"

class TranscriptUtteranceCreate(TranscriptUtteranceBase):
    pass

class TranscriptUtteranceResponse(TranscriptUtteranceBase):
    id: int
    meeting_id: int

    class Config:
        from_attributes = True

# AI Summary Schemas
class AiSummaryBase(BaseModel):
    overview: str
    sentiment_summary: Optional[str] = None
    key_takeaways: List[str] = []

class AiSummaryResponse(BaseModel):
    id: int
    meeting_id: int
    overview: str
    sentiment_summary: Optional[str] = None
    key_takeaways: List[str] = []

    class Config:
        from_attributes = True

# Topic Chapter Schemas
class TopicChapterBase(BaseModel):
    title: str
    start_time: float
    summary: Optional[str] = None

class TopicChapterResponse(TopicChapterBase):
    id: int
    meeting_id: int

    class Config:
        from_attributes = True

# Action Item Schemas
class ActionItemBase(BaseModel):
    text: str
    assignee: Optional[str] = "Unassigned"
    due_date: Optional[str] = "Next Week"
    completed: Optional[bool] = False

class ActionItemCreate(ActionItemBase):
    meeting_id: int

class ActionItemUpdate(BaseModel):
    text: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    completed: Optional[bool] = None

class ActionItemResponse(ActionItemBase):
    id: int
    meeting_id: int

    class Config:
        from_attributes = True

# Soundbite Schemas
class SoundbiteBase(BaseModel):
    title: str
    speaker_name: str
    start_time: float
    end_time: float
    snippet_text: str

class SoundbiteCreate(SoundbiteBase):
    meeting_id: int

class SoundbiteResponse(SoundbiteBase):
    id: int
    meeting_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Meeting Schemas
class MeetingBase(BaseModel):
    title: str
    date: str
    duration: int
    organizer: Optional[str] = "Freddie AI"
    participants: List[str] = []
    category: Optional[str] = "General"
    sentiment_score: Optional[float] = 0.8
    media_url: Optional[str] = ""

class MeetingCreate(BaseModel):
    title: str
    date: Optional[str] = None
    duration: Optional[int] = 1800
    organizer: Optional[str] = "Freddie AI"
    participants: Optional[List[str]] = []
    category: Optional[str] = "General"
    raw_transcript: Optional[str] = None  # Text pasted/uploaded to parse
    media_url: Optional[str] = ""

class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    participants: Optional[List[str]] = None
    category: Optional[str] = None

class MeetingListResponse(BaseModel):
    id: int
    title: str
    date: str
    duration: int
    organizer: str
    participants: List[str]
    category: str
    sentiment_score: float
    media_url: str
    utterances_count: int
    action_items_count: int

    class Config:
        from_attributes = True

class MeetingDetailResponse(BaseModel):
    id: int
    title: str
    date: str
    duration: int
    organizer: str
    participants: List[str]
    category: str
    sentiment_score: float
    media_url: str
    created_at: Optional[datetime]
    utterances: List[TranscriptUtteranceResponse] = []
    ai_summary: Optional[AiSummaryResponse] = None
    topic_chapters: List[TopicChapterResponse] = []
    action_items: List[ActionItemResponse] = []
    soundbites: List[SoundbiteResponse] = []

    class Config:
        from_attributes = True

# Ask Fred Schemas
class AskFredRequest(BaseModel):
    meeting_id: int
    question: str

class AskFredResponse(BaseModel):
    answer: str
    relevant_utterances: List[TranscriptUtteranceResponse] = []
