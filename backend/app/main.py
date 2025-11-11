from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import Base, engine, get_db
from .models import User
from .schemas import StatusOut, RegisterIn
from .verify import check_init_data
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MyGarden API", version="0.1.0")

origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/user/{tg_id}/status", response_model=StatusOut)
def status(tg_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.tg_id == tg_id).first()
    if not user:
        return {"tg_id": tg_id, "survey_done": False}
    return {"tg_id": tg_id, "survey_done": user.survey_done}

@app.post("/register", response_model=StatusOut)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    # в проде требуем корректный init_data
    if not check_init_data(payload.init_data or ""):
        raise HTTPException(status_code=400, detail="invalid init_data")

    user = db.query(User).filter(User.tg_id == payload.tg_id).first()
    if not user:
        user = User(tg_id=payload.tg_id, survey_done=bool(payload.survey_done))
        db.add(user)
    else:
        user.survey_done = bool(payload.survey_done)
    db.commit()
    db.refresh(user)
    return {"tg_id": user.tg_id, "survey_done": user.survey_done}
