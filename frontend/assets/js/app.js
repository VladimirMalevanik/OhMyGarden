import { getTelegramUser } from "./telegram.js";

const startBtn  = document.getElementById("startBtn");
const goalsList = document.getElementById("goalsList");
const addGoal   = document.getElementById("addGoal");
const nextBtn   = document.getElementById("nextBtn");
const giftBtn   = document.getElementById("giftBtn");

const slideReveal = document.getElementById("slide-reveal");
const slideScene  = document.getElementById("slide-scene");

const tgUser = getTelegramUser();
const TEST_MODE = true;

let goalCount = 1;

function activateSlide(idToShow) {
  document.querySelectorAll(".slide").forEach(s => s.classList.remove("slide--active"));
  document.getElementById(idToShow).classList.add("slide--active");
}

function firstGoalFilled() {
  const first = goalsList.querySelector(".goal-input");
  return Boolean(first && first.value.trim().length > 0);
}
function updateContinueState() {
  nextBtn.disabled = !firstGoalFilled();
}

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

function init() {
  // 1 -> 2
  startBtn.addEventListener("click", () => {
    activateSlide("slide-goals");
    setTimeout(() => goalsList.querySelector(".goal-input")?.focus(), 30);
  });

  goalsList.querySelector(".goal-input").addEventListener("input", updateContinueState);
  addGoal.addEventListener("click", addGoalRow);

  // 2 -> 3
  nextBtn.addEventListener("click", () => {
    if (nextBtn.disabled) return;
    activateSlide("slide-reward");
  });

  // 3 -> 4 (по подарку)
  giftBtn.addEventListener("click", () => {
    activateSlide("slide-reveal");
  });

  // 4 -> 5 (клик в любом месте: убираем блюр и меняем сцену)
  slideReveal.addEventListener("click", () => {
    document.body.classList.add("no-blur");     // снимаем размытие
    document.body.classList.add("scene-meadow"); // меняем фон на поляну
    activateSlide("slide-scene");
  });

  // 5 — всё кликабельно (можно потом добавить переход дальше)
  slideScene.addEventListener("click", () => {
    // место для следующего шага (например, переход в сам сад)
  });

  activateSlide("slide-hello");
  updateContinueState();
}

document.addEventListener("DOMContentLoaded", init);
