/* ========= КОНФИГ =========
   Все координаты — для арт-фона 1536×1024.
   Ты можешь прислать (или сам подставить) точные пиксели x1,y1,x2,y2 — я уже написал конвертер.
*/
const BASE = { w:1536, h:1024 };

/* --- САД --- (пока стоят аккуратные значения по твоим мокапам) */
const GARDEN_RECTS = {
  barn:    { x1: 1000, y1: 140, x2: 1420, y2: 560 }, // Амбар (пример)
  bed:     { x1:  190, y1: 640, x2:  742, y2: 964 }, // Грядка
  sprout:  { x1:  520, y1: 520, x2:  703, y2: 703 }, // Росток
  forest:  { x1:    0, y1:  70, x2: 1536, y2: 360 }, // Лес (верх)
  grandpa: { x1: 1105, y1: 350, x2: 1410, y2: 980 }, // Садовник Витя (в саду)
};

/* --- ДИАЛОГ --- (три картинки деда; фон meadow-scene.jpg) */
const DIALOG_RECTS = {
  // 1-я реплика (grandpa.png)
  grandpa:   { x1:  880, y1:  80, x2: 1500, y2: 990 }, // 646×969 на правой стороне
  // 2-я реплика (grandpa-2.png)
  grandpa2:  { x1:  900, y1: 110, x2: 1447, y2: 931 }, // 547×821
  // 3-я реплика (grandpa-3.png)
  grandpa3:  { x1:  880, y1: 130, x2: 1440, y2: 970 }, // 560×840
};

/* ========= УТИЛИТЫ ========= */
function rectPxToPct({x1,y1,x2,y2}){
  const left   = (x1/BASE.w)*100;
  const top    = (y1/BASE.h)*100;
  const width  = ((x2-x1)/BASE.w)*100;
  const height = ((y2-y1)/BASE.h)*100;
  return { left, top, width, height };
}
function applyRectPercent(el, r){
  el.style.left   = r.left.toFixed(3) + "%";
  el.style.top    = r.top.toFixed(3) + "%";
  el.style.width  = r.width.toFixed(3) + "%";
  el.style.height = r.height.toFixed(3) + "%";
  el.style.objectFit = "contain";
}

/* ========= DOM ========= */
const startBtn     = document.getElementById("startBtn");
const goalsList    = document.getElementById("goalsList");
const addGoal      = document.getElementById("addGoal");
const nextBtn      = document.getElementById("nextBtn");
const giftBtn      = document.getElementById("giftBtn");

const slideReveal  = document.getElementById("slide-reveal");
const slideScene   = document.getElementById("slide-scene");
const slideGarden  = document.getElementById("slide-garden");

const grandpaImg   = document.getElementById("grandpaImg");
const speechBubble = document.getElementById("speechBubble");

const hotspotsRoot = document.getElementById("hotspots");
const hintEl       = document.getElementById("hint");

/* ========= СЛАЙДЫ ========= */
function activateSlide(id){
  document.querySelectorAll(".slide").forEach(s => s.classList.remove("slide--active"));
  document.getElementById(id).classList.add("slide--active");
}

/* ========= ФОРМА ЦЕЛЕЙ ========= */
let goalCount = 1;
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
  li.innerHTML = `<span class="num">${goalCount}.</span>
                  <input class="goal-input" type="text" placeholder="Добавь цель..." maxlength="160"/>`;
  goalsList.appendChild(li);
  if (goalCount >= 3) addGoal.style.display = "none";
  li.querySelector(".goal-input").addEventListener("input", updateContinueState);
}

/* ========= ДИАЛОГ ========= */
const sceneSteps = [
  { text:"Это не сорняк, а росток — символ твоей дисциплины.", img:"assets/img/grandpa.png",   rect:rectPxToPct(DIALOG_RECTS.grandpa)  },
  { text:"Выполняйте поставленные задачки каждый день, чтобы вырастить красивый сад",           img:"assets/img/grandpa-2.png", rect:rectPxToPct(DIALOG_RECTS.grandpa2) },
  { text:"Что-то я устал, пойду вздремну...",                                                     img:"assets/img/grandpa-3.png", rect:rectPxToPct(DIALOG_RECTS.grandpa3) },
  { goto:"garden" },
];
let sceneIndex = 0;

function animateOnce(el, cls){ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
function renderSceneStep(){
  const step = sceneSteps[sceneIndex];
  if (step.goto === "garden"){
    document.body.classList.add("no-blur");
    activateSlide("slide-garden");
    return;
  }
  // позиция и размер деда по процентах (из пикселей)
  grandpaImg.style.position = "absolute";
  applyRectPercent(grandpaImg, step.rect);
  grandpaImg.src = step.img;

  // анимации
  if (grandpaImg.complete) animateOnce(grandpaImg, "anim-in");
  else grandpaImg.onload = () => animateOnce(grandpaImg, "anim-in");
  animateOnce(speechBubble, "anim-in");

  speechBubble.textContent = step.text;
}

/* ========= САД ========= */
function buildGarden(){
  const map = [
    { id:"barn",    label:"Амбар",            rect:rectPxToPct(GARDEN_RECTS.barn)    },
    { id:"bed",     label:"Грядка",           rect:rectPxToPct(GARDEN_RECTS.bed)     },
    { id:"sprout",  label:"Какой-то росток",  rect:rectPxToPct(GARDEN_RECTS.sprout)  },
    { id:"forest",  label:"Неизведанный лес", rect:rectPxToPct(GARDEN_RECTS.forest)  },
    { id:"grandpa", label:"Садовник Витя",    rect:rectPxToPct(GARDEN_RECTS.grandpa) },
  ];

  hotspotsRoot.innerHTML = "";
  map.forEach(h=>{
    const el = document.createElement("button");
    el.className = "hotspot";
    applyRectPercent(el, h.rect);
    el.addEventListener("mouseenter",(e)=>{ hintEl.textContent=h.label; hintEl.hidden=false; moveHint(e); });
    el.addEventListener("mousemove", moveHint);
    el.addEventListener("mouseleave", ()=>{ hintEl.hidden=true; });
    el.addEventListener("click", ()=>{ /* placeholder */ });
    hotspotsRoot.appendChild(el);
  });
}
function moveHint(evt){
  const r = hotspotsRoot.getBoundingClientRect();
  hintEl.style.left = `${evt.clientX - r.left}px`;
  hintEl.style.top  = `${evt.clientY - r.top}px`;
}

/* ========= INIT ========= */
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
    sceneIndex = 0;
    renderSceneStep();
    activateSlide("slide-scene");
  });

  // клики по сцене — следующая реплика
  slideScene.addEventListener("click", ()=>{
    if (sceneIndex < sceneSteps.length - 1){ sceneIndex++; renderSceneStep(); }
    else { activateSlide("slide-garden"); }
  });

  // сад
  buildGarden();

  // старт
  activateSlide("slide-hello");
  updateContinueState();
}
document.addEventListener("DOMContentLoaded", init);
