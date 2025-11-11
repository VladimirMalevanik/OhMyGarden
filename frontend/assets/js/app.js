import { getTelegramUser } from "./telegram.js";
import { getStatus, markSurveyDone } from "./api.js";

const root = document.getElementById("root");
const startBtn = document.getElementById("startBtn");
const goalsList = document.getElementById("goalsList");
const addGoal = document.getElementById("addGoal");
const nextBtn = document.getElementById("nextBtn");

const tgUser = getTelegramUser();
const tgId = tgUser?.id ? String(tgUser.id) : "guest";
const initData = (window.Telegram?.WebApp?.initData || "");
const LS_KEY = `mg:survey_done:${tgId}`;

let goalCount = 1;

function activateSlide(idToShow) {
  document.querySelectorAll(".slide").forEach(s => s.classList.remove("slide--active"));
  document.getElementById(idToShow).classList.add("slide--active");
}

/* ===== Онбординг один раз ===== */
async function shouldShowOnboarding() {
  if (localStorage.getItem(LS_KEY) === "1") return false;
  try {
    if (tgUser) {
      const status = await getStatus(tgId);
      if (status?.survey_done) {
        localStorage.setItem(LS_KEY, "1");
        return false;
      }
    }
  } catch {}
  return true;
}

async function markDone() {
  localStorage.setItem(LS_KEY, "1");
  try {
    if (tgUser) await markSurveyDone(tgId, initData);
  } catch {}
}

/* ===== Валидация формы ===== */
function firstGoalFilled() {
  const first = goalsList.querySelector(".goal-input");
  return Boolean(first && first.value.trim().length > 0);
}
function updateContinueState() {
  nextBtn.disabled = !firstGoalFilled();
}

/* ===== Добавление полей (до 3) ===== */
function addGoalRow() {
  if (goalCount >= 3) return;
  goalCount += 1;

  const li = document.createElement("li");
  li.className = "goal-row";
  li.innerHTML = `
    <span class="num">${goalCount}.</span>
    <input class="goal-input" type="text" placeholder="Добавь цель..." maxlength="160"/>
  `;
  goalsList.appendChild(li);

  // если достигли 3 — скрыть кнопку добавления
  if (goalCount >= 3) addGoal.style.display = "none";

  // подписаться на ввод для валидации
  li.querySelector(".goal-input").addEventListener("input", updateContinueState);
}

/* ===== Инициализация ===== */
async function init() {
  // кнопка теперь точно кликабельна (ничего не перекрывает)
  startBtn.addEventListener("click", async () => {
    await markDone();
    activateSlide("slide-goals");
    // фокус на первое поле
    setTimeout(() => goalsList.querySelector(".goal-input")?.focus(), 30);
  });

  // динамика формы
  goalsList.querySelector(".goal-input").addEventListener("input", updateContinueState);
  addGoal.addEventListener("click", addGoalRow);
  nextBtn.addEventListener("click", () => {
    if (nextBtn.disabled) return;
    // здесь потом отправим цели на бэк; пока — мягкий фидбек
    nextBtn.classList.add("pulse");
    setTimeout(() => nextBtn.classList.remove("pulse"), 500);
  });

  // если онбординг уже пройден — сразу на форму
  if (!(await shouldShowOnboarding())) {
    activateSlide("slide-goals");
  }

  updateContinueState();
}

document.addEventListener("DOMContentLoaded", init);
