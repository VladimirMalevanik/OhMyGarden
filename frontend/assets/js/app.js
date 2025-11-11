import { getTelegramUser } from "./telegram.js";

/* DOM */
const startBtn    = document.getElementById("startBtn");
const goalsList   = document.getElementById("goalsList");
const addGoal     = document.getElementById("addGoal");
const nextBtn     = document.getElementById("nextBtn");
const giftBtn     = document.getElementById("giftBtn");

const slideReveal = document.getElementById("slide-reveal");
const slideScene  = document.getElementById("slide-scene");
const slideGarden = document.getElementById("slide-garden");

const grandpaImg   = document.getElementById("grandpaImg");
const speechBubble = document.getElementById("speechBubble");

const hotspotsRoot = document.getElementById("hotspots");
const hintEl       = document.getElementById("hint");
const gridCanvas   = document.getElementById("grid");

let goalCount = 1;

/* Навигация */
function activateSlide(id){
  document.querySelectorAll(".slide").forEach(s => s.classList.remove("slide--active"));
  document.getElementById(id).classList.add("slide--active");
}

/* Форма */
function firstGoalFilled(){
  const first = goalsList.querySelector(".goal-input");
  return Boolean(first && first.value.trim().length>0);
}
function updateContinueState(){ nextBtn.disabled = !firstGoalFilled(); }
function addGoalRow(){
  if (goalCount >= 3) return;
  goalCount++;
  const li = document.createElement("li");
  li.className = "goal-row";
  li.innerHTML = `<span class="num">${goalCount}.</span><input class="goal-input" type="text" placeholder="Добавь цель..." maxlength="160"/>`;
  goalsList.appendChild(li);
  if (goalCount >= 3) addGoal.style.display = "none";
  li.querySelector(".goal-input").addEventListener("input", updateContinueState);
}

/* Диалог */
const sceneSteps = [
  { text:"Это не сорняк, а росток — символ твоей дисциплины.", img:"assets/img/grandpa.png" },
  { text:"Выполняйте поставленные задачки каждый день, чтобы вырастить красивый сад", img:"assets/img/grandpa-2.png" },
  { text:"Что-то я устал, пойду вздремну...", img:"assets/img/grandpa-3.png" },
  { goto:"garden" }
];
let sceneIndex = 0;

function animateOnce(el, cls){
  el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
}
function renderSceneStep(){
  const step = sceneSteps[sceneIndex];
  if (step.goto === "garden"){
    // переключаем фон и сцену сада
    document.body.classList.add("no-blur");
    document.body.classList.add("scene-meadow"); // для совместимости, фон сада отдельно
    activateSlide("slide-garden");
    return;
  }
  speechBubble.textContent = step.text;
  animateOnce(speechBubble, "anim-in");
  grandpaImg.src = step.img;
  if (grandpaImg.complete) animateOnce(grandpaImg, "anim-in");
  else grandpaImg.onload = ()=>animateOnce(grandpaImg, "anim-in");
}

/* ===== САД ===== */

/* Сетка 12×12 — включается/выключается клавишей G */
function drawGrid(){
  const ctx = gridCanvas.getContext("2d");
  const w = gridCanvas.width = gridCanvas.clientWidth;
  const h = gridCanvas.height = gridCanvas.clientHeight;
  ctx.clearRect(0,0,w,h);
  const cols = 12, rows = 12;
  ctx.strokeStyle = "white"; ctx.lineWidth = 1;
  ctx.font = "12px ui-rounded, system-ui"; ctx.fillStyle = "white";
  for(let c=1;c<cols;c++){
    const x = Math.round(w*c/cols);
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke();
  }
  for(let r=1;r<rows;r++){
    const y = Math.round(h*r/rows);
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
  }
  // подписи
  for(let c=0;c<cols;c++){
    ctx.fillText(String(c+1), Math.round(w*(c+0.5)/cols)-3, 14);
  }
  for(let r=0;r<rows;r++){
    ctx.fillText(String(r+1), 4, Math.round(h*(r+0.5)/rows)+4);
  }
}
function toggleGrid(){
  gridCanvas.hidden = !gridCanvas.hidden;
  if (!gridCanvas.hidden) drawGrid();
}
window.addEventListener("resize", ()=>{ if (!gridCanvas.hidden) drawGrid(); });
window.addEventListener("keydown", (e)=>{ if (e.key.toLowerCase()==="g") toggleGrid(); });

/* Подсказки и клики */
function showHint(evt, text){
  hintEl.textContent = text; hintEl.hidden = false; moveHint(evt);
}
function moveHint(evt){
  const r = hotspotsRoot.getBoundingClientRect();
  hintEl.style.left = `${evt.clientX - r.left}px`;
  hintEl.style.top  = `${evt.clientY - r.top}px`;
}
function hideHint(){ hintEl.hidden = true; }

/* ВРЕМЕННЫЕ зоны (пример). После того как ты пришлёшь мне диапозоны клеток — заменю. */
const HOTSPOTS = [
  { id:"grandpa", label:"Садовник Витя",   rect:{ left:66, top:28, width:20, height:56 } },
  { id:"bed",     label:"Грядка",          rect:{ left:22, top:62, width:40, height:26 } },
  { id:"sprout",  label:"Какой-то росток", rect:{ left:47, top:54, width:10, height:18 } },
  { id:"barn",    label:"Амбар",           rect:{ left:74, top:10, width:15, height:28 } },
  { id:"forest",  label:"Неизведанный лес",rect:{ left:0,  top:8,  width:100,height:32 } },
];

function pct(v){ return `${v}%`; }
function buildGarden(){
  hotspotsRoot.innerHTML = "";
  HOTSPOTS.forEach(h=>{
    const el = document.createElement("button");
    el.className = "hotspot";
    el.style.left   = pct(h.rect.left);
    el.style.top    = pct(h.rect.top);
    el.style.width  = pct(h.rect.width);
    el.style.height = pct(h.rect.height);
    el.dataset.id    = h.id;
    el.dataset.label = h.label;
    el.addEventListener("mouseenter",(e)=>showHint(e,h.label));
    el.addEventListener("mousemove", moveHint);
    el.addEventListener("mouseleave", hideHint);
    el.addEventListener("click", ()=>{ /* пока пусто */ });
    hotspotsRoot.appendChild(el);
  });
}

/* Инициализация */
function init(){
  // приветствие -> цели
  startBtn.addEventListener("click", ()=>{
    activateSlide("slide-goals");
    setTimeout(()=>goalsList.querySelector(".goal-input")?.focus(), 30);
  });
  goalsList.querySelector(".goal-input").addEventListener("input", updateContinueState);
  addGoal.addEventListener("click", addGoalRow);

  // цели -> подарок
  nextBtn.addEventListener("click", ()=>{
    if (nextBtn.disabled) return;
    activateSlide("slide-reward");
  });

  // подарок -> раскрытие
  giftBtn.addEventListener("click", ()=> activateSlide("slide-reveal"));

  // раскрытие -> диалог
  slideReveal.addEventListener("click", ()=>{
    document.body.classList.add("no-blur");
    document.body.classList.add("scene-meadow");
    sceneIndex = 0; renderSceneStep();
    activateSlide("slide-scene");
  });

  // диалог: следующий шаг или переход в сад
  slideScene.addEventListener("click", ()=>{
    if (sceneIndex < sceneSteps.length - 1) { sceneIndex++; renderSceneStep(); }
    else { activateSlide("slide-garden"); }
  });

  // сад
  buildGarden();

  activateSlide("slide-hello");
  updateContinueState();
}
document.addEventListener("DOMContentLoaded", init);
