import { getTelegramUser } from "./telegram.js";
// api.js подключен, но в тесте мы его не используем, оставим как заглушку
// import { getStatus, markSurveyDone } from "./api.js";

const root = document.getElementById("root");
const startBtn = document.getElementById("startBtn");
const goalsList = document.getElementById("goalsList");
const addGoal = document.getElementById("addGoal");
const nextBtn = document.getElementById("nextBtn");
const giftBtn = document.getElementById("giftBtn");

const tgUser = getTelegramUser();
const tgId = tgUser?.id ? String(tgUser.id) : "guest";
// ТЕСТ-РЕЖИМ: всегда разрешаем проход дальше
const TEST_MODE = true;

let goalCount = 1;

function activateSlide(idToShow) {
  document.querySelectorAll(".slide").forEach(s => s.classList.remove("slide--active"));
  document.getElementById(idToShow).classList.add("slide--active");
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

  if (goalCount >= 3) addGoal.style.display = "none";
  li.querySelector(".goal-input").addEventListener("input", updateContinueState);
}

/* ===== Инициализация ===== */
function init() {
  // Кнопка "Начать" — всегда работает в тесте
  startBtn.addEventListener("click", async () => {
    if (!TEST_MODE) {
      // тут будет запись статуса на бэкенд
    }
    activateSlide("slide-goals");
    setTimeout(() => goalsList.querySelector(".goal-input")?.focus(), 30);
  });

  goalsList.querySelector(".goal-input").addEventListener("input", updateContinueState);
  addGoal.addEventListener("click", addGoalRow);

  nextBtn.addEventListener("click", () => {
    if (nextBtn.disabled) return;
    activateSlide("slide-reward");
  });

  // Подарок пока без эффектов — просто «кликается»
  giftBtn.addEventListener("click", () => {
    giftBtn.classList.add("pulse");
    setTimeout(() => giftBtn.classList.remove("pulse"), 400);
  });

  // Всегда стартуем со слайда приветствия в тесте
  activateSlide("slide-hello");
  updateContinueState();
}

document.addEventListener("DOMContentLoaded", init);
