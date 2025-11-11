import { getTelegramUser } from "./telegram.js";
// api.js подключён как заглушка — в тесте не используем

const startBtn = document.getElementById("startBtn");
const goalsList = document.getElementById("goalsList");
const addGoal = document.getElementById("addGoal");
const nextBtn = document.getElementById("nextBtn");
const giftBtn = document.getElementById("giftBtn");

const tgUser = getTelegramUser();
const tgId = tgUser?.id ? String(tgUser.id) : "guest";
const TEST_MODE = true; // всегда позволяем пройти дальше

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
  startBtn.addEventListener("click", () => {
    // в тесте всегда идём дальше
    activateSlide("slide-goals");
    setTimeout(() => goalsList.querySelector(".goal-input")?.focus(), 30);
  });

  goalsList.querySelector(".goal-input").addEventListener("input", updateContinueState);
  addGoal.addEventListener("click", addGoalRow);

  nextBtn.addEventListener("click", () => {
    if (!TEST_MODE && nextBtn.disabled) return;
    if (nextBtn.disabled) return; // первая цель обязательна
    activateSlide("slide-reward");
  });

  giftBtn.addEventListener("click", () => {
    // сейчас только лёгкий фидбек; эффекты добавишь своим видео/PNG
    giftBtn.classList.add("pulse");
    setTimeout(() => giftBtn.classList.remove("pulse"), 400);
  });

  // стартуем с приветствия
  activateSlide("slide-hello");
  updateContinueState();
}

document.addEventListener("DOMContentLoaded", init);
