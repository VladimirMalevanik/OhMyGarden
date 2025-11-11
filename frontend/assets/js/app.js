import { getTelegramUser } from "./telegram.js";
import { getStatus, markSurveyDone } from "./api.js";

const root = document.getElementById("root");
const startBtn = document.getElementById("startBtn");

const tgUser = getTelegramUser();
const tgId = tgUser?.id ? String(tgUser.id) : "guest";
const initData = (window.Telegram?.WebApp?.initData || "");

// локальный ключ — чтоб «показывать один раз» даже без бэка
const LS_KEY = `mg:survey_done:${tgId}`;

async function shouldShowOnboarding() {
  // локальный кеш
  const cached = localStorage.getItem(LS_KEY);
  if (cached === "1") return false;

  // проверка на бэке (если задан)
  try {
    if (tgUser) {
      const status = await getStatus(tgId);
      if (status?.survey_done) {
        localStorage.setItem(LS_KEY, "1");
        return false;
      }
    }
  } catch (_) {}
  return true;
}

function goNextSlide() {
  root.classList.add("stage--next");
}

async function init() {
  const show = await shouldShowOnboarding();
  if (!show) {
    // если уже проходили — сразу на следующий слайд
    goNextSlide();
  }

  startBtn.addEventListener("click", async () => {
    // помечаем «пройдено»
    localStorage.setItem(LS_KEY, "1");
    try {
      if (tgUser) {
        await markSurveyDone(tgId, initData);
      }
    } catch (_) {}
    // плавный переход
    goNextSlide();
  });
}

document.addEventListener("DOMContentLoaded", init);
