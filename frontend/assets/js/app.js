import { getTelegramUser } from "./telegram.js";

const startBtn   = document.getElementById("startBtn");
const goalsList  = document.getElementById("goalsList");
const addGoal    = document.getElementById("addGoal");
const nextBtn    = document.getElementById("nextBtn");
const giftBtn    = document.getElementById("giftBtn");

const slideReveal = document.getElementById("slide-reveal");
const slideScene  = document.getElementById("slide-scene");
const grandpaImg  = document.getElementById("grandpaImg");
const speechBubble= document.getElementById("speechBubble");

const TEST_MODE = true;

let goalCount = 1;

function activateSlide(idToShow){
  document.querySelectorAll(".slide").forEach(s => s.classList.remove("slide--active"));
  document.getElementById(idToShow).classList.add("slide--active");
}

/* ===== форма ===== */
function firstGoalFilled(){
  const first = goalsList.querySelector(".goal-input");
  return Boolean(first && first.value.trim().length>0);
}
function updateContinueState(){ nextBtn.disabled = !firstGoalFilled(); }

function addGoalRow(){
  if (goalCount >= 3) return;
  goalCount += 1;
  const li = document.createElement("li");
  li.className = "goal-row";
  li.innerHTML = `<span class="num">${goalCount}.</span>
                  <input class="goal-input" type="text" placeholder="Добавь цель..." maxlength="160"/>`;
  goalsList.appendChild(li);
  if (goalCount >= 3) addGoal.style.display = "none";
  li.querySelector(".goal-input").addEventListener("input", updateContinueState);
}

/* ===== Диалоги на сцене ===== */
const sceneSteps = [
  {
    text: "Это не сорняк, а росток — символ твоей дисциплины.",
    img:  "assets/img/grandpa.png"
  },
  {
    text: "Выполняйте поставленные задачки каждый день, чтобы вырастить красивый сад",
    img:  "assets/img/grandpa-2.png"
  },
  {
    text: "Что-то я устал, пойду вздремну...",
    img:  "assets/img/grandpa-3.png"
  }
];
let sceneIndex = 0;

function renderSceneStep(){
  const step = sceneSteps[sceneIndex];
  speechBubble.textContent = step.text;
  grandpaImg.src = step.img;
}

/* ===== init ===== */
function init(){
  // 1 -> 2
  startBtn.addEventListener("click", ()=>{
    activateSlide("slide-goals");
    setTimeout(()=>goalsList.querySelector(".goal-input")?.focus(), 30);
  });

  goalsList.querySelector(".goal-input").addEventListener("input", updateContinueState);
  addGoal.addEventListener("click", addGoalRow);

  // 2 -> 3
  nextBtn.addEventListener("click", ()=>{
    if (nextBtn.disabled) return;
    activateSlide("slide-reward");
  });

  // 3 -> 4
  giftBtn.addEventListener("click", ()=>{
    activateSlide("slide-reveal");
  });

  // 4 -> 5 : снять блюр, сменить фон, показать сцену
  slideReveal.addEventListener("click", ()=>{
    document.body.classList.add("no-blur");
    document.body.classList.add("scene-meadow");
    sceneIndex = 0;
    renderSceneStep();
    activateSlide("slide-scene");
  });

  // 5: клик — следующий шаг диалога/поза деда
  slideScene.addEventListener("click", ()=>{
    sceneIndex = Math.min(sceneIndex + 1, sceneSteps.length - 1);
    renderSceneStep();
  });

  // старт
  activateSlide("slide-hello");
  updateContinueState();
}

document.addEventListener("DOMContentLoaded", init);
