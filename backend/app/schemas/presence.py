from pydantic import BaseModel, Field


class HeartbeatRequest(BaseModel):
    client_id: str = Field(min_length=1, max_length=64)
