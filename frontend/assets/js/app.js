import { getTelegramUser } from "./telegram.js";

// DOM
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

const TEST_MODE = true;

let goalCount = 1;

/* ========= навигация по слайдам ========= */
function activateSlide(idToShow){
  document.querySelectorAll(".slide").forEach(s => s.classList.remove("slide--active"));
  document.getElementById(idToShow).classList.add("slide--active");
}

/* ========= валидация формы ========= */
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

/* ========= Диалоги на сцене ========= */
const sceneSteps = [
  { text: "Это не сорняк, а росток — символ твоей дисциплины.", img: "assets/img/grandpa.png" },
  { text: "Выполняйте поставленные задачки каждый день, чтобы вырастить красивый сад", img: "assets/img/grandpa-2.png" },
  { text: "Что-то я устал, пойду вздремну...", img: "assets/img/grandpa-3.png" },
  // новый шаг: переход в сад
  { goto: "garden" }
];
let sceneIndex = 0;

function animateOnce(el, cls){
  el.classList.remove(cls);
  // reflow
  void el.offsetWidth;
  el.classList.add(cls);
}

function renderSceneStep(){
  const step = sceneSteps[sceneIndex];
  if (step.goto === "garden"){
    // плавный переход в сад
    activateSlide("slide-garden");
    document.body.classList.add("no-blur");      // на всякий
    document.body.classList.add("scene-meadow"); // тот же фон
    return;
  }
  speechBubble.textContent = step.text;
  animateOnce(speechBubble, "anim-in");

  grandpaImg.src = step.img;
  if (grandpaImg.complete) animateOnce(grandpaImg, "anim-in");
  else grandpaImg.onload = () => animateOnce(grandpaImg, "anim-in");
}

/* ========= САД: интерактивные зоны =========
   Значения в % — так удобнее масштабировать под любые экраны.
   Потом кинешь мне свои точные проценты (или JSON из dev-режима), я подставлю. */
const HOTSPOTS = [
  { id:"grandpa", label:"Садовник Витя",  rect:{left:66, top:28, width:20, height:56} },
  { id:"bed",     label:"Грядка",         rect:{left:22, top:62, width:40, height:26} },
  { id:"sprout",  label:"Какой-то росток",rect:{left:47, top:54, width:10, height:18} },
  { id:"barn",    label:"Амбар",          rect:{left:74, top:10, width:15, height:28} },
  { id:"forest",  label:"Неизведанный лес", rect:{left:0, top:8, width:100, height:32} },
];

function pct(v){ return `${v}%`; }

function buildGarden(){
  hotspotsRoot.innerHTML = "";
  HOTSPOTS.forEach(h => {
    const btn = document.createElement("button");
    btn.className = "hotspot";
    btn.dataset.id = h.id;
    btn.dataset.label = h.label;
    Object.assign(btn.style, {
      left:  pct(h.rect.left),
      top:   pct(h.rect.top),
      width: pct(h.rect.width),
      height:pct(h.rect.height)
    });
    btn.addEventListener("mouseenter", (e)=> showHint(e, h.label));
    btn.addEventListener("mousemove", (e)=> moveHint(e));
    btn.addEventListener("mouseleave", hideHint);
    btn.addEventListener("click", ()=> { /* пока ничего */ });
    hotspotsRoot.appendChild(btn);
  });
}

/* тултип */
function showHint(evt, text){
  hintEl.textContent = text;
  hintEl.hidden = false;
  moveHint(evt);
}
function moveHint(evt){
  const r = hotspotsRoot.getBoundingClientRect();
  const x = evt.clientX - r.left;
  const y = evt.clientY - r.top;
  hintEl.style.left = `${x}px`;
  hintEl.style.top  = `${y}px`;
}
function hideHint(){ hintEl.hidden = true; }

/* ========= DEV режим позиционирования =========
   Включается параметром ?dev=1
   - можно таскать и растягивать зоны
   - нажми Ctrl+C — JSON попадёт в буфер (и в консоль) */
