import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    date = Column(String, nullable=False)  # ISO string or human date
    duration = Column(Integer, default=0)  # in seconds
    organizer = Column(String, default="Freddie AI")
    participants = Column(Text, default="[]")  # JSON encoded list of names
    category = Column(String, default="General", index=True)
    sentiment_score = Column(Float, default=0.8)
    media_url = Column(String, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    utterances = relationship("TranscriptUtterance", back_populates="meeting", cascade="all, delete-orphan")
    ai_summary = relationship("AiSummary", back_populates="meeting", uselist=False, cascade="all, delete-orphan")
    topic_chapters = relationship("TopicChapter", back_populates="meeting", cascade="all, delete-orphan")
    action_items = relationship("ActionItem", back_populates="meeting", cascade="all, delete-orphan")
    soundbites = relationship("Soundbite", back_populates="meeting", cascade="all, delete-orphan")

class TranscriptUtterance(Base):
    __tablename__ = "transcript_utterances"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    speaker_name = Column(String, nullable=False)
    speaker_avatar = Column(String, nullable=True)
    start_time = Column(Float, nullable=False)  # Seconds
    end_time = Column(Float, nullable=False)    # Seconds
    text = Column(Text, nullable=False)
    sentiment = Column(String, default="neutral")  # positive, neutral, negative
    category = Column(String, default="general")   # general, question, action_item, metric

    meeting = relationship("Meeting", back_populates="utterances")

class AiSummary(Base):
    __tablename__ = "ai_summaries"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, unique=True)
    overview = Column(Text, nullable=False)
    sentiment_summary = Column(Text, nullable=True)
    key_takeaways = Column(Text, default="[]")  # JSON list of bullet points

    meeting = relationship("Meeting", back_populates="ai_summary")

class TopicChapter(Base):
    __tablename__ = "topic_chapters"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    start_time = Column(Float, nullable=False)
    summary = Column(Text, nullable=True)

    meeting = relationship("Meeting", back_populates="topic_chapters")

class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    text = Column(Text, nullable=False)
    assignee = Column(String, default="Unassigned")
    due_date = Column(String, default="Next Week")
    completed = Column(Boolean, default=False)

    meeting = relationship("Meeting", back_populates="action_items")

class Soundbite(Base):
    __tablename__ = "soundbites"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    speaker_name = Column(String, nullable=False)
    start_time = Column(Float, nullable=False)
    end_time = Column(Float, nullable=False)
    snippet_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    meeting = relationship("Meeting", back_populates="soundbites")
