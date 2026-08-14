from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/integrations", tags=["Integrations"])

class IntegrationItem(BaseModel):
    id: str
    name: str
    category: str
    description: str
    icon: str
    enabled: bool
    status: str

integrations_db: List[IntegrationItem] = [
    IntegrationItem(id="zoom", name="Zoom Video Communications", category="Video Conferencing", description="Auto-record & transcribe live Zoom calls.", icon="video", enabled=True, status="Connected"),
    IntegrationItem(id="gmeet", name="Google Meet", category="Video Conferencing", description="Fireflies bot auto-joins Google Meet links from Google Calendar.", icon="video", enabled=True, status="Connected"),
    IntegrationItem(id="teams", name="Microsoft Teams", category="Video Conferencing", description="Seamless meeting notes capture for MS Teams channels.", icon="video", enabled=True, status="Connected"),
    IntegrationItem(id="salesforce", name="Salesforce CRM", category="CRM & Sales", description="Sync call recaps, action items, and contact notes to Salesforce.", icon="database", enabled=True, status="Active Sync"),
    IntegrationItem(id="hubspot", name="HubSpot CRM", category="CRM & Sales", description="Log call notes & tasks automatically under deals and contacts.", icon="database", enabled=False, status="Disconnected"),
    IntegrationItem(id="slack", name="Slack Workspace", category="Communication", description="Post automated meeting summaries directly into designated Slack channels.", icon="message-square", enabled=True, status="Connected"),
]

class WebhookItem(BaseModel):
    id: int
    url: str
    event: str
    status: str

webhooks_db: List[WebhookItem] = [
    WebhookItem(id=1, url="https://api.acme.com/webhooks/fireflies-meeting-ended", event="meeting.completed", status="Active")
]

class CreateWebhookRequest(BaseModel):
    url: str
    event: Optional[str] = "meeting.completed"

@router.get("", response_model=List[IntegrationItem])
def get_integrations():
    return integrations_db

@router.put("/{integration_id}/toggle")
def toggle_integration(integration_id: str):
    for item in integrations_db:
        if item.id == integration_id:
            item.enabled = not item.enabled
            item.status = "Connected" if item.enabled else "Disconnected"
            return item
    return {"message": "Integration toggled"}

@router.get("/webhooks", response_model=List[WebhookItem])
def get_webhooks():
    return webhooks_db

@router.post("/webhooks", response_model=WebhookItem)
def create_webhook(req: CreateWebhookRequest):
    wh = WebhookItem(id=len(webhooks_db) + 1, url=req.url, event=req.event or "meeting.completed", status="Active")
    webhooks_db.append(wh)
    return wh