function enableDev(){
  document.documentElement.classList.add("dev-on");
  document.body.classList.add("dev-on");
  let active = null, start = null, rectStart = null;

  hotspotsRoot.addEventListener("mousedown", (e)=>{
    const target = e.target.closest(".hotspot");
    if (!target) return;
    active = target;
    start = {x:e.clientX, y:e.clientY};
    const style = active.style;
    rectStart = {
      left: parseFloat(style.left), top: parseFloat(style.top),
      width: parseFloat(style.width), height: parseFloat(style.height)
    };
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e)=>{
    if (!active) return;
    const dx = (e.clientX - start.x) / hotspotsRoot.clientWidth * 100;
    const dy = (e.clientY - start.y) / hotspotsRoot.clientHeight * 100;
    active.style.left = pct(rectStart.left + dx);
    active.style.top  = pct(rectStart.top  + dy);
  });
  window.addEventListener("mouseup", ()=>{
    if (!active) return;
    const id = active.dataset.id;
    const hs = HOTSPOTS.find(h => h.id===id);
    hs.rect.left  = parseFloat(active.style.left);
    hs.rect.top   = parseFloat(active.style.top);
    hs.rect.width = parseFloat(active.style.width);
    hs.rect.height= parseFloat(active.style.height);
    active = null;
  });

  // Resize с Alt+drag по правому нижнему углу
  hotspotsRoot.addEventListener("mousedown", (e)=>{
    if (!e.altKey) return;
    const t = e.target.closest(".hotspot");
    if (!t) return;
    active = t; start = {x:e.clientX, y:e.clientY};
    const st = active.style;
    rectStart = {
      left: parseFloat(st.left), top: parseFloat(st.top),
      width: parseFloat(st.width), height: parseFloat(st.height)
    };
    e.preventDefault();
    window.addEventListener("mousemove", resizeMove);
  });
  function resizeMove(e){
    if (!active) return;
    const dx = (e.clientX - start.x) / hotspotsRoot.clientWidth * 100;
    const dy = (e.clientY - start.y) / hotspotsRoot.clientHeight * 100;
    active.style.width  = pct(Math.max(2, rectStart.width + dx));
    active.style.height = pct(Math.max(2, rectStart.height + dy));
  }
  window.addEventListener("mouseup", ()=>{
    window.removeEventListener("mousemove", resizeMove);
    if (!active) return;
    const id = active.dataset.id;
    const hs = HOTSPOTS.find(h => h.id===id);
    hs.rect.left  = parseFloat(active.style.left);
    hs.rect.top   = parseFloat(active.style.top);
    hs.rect.width = parseFloat(active.style.width);
    hs.rect.height= parseFloat(active.style.height);
    active = null;
  });

  // Copy JSON
  window.addEventListener("keydown", (e)=>{
    if (e.key.toLowerCase()==="c" && (e.ctrlKey||e.metaKey)){
      const json = JSON.stringify(HOTSPOTS, null, 2);
      navigator.clipboard?.writeText(json).catch(()=>{});
      console.log("HOTSPOTS JSON:\n", json);
    }
  });
}

/* ========= init ========= */
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

  // 4 -> 5 : снять блюр, показать сцену
  slideReveal.addEventListener("click", ()=>{
    document.body.classList.add("no-blur");
    document.body.classList.add("scene-meadow");
    sceneIndex = 0;
    renderSceneStep();
    activateSlide("slide-scene");
  });

  // 5: клик — следующая реплика / переход в сад
  slideScene.addEventListener("click", ()=>{
    if (sceneIndex < sceneSteps.length - 1) {
      sceneIndex += 1;
      renderSceneStep();
    } else {
      // на всякий
      activateSlide("slide-garden");
    }
  });

  // 6: сад
  buildGarden();

  // dev-режим: ?dev=1
  const params = new URLSearchParams(location.search);
  if (params.get("dev") === "1"){ enableDev(); }

  activateSlide("slide-hello");
  updateContinueState();
}

document.addEventListener("DOMContentLoaded", init);
