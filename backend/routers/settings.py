from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/settings", tags=["Settings & Bot Configuration"])

class BotConfig(BaseModel):
    bot_name: str
    auto_join_rule: str  # all, internal_only, external_only
    record_video: bool
    send_email_recap: bool
    bot_avatar: str

class TeamMember(BaseModel):
    id: int
    name: str
    email: str
    role: str
    status: str

class ApiKey(BaseModel):
    id: int
    name: str
    key_prefix: str
    created_at: str

bot_config = BotConfig(
    bot_name="Freddie AI Note Taker",
    auto_join_rule="all",
    record_video=True,
    send_email_recap=True,
    bot_avatar="https://api.dicebear.com/7.x/bottts/svg?seed=Freddie"
)

team_members_db: List[TeamMember] = [
    TeamMember(id=1, name="Alex Rivera", email="alex@acme.com", role="Workspace Admin", status="Active"),
    TeamMember(id=2, name="Sarah Connor", email="sarah@acme.com", role="AI Tech Lead", status="Active"),
    TeamMember(id=3, name="John Miller", email="john@acme.com", role="Product Designer", status="Active"),
    TeamMember(id=4, name="Rachel Green", email="rachel@acme.com", role="Head of Sales", status="Active")
]

api_keys_db: List[ApiKey] = [
    ApiKey(id=1, name="Production Zapier Webhook", key_prefix="ff_live_8392...", created_at="Aug 01, 2026")
]

@router.get("/bot", response_model=BotConfig)
def get_bot_config():
    return bot_config

@router.put("/bot", response_model=BotConfig)
def update_bot_config(data: BotConfig):
    global bot_config
    bot_config = data
    return bot_config

@router.get("/team", response_model=List[TeamMember])
def get_team_members():
    return team_members_db

class InviteMemberRequest(BaseModel):
    name: str
    email: str
    role: Optional[str] = "Member"

@router.post("/team", response_model=TeamMember)
def invite_team_member(req: InviteMemberRequest):
    new_m = TeamMember(
        id=len(team_members_db) + 1,
        name=req.name,
        email=req.email,
        role=req.role or "Member",
        status="Active"
    )
    team_members_db.append(new_m)
    return new_m

@router.get("/api-keys", response_model=List[ApiKey])
def get_api_keys():
    return api_keys_db

class CreateApiKeyRequest(BaseModel):
    name: str

@router.post("/api-keys", response_model=ApiKey)
def create_api_key(req: CreateApiKeyRequest):
    new_k = ApiKey(
        id=len(api_keys_db) + 1,
        name=req.name,
        key_prefix=f"ff_live_{len(api_keys_db)*17+1000}...",
        created_at="Just now"
    )
    api_keys_db.append(new_k)
    return new_k
