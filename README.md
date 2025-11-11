# MyGarden Mini App (frontend + backend)

- `frontend/` — статический сайт для GitHub Pages (Telegram Mini App UI).
- `backend/` — FastAPI + SQLite. Хостить отдельно (Render/Fly/railway/VPS).  
  URL бэка прокиньте во фронт через `window.MYGARDEN_API_BASE` в `index.html`.

Порядок:
1) Зальйте `frontend/` в отдельный репозиторий → включите GitHub Pages.
2) Задеплойте `backend/` (см. `backend/README-backend.md`), получите BASE_URL.
3) В `frontend/index.html` поменяйте `window.MYGARDEN_API_BASE` на ваш BASE_URL.
4) Откройте мини-аппу: фронт подтянет `Telegram.WebApp`, покажет онбординг один раз.
