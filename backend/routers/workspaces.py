from typing import List
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/workspaces", tags=["Workspaces"])

class WorkspaceItem(BaseModel):
    id: int
    name: str
    members_count: int
    plan: str
    active: bool

workspaces_db: List[WorkspaceItem] = [
    WorkspaceItem(id=1, name="Acme Product Workspace", members_count=12, plan="Enterprise Pro", active=True),
    WorkspaceItem(id=2, name="Growth & Enterprise Sales", members_count=8, plan="Business", active=False),
    WorkspaceItem(id=3, name="Engineering Core Team", members_count=24, plan="Enterprise Pro", active=False)
]

class CreateWorkspaceRequest(BaseModel):
    name: str

@router.get("", response_model=List[WorkspaceItem])
def get_workspaces():
    return workspaces_db

@router.post("", response_model=WorkspaceItem)
def create_workspace(req: CreateWorkspaceRequest):
    new_ws = WorkspaceItem(
        id=len(workspaces_db) + 1,
        name=req.name,
        members_count=1,
        plan="Enterprise Pro",
        active=False
    )
    workspaces_db.append(new_ws)
    return new_ws

@router.put("/{workspace_id}/activate")
def activate_workspace(workspace_id: int):
    for ws in workspaces_db:
        ws.active = (ws.id == workspace_id)
    return [ws for ws in workspaces_db if ws.active][0]
