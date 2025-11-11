from pydantic import BaseModel, Field

class StatusOut(BaseModel):
    tg_id: str
    survey_done: bool

class RegisterIn(BaseModel):
    tg_id: str = Field(min_length=1)
    init_data: str | None = None
    survey_done: bool = True
