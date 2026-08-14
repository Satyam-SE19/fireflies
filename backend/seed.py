import json
import datetime
from database import engine, SessionLocal, Base
import models

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    print("Seeding database with rich Fireflies meeting data...")

    # Sample audio links ( royalty free MP3 test files )
    AUDIO_1 = "https://cdn.freesound.org/previews/686/686488_11861866-lq.mp3"
    AUDIO_2 = "https://cdn.freesound.org/previews/612/612260_5674468-lq.mp3"

    # ==========================================
    # Meeting 1: Q3 Product Strategy & AI Roadmap Sync
    # ==========================================
    m1 = models.Meeting(
        title="Q3 Product Strategy & AI Roadmap Sync",
        date="Aug 12, 2026",
        duration=1840,
        organizer="Alex Rivera",
        participants=json.dumps(["Alex Rivera", "Sarah Connor", "John Miller", "Freddie AI"]),
        category="Product Strategy",
        sentiment_score=0.92,
        media_url=AUDIO_1
    )
    db.add(m1)
    db.commit()
    db.refresh(m1)

    utterances_1 = [
        models.TranscriptUtterance(
            meeting_id=m1.id,
            speaker_name="Alex Rivera",
            speaker_avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
            start_time=0.0,
            end_time=18.5,
            text="Welcome everyone! Today we're aligning on our Q3 AI roadmap, specifically the Ask Fred copilot upgrades and real-time meeting intelligence.",
            sentiment="positive",
            category="general"
        ),
        models.TranscriptUtterance(
            meeting_id=m1.id,
            speaker_name="Sarah Connor",
            speaker_avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
            start_time=19.2,
            end_time=42.0,
            text="Thanks Alex. On the engineering side, we've benchmarked the new LLM summarization pipeline. Inference latency dropped by 40% with zero loss in topic extraction accuracy.",
            sentiment="positive",
            category="metric"
        ),
        models.TranscriptUtterance(
            meeting_id=m1.id,
            speaker_name="John Miller",
            speaker_avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=John",
            start_time=43.5,
            end_time=68.0,
            text="That latency drop is huge for user experience. From a UI standpoint, we're redesigning the transcript player side-panel so users can highlight key moments and generate instant soundbites in one click.",
            sentiment="positive",
            category="general"
        ),
        models.TranscriptUtterance(
            meeting_id=m1.id,
            speaker_name="Alex Rivera",
            speaker_avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
            start_time=69.5,
            end_time=94.0,
            text="Can we make sure the Ask Fred chat drawer is bi-directionally synced with transcript line timestamps? When a user clicks a citation in Ask Fred, it should jump the audio player right to that second.",
            sentiment="neutral",
            category="question"
        ),
        models.TranscriptUtterance(
            meeting_id=m1.id,
            speaker_name="Sarah Connor",
            speaker_avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
            start_time=95.1,
            end_time=122.0,
            text="Absolutely! We have the exact timestamp vectors mapped in SQLite. I will publish the updated FastAPI endpoint specs by Thursday afternoon.",
            sentiment="positive",
            category="action_item"
        ),
        models.TranscriptUtterance(
            meeting_id=m1.id,
            speaker_name="John Miller",
            speaker_avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=John",
            start_time=123.5,
            end_time=150.0,
            text="Perfect. I'll finalize Figma mocks for the interactive action item checkboxes and assignee tags so engineering can integrate them in sprint 14.",
            sentiment="positive",
            category="action_item"
        ),
        models.TranscriptUtterance(
            meeting_id=m1.id,
            speaker_name="Alex Rivera",
            speaker_avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
            start_time=151.2,
            end_time=180.0,
            text="Great momentum. Let's make sure security compliance checks are cleared before our beta customer rollout next month.",
            sentiment="neutral",
            category="general"
        )
    ]
    db.add_all(utterances_1)

    summary_1 = models.AiSummary(
        meeting_id=m1.id,
        overview="The product & AI engineering leads met to review Q3 strategic priorities. Key highlights included a 40% reduction in AI summarization latency, bi-directional timestamp synchronization between Ask Fred and transcript lines, and UI design revamps for soundbites and task management.",
        sentiment_summary="High enthusiasm across product design and AI engineering. Strong confidence in meeting Q3 launch target.",
        key_takeaways=json.dumps([
            "40% reduction achieved in LLM inference latency.",
            "Ask Fred citations will feature one-click audio timestamp jump capability.",
            "Figma component library updated for action items and soundbite clipping.",
            "Targeting beta rollout for early September."
        ])
    )
    db.add(summary_1)

    chapters_1 = [
        models.TopicChapter(meeting_id=m1.id, title="1. Q3 Roadmap Overview", start_time=0.0, summary="Opening alignment on AI roadmap objectives."),
        models.TopicChapter(meeting_id=m1.id, title="2. LLM Latency Benchmarks", start_time=19.2, summary="Sarah shares 40% performance improvement metrics."),
        models.TopicChapter(meeting_id=m1.id, title="3. Interactive Transcript & Ask Fred Sync", start_time=69.5, summary="Discussion on bi-directional audio timestamp linking."),
        models.TopicChapter(meeting_id=m1.id, title="4. Action Items & Deliverables", start_time=123.5, summary="Sprint 14 task assignment and Figma mock reviews.")
    ]
    db.add_all(chapters_1)

    action_items_1 = [
        models.ActionItem(meeting_id=m1.id, text="Publish updated FastAPI timestamp endpoint specifications", assignee="Sarah Connor", due_date="Thursday Aug 15", completed=True),
        models.ActionItem(meeting_id=m1.id, text="Finalize Figma mocks for interactive action items and soundbites", assignee="John Miller", due_date="Friday Aug 16", completed=False),
        models.ActionItem(meeting_id=m1.id, text="Schedule SOC2 security review for beta release", assignee="Alex Rivera", due_date="Aug 20", completed=False)
    ]
    db.add_all(action_items_1)

    soundbites_1 = [
        models.Soundbite(meeting_id=m1.id, title="40% Latency Reduction Benchmark", speaker_name="Sarah Connor", start_time=19.2, end_time=42.0, snippet_text="Inference latency dropped by 40% with zero loss in topic extraction accuracy."),
        models.Soundbite(meeting_id=m1.id, title="Ask Fred Bi-Directional Sync Feature", speaker_name="Alex Rivera", start_time=69.5, end_time=94.0, snippet_text="When a user clicks a citation in Ask Fred, it should jump the audio player right to that second.")
    ]
    db.add_all(soundbites_1)


    # ==========================================
    # Meeting 2: Customer Feedback & Enterprise Sales QBR
    # ==========================================
    m2 = models.Meeting(
        title="Customer Feedback & Enterprise Sales QBR",
        date="Aug 10, 2026",
        duration=2250,
        organizer="Rachel Green",
        participants=json.dumps(["Rachel Green", "Marcus Vance", "Sarah Connor", "Alex Rivera"]),
        category="Sales & CS",
        sentiment_score=0.88,
        media_url=AUDIO_2
    )
    db.add(m2)
    db.commit()
    db.refresh(m2)

    utterances_2 = [
        models.TranscriptUtterance(
            meeting_id=m2.id,
            speaker_name="Rachel Green",
            speaker_avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel",
            start_time=0.0,
            end_time=25.0,
            text="Welcome team. In Q2 our enterprise ARR grew by 35%. Top feedback from customers like Acme Corp and TechCorp is their love for automated action items.",
            sentiment="positive",
            category="metric"
        ),
        models.TranscriptUtterance(
            meeting_id=m2.id,
            speaker_name="Marcus Vance",
            speaker_avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
            start_time=26.0,
            end_time=52.0,
            text="Customer CSAT score is sitting at 94%. The single feature request mentioned by 8 out of 10 clients is CRM auto-sync into Salesforce and HubSpot.",
            sentiment="positive",
            category="metric"
        ),
        models.TranscriptUtterance(
            meeting_id=m2.id,
            speaker_name="Sarah Connor",
            speaker_avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
            start_time=53.0,
            end_time=80.0,
            text="We can build standard webhook connectors for Salesforce and HubSpot tasks by next month.",
            sentiment="positive",
            category="action_item"
        ),
        models.TranscriptUtterance(
            meeting_id=m2.id,
            speaker_name="Rachel Green",
            speaker_avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel",
            start_time=81.0,
            end_time=110.0,
            text="Awesome. Let's make sure we highlight this integration capability in our upcoming enterprise sales collateral.",
            sentiment="neutral",
            category="general"
        )
    ]
    db.add_all(utterances_2)

    summary_2 = models.AiSummary(
        meeting_id=m2.id,
        overview="Quarterly Business Review highlighting 35% growth in Enterprise ARR and 94% customer satisfaction score. CRM auto-sync to HubSpot and Salesforce emerged as the top requested enterprise feature.",
        sentiment_summary="Very strong sales performance and high customer satisfaction across key accounts.",
        key_takeaways=json.dumps([
            "Enterprise ARR expanded by 35% in Q2.",
            "Customer CSAT maintained at 94%.",
            "Webhook connectors planned for Salesforce and HubSpot CRM task sync."
        ])
    )
    db.add(summary_2)

    chapters_2 = [
        models.TopicChapter(meeting_id=m2.id, title="1. Enterprise Growth Metrics", start_time=0.0, summary="ARR expansion breakdown."),
        models.TopicChapter(meeting_id=m2.id, title="2. Customer Feedback & CSAT", start_time=26.0, summary="Key customer survey findings."),
        models.TopicChapter(meeting_id=m2.id, title="3. CRM Integration Roadmap", start_time=53.0, summary="Salesforce and HubSpot sync specs.")
    ]
    db.add_all(chapters_2)

    action_items_2 = [
        models.ActionItem(meeting_id=m2.id, text="Build Webhook Connectors for CRM Auto-Sync", assignee="Sarah Connor", due_date="Sept 1", completed=False),
        models.ActionItem(meeting_id=m2.id, text="Update Enterprise Sales One-Pager Deck", assignee="Rachel Green", due_date="Aug 18", completed=True)
    ]
    db.add_all(action_items_2)


    # ==========================================
    # Meeting 3: Q4 Engineering Architecture Review
    # ==========================================
    m3 = models.Meeting(
        title="Q4 Engineering Architecture Review",
        date="Aug 08, 2026",
        duration=2700,
        organizer="John Miller",
        participants=json.dumps(["John Miller", "Sarah Connor", "Alex Rivera", "David Chen"]),
        category="Engineering",
        sentiment_score=0.79,
        media_url=AUDIO_1
    )
    db.add(m3)
    db.commit()
    db.refresh(m3)

    utterances_3 = [
        models.TranscriptUtterance(
            meeting_id=m3.id,
            speaker_name="John Miller",
            speaker_avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=John",
            start_time=0.0,
            end_time=30.0,
            text="Today we're evaluating our SQLite and database access patterns to ensure sub-100ms response times for full-text transcript search.",
            sentiment="neutral",
            category="general"
        ),
        models.TranscriptUtterance(
            meeting_id=m3.id,
            speaker_name="David Chen",
            speaker_avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=David",
            start_time=31.0,
            end_time=65.0,
            text="By enabling SQLite FTS5 (Full-Text Search) indexes on utterances, query times stay below 15ms even with over 100,000 meeting lines.",
            sentiment="positive",
            category="metric"
        )
    ]
    db.add_all(utterances_3)

    summary_3 = models.AiSummary(
        meeting_id=m3.id,
        overview="Technical deep dive into database performance and index optimization for full-text transcript search.",
        sentiment_summary="Productive technical architectural session.",
        key_takeaways=json.dumps([
            "SQLite FTS5 indexing provides sub-15ms search speeds.",
            "Database schema migration validated for persistent meeting storage."
        ])
    )
    db.add(summary_3)

    chapters_3 = [
        models.TopicChapter(meeting_id=m3.id, title="1. Architecture Evaluation", start_time=0.0, summary="Reviewing query performance bottlenecks."),
        models.TopicChapter(meeting_id=m3.id, title="2. FTS5 Indexing Strategy", start_time=31.0, summary="Benchmarking SQLite full-text search engine.")
    ]
    db.add_all(chapters_3)

    action_items_3 = [
        models.ActionItem(meeting_id=m3.id, text="Verify FTS5 SQLite tables in backend migration script", assignee="David Chen", due_date="Aug 14", completed=True)
    ]
    db.add_all(action_items_3)


    # ==========================================
    # Meeting 4: Budget Allocation & Q3 Hiring Review
    # ==========================================
    m4 = models.Meeting(
        title="Budget Allocation & Q3 Hiring Review",
        date="Aug 05, 2026",
        duration=1500,
        organizer="David Chen",
        participants=json.dumps(["David Chen", "Rachel Green", "Alex Rivera"]),
        category="Operations",
        sentiment_score=0.85,
        media_url=AUDIO_2
    )
    db.add(m4)
    db.commit()
    db.refresh(m4)

    utterances_4 = [
        models.TranscriptUtterance(
            meeting_id=m4.id,
            speaker_name="David Chen",
            speaker_avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=David",
            start_time=0.0,
            end_time=28.0,
            text="Reviewing budget allocations for Q3. We have approval to open 3 senior engineering roles and 2 account executives.",
            sentiment="positive",
            category="general"
        )
    ]
    db.add_all(utterances_4)

    summary_4 = models.AiSummary(
        meeting_id=m4.id,
        overview="Operations review confirming headcount approvals for 3 Senior Engineers and 2 Account Executives in Q3.",
        sentiment_summary="Positive operational alignment.",
        key_takeaways=json.dumps([
            "Approved budget for 5 new headcounts.",
            "Recruiting kicks off next week."
        ])
    )
    db.add(summary_4)

    chapters_4 = [
        models.TopicChapter(meeting_id=m4.id, title="1. Headcount Approval", start_time=0.0, summary="Opening roles for Q3 engineering and sales.")
    ]
    db.add_all(chapters_4)

    action_items_4 = [
        models.ActionItem(meeting_id=m4.id, text="Post Senior Full-Stack Engineer job description", assignee="David Chen", due_date="Aug 15", completed=False)
    ]
    db.add_all(action_items_4)

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
