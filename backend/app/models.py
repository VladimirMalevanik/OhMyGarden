from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Boolean
from .database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    tg_id: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    survey_done: Mapped[bool] = mapped_column(Boolean, default=False)
