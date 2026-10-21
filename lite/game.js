"use strict";
const Engine=globalThis.HeliosVenus;
const $=id=>document.getElementById(id);
const labels={credits:"бюджет",science:"наука",energy:"энергия",supplies:"снабжение"};
let stored=null;
try{stored=localStorage.getItem("helios-venus-v4");}catch{}
let game=Engine.restore(stored)||Engine.create();
let feedback="";
function listCost(cost){return Object.entries(cost).map(([k,v])=>v+" "+labels[k]).join(" · ");}
function change(command){
  const result=Engine.apply(game,command);
  if(result.error){feedback=result.error;}else{game=result.state;feedback="Операция выполнена.";}
  render();
}
function clear(n){n.replaceChildren();}
function element(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;}
function makeButton(label,callback,disabled=false,cls=""){const b=element("button",cls,label);b.type="button";b.disabled=disabled;b.addEventListener("click",callback);return b;}
function drawZones(){
 const root=$("layers");clear(root);
 for(const z of Engine.ZONES){
  const btn=element("button","layer"+(game.selected===z.id?" active":""));
  const info=element("span");info.append(element("strong","",z.name),element("small","",z.alt));
  const progress=element("b","",Engine.PROJECTS.filter(p=>p.zone===z.id&&Engine.has(game,p.id)).length+"/"+Engine.PROJECTS.filter(p=>p.zone===z.id).length);
  btn.append(info,progress);btn.addEventListener("click",()=>change({type:"select",id:z.id}));root.append(btn);
 }
}
function drawProjects(){
 const root=$("projects");clear(root);
 for(const project of Engine.PROJECTS.filter(p=>p.zone===game.selected)){
  const card=element("div","project");
  card.append(element("h4","",project.name),element("p","",project.description),element("small","",listCost(project.cost)));
  const done=Engine.has(game,project.id);
  const missing=project.requires.filter(x=>!Engine.has(game,x));
  const label=done?"Завершено":missing.length?"Нужно: "+missing.map(x=>Engine.PROJECTS.find(p=>p.id===x)?.name||x).join(", "):"Реализовать";
  card.append(makeButton(label,()=>change({type:"build",id:project.id}),!Engine.canBuild(game,project.id)));
  root.append(card);
 }
 if(game.selected==="orbit"&&Engine.has(game,"logistics")){
  const card=element("div","project");
  card.append(element("h4","","Отправить снабжение с Земли"),element("p","","22 единицы через два хода. Перевозка стоит 16 бюджета и 3 энергии."));
  card.append(makeButton("Заказать груз",()=>change({type:"shipment"}),game.credits<16||game.energy<3||game.finished));root.append(card);
 }
 if(game.selected==="clouds"&&Engine.has(game,"aerostat")){
  const card=element("div","project");
  card.append(element("h4","","Обслуживание аэростата"),element("p","","Состояние "+game.condition+"%. Ремонт: 12 бюджета и 7 снабжения (+35%)."));
  card.append(makeButton("Провести ремонт",()=>change({type:"repair"}),game.condition>=100||game.credits<12||game.supplies<7||game.finished));root.append(card);
 }
}
function drawStory(){
 const title=$("chapter-title"),copy=$("chapter-copy"),actions=$("story-actions");clear(actions);
 if(game.finished){
  title.textContent="Облака стали домом";
  copy.textContent="Три года непрерывных исследований доказали, что длительное присутствие на Венере возможно. Это начало истории, а не конец колонизации.";
  actions.append(element("p","subtle","Прототип первой кампании завершён."));
 }else if(game.mode==="session"){
  title.textContent="Свободная венерианская сессия";
  copy.textContent="Задача: построить облачную лабораторию и обеспечить три года устойчивой работы платформы. Снабжение доставляется с Земли по открытому маршруту.";
  actions.append(element("p","subtle","История не ограничивает строительство, но инженерные требования сохраняются."));
 }else if(game.storyStep===0){
  title.textContent="Досье, которого не существовало";
  copy.textContent="Молодой российский инженер достаёт забытый закрытый советский архив. Его считают одержимым, а план возродить Венеру — невозможным. В России нужно найти тех, кто даст идее шанс.";
  actions.append(makeButton("Вынести расчёты на научный совет",()=>change({type:"council"}),false,"choice"));
 }else if(game.storyStep===1){
  title.textContent="Слишком смелый проект";
  copy.textContent="Одного красноречия недостаточно. Продемонстрируйте атмосферный зонд и орбитальную связь. Только после этого внешние агентства и промышленность готовы обсуждать участие.";
  const enabled=Engine.has(game,"probe")&&Engine.has(game,"relay");
  actions.append(makeButton(enabled?"Открыть международную программу":"Сначала нужны зонд и ретранслятор",()=>change({type:"treaty"}),!enabled,"choice"));
 }else{
  title.textContent="Венера становится общей";
  copy.textContent="Россия начинает программу, но эксплуатация Венеры требует кооперации исследователей и промышленности разных стран. Следующая цель: облачная лаборатория и три года надёжной работы.";
  actions.append(element("p","subtle","Международное соглашение действует. +9 бюджета каждый год."));
 }
}
function render(){
 const zone=Engine.ZONES.find(z=>z.id===game.selected);
 $("year").textContent=game.year;$("credits").textContent=game.credits;$("science").textContent=game.science;
 $("power").textContent=game.energy;$("supplies").textContent=game.supplies;
 $("sector-name").textContent=zone.name;$("sector-copy").textContent=zone.description;
 $("sector-status").textContent="Риски: "+zone.hazard;
 $("hazard").textContent=Engine.has(game,"aerostat")?"АЭРОСТАТ "+game.condition+"%":"НЕ ОЦЕНЕНЫ";
 $("turn").textContent="ХОД "+game.turn;
 $("campaign").classList.toggle("selected",game.mode==="campaign");
 $("session").classList.toggle("selected",game.mode==="session");
 $("next").disabled=game.finished;
 $("next").querySelector("span").textContent=game.finished?"✓":"→";
 drawZones();drawProjects();drawStory();
 $("events").replaceChildren(...game.log.slice(0,9).map(x=>element("div","",x)));
 $("message").textContent=feedback;
}
function switchMode(mode){
 if(game.mode===mode)return;
 if(!confirm("Начать новую "+(mode==="campaign"?"кампанию":"сессию")+"? Текущий прогресс будет потерян."))return;
 game=Engine.create(mode);feedback="Начата новая игра.";render();
}
$("next").addEventListener("click",()=>change({type:"next"}));
$("campaign").addEventListener("click",()=>switchMode("campaign"));
$("session").addEventListener("click",()=>switchMode("session"));
$("save").addEventListener("click",()=>{try{localStorage.setItem("helios-venus-v4",JSON.stringify(game));feedback="Прогресс сохранён на этом устройстве.";}catch{feedback="Браузер не разрешил сохранить игру.";}render();});
$("reset").addEventListener("click",()=>{if(!confirm("Сбросить текущую игру?"))return;game=Engine.create(game.mode);feedback="Начата новая игра.";render();});
render();
