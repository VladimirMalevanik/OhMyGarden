# Backend (FastAPI + SQLite)

## Локальный запуск
python -m venv .venv
. .venv/bin/activate  # (Windows: .venv\Scripts\activate)
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

## Переменные окружения (.env)
BOT_TOKEN=123456:ABC...   # токен вашего Telegram-бота (для проверки initData)
ALLOWED_ORIGINS=*         # при желании ограничьте домен фронта

## Деплой
- Render/railway/fly: укажите команду запуска:
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
- Не забудьте переменные окружения.

## Эндпоинты
GET  /health                     -> {"ok":true}
GET  /user/{tg_id}/status        -> {"tg_id": "...", "survey_done": bool}
POST /register {tg_id, init_data, survey_done}
                                 -> создает/обновляет пользователя и помечает онбординг

Проверка подписи Telegram WebApp initData включена (см. app/verify.py).
