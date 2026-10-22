"use strict";
const Engine=globalThis.HeliosVenus;
const $=id=>document.getElementById(id);
const labels={credits:"бюджет",science:"наука",energy:"энергия",supplies:"снабжение"};
let stored=null;
try{stored=localStorage.getItem("helios-venus-v4");}catch{}
let game=Engine.restore(stored)||Engine.create();
let feedback="";
function persist(){try{localStorage.setItem("helios-venus-v4",JSON.stringify(game));return true;}catch{return false;}}
function listCost(cost){return Object.entries(cost).map(([k,v])=>v+" "+labels[k]).join(" · ");}
function change(command){
  const result=Engine.apply(game,command);
  if(result.error){feedback=result.error;}else{game=result.state;feedback="Операция выполнена.";persist();}
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
  card.append(element("h4","","Отправить снабжение с Земли"),element("p","","22 единицы через два игровых хода. Перевозка стоит 16 бюджета и 3 энергии."));
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
  if(game.outcome==="failure"){
   title.textContent="Венера не прощает ошибок";
   copy.textContent="Аэростат остался без ремонта на два года. Платформа разрушена, финансирование программы остановлено. Экспедицию придётся начинать заново, учитывая снабжение, энергию и технический резерв.";
  }else{
   title.textContent="Облака стали домом";
   copy.textContent="Три года непрерывных исследований доказали, что длительное присутствие на Венере возможно. Это начало истории, а не конец колонизации.";
  }
  actions.append(element("p","subtle","Итог: "+(game.outcome==="failure"?"миссия сорвана":"экспедиция завершена")+" · оценка "+Engine.score(game)+" · новая игра доступна сверху."));
 }else if(game.mode==="session"){
  title.textContent="Свободная венерианская сессия";
  copy.textContent="Режим: "+Engine.SESSION_PRESETS[game.preset||"standard"].name+". Постройте облачную лабораторию и обеспечьте три года устойчивой работы. Снабжение доставляется с Земли.";
  actions.append(element("p","subtle","История не ограничивает строительство, но инженерные требования сохраняются."));
 }else if(game.storyStep===0){
  title.textContent="Досье, которого не существовало";
  copy.textContent="Молодой российский инженер достаёт забытый закрытый советский архив. Его считают одержимым, а план возродить Венеру — невозможным. В России нужно найти тех, кто даст идее шанс.";
  actions.append(makeButton("Вынести расчёты на научный совет",()=>change({type:"council"}),false,"choice"));
 }else if(game.storyStep===1){
  title.textContent="Кто заплатит за мечту?";
  if(game.funding===null){
    copy.textContent="После слушаний в России предстоит выбрать источник финансирования. Открытая наука ускоряет исследования и международные переговоры. Частный капитал даёт быстрый бюджет, но ограничивает доступ к результатам.";
    actions.append(makeButton("Открытая государственная программа · −8 бюджета, +12 науки",()=>change({type:"funding",id:"public"}),game.credits<8,"choice"));
    actions.append(makeButton("Частные инвесторы · +36 бюджета, −6 науки",()=>change({type:"funding",id:"private"}),false,"choice"));
  }else{
    copy.textContent="Выбран путь: "+(game.funding==="public"?"открытая научная программа":"частное финансирование")+". Нужно доказать осуществимость: зонд и ретранслятор. Международные партнёры потребуют подтверждённые данные.";
    const enabled=Engine.has(game,"probe")&&Engine.has(game,"relay");
    actions.append(makeButton(enabled?"Открыть международную программу":"Сначала нужны зонд и ретранслятор",()=>change({type:"treaty"}),!enabled,"choice"));
  }
 }else{
  title.textContent="Венера становится общей";
  copy.textContent="Россия начинает программу, но эксплуатация Венеры требует кооперации исследователей и промышленности разных стран. Следующая цель: облачная лаборатория и три года надёжной работы.";
  actions.append(element("p","subtle","Международное соглашение действует. +9 бюджета каждый год."));
 }
}
function nextObjective(){
 if(game.finished)return {title:game.outcome==="failure"?"Миссия сорвана":"Первая экспедиция завершена",description:"Откройте новую партию, чтобы попробовать другой путь.",zone:null};
 if(game.mode==="campaign"&&game.storyStep===0)return {title:"Доказать возможность проекта",description:"Вынесите расчёты на российский научный совет.",zone:null};
 if(game.mode==="campaign"&&game.storyStep===1&&game.funding===null)return {title:"Выбрать финансирование",description:"Государственная открытая наука или частные инвесторы — решение повлияет на международные переговоры.",zone:null};
 const required=[
 ["archive","Изучить секретный архив","Восстановите исходные советские расчёты."],
 ["probe","Отправить атмосферный зонд","Найдите рабочие условия в облачном слое."],
 ["relay","Создать орбитальную связь","Без ретранслятора постоянная станция не получает надёжную связь."]
 ];
 for(const [id,title,description] of required){
  if(!Engine.has(game,id))return {title,description,zone:Engine.PROJECTS.find(p=>p.id===id).zone};
 }
 if(game.mode==="campaign"&&game.storyStep===1)return {title:"Открыть международную программу",description:"Покажите результаты исследований партнёрам и согласуйте совместную миссию.",zone:null};
 const expansion=[
  ["aerostat","Развернуть первый аэростат","Проверьте научный демонстратор в облаках Венеры."],
  ["logistics","Организовать грузовые рейсы","Грузы с Земли приходят через два игровых хода (пока без реальной баллистики)."],
  ["lab","Построить облачную лабораторию","Научная станция должна работать несмотря на износ."]
 ];
 for(const [id,title,description] of expansion){
  if(!Engine.has(game,id))return {title,description,zone:Engine.PROJECTS.find(p=>p.id===id).zone};
 }
 if(game.condition<60)return {title:"Восстановить платформу",description:"Состояние аэростата ниже 60%: проведите ремонт.",zone:"clouds"};
 if(game.supplies<8)return {title:"Заказать снабжение",description:"Резерв расходников истощается. Отправьте груз с Земли до следующей аварии.",zone:"orbit"};
 return {title:"Обеспечить три года устойчивой работы",description:"Успешных лет: "+game.consecutiveYears+" из 3. Контролируйте состояние, энергию и расходники.",zone:null};
}
function drawObjective(){
 const goal=nextObjective();
 $("objective-title").textContent=goal.title;
 $("objective-copy").textContent=goal.description;
 $("focus-goal").textContent=goal.zone?"Перейти к сектору →":"Перейти к решению ↓";
 $("focus-goal").disabled=game.finished;
}

function signed(value){
 return (value>0?"+":"")+value;
}
function drawOperations(){
 const forecast=Engine.forecast(game);
 const built=Engine.has(game,"aerostat");
 const shipments=(game.shipments||[]).slice().sort((a,b)=>a.arrival-b.arrival);
 $("condition").textContent=built?game.condition+"% / "+(game.condition>=60?"Штатно":game.condition>0?"Требует ремонта":"Авария"):"Не построен";
 $("condition-bar").style.width=built?game.condition+"%":"0%";
 $("shipment-status").textContent=shipments.length?
   shipments.length+" рейс(ов) · ближайший: "+shipments[0].arrival+" ход":"Груза в пути нет";
 $("forecast-year").textContent=forecast.nextYear;
 $("forecast-credits").textContent=signed(forecast.credits);
 $("forecast-science").textContent=signed(forecast.science);
 $("forecast-energy").textContent=signed(forecast.energy);
 $("forecast-supplies").textContent=signed(forecast.supplies);
 $("forecast-alert").textContent=forecast.shortage?"ДЕФИЦИТ: энергии или расходников не хватит. Аэростат потеряет до 22% состояния без учёта шторма.":"";
 $("visual-probe").classList.toggle("active",Engine.has(game,"probe"));
 $("visual-relay").classList.toggle("active",Engine.has(game,"relay"));
 $("visual-aerostat").classList.toggle("active",built);
 $("visual-aerostat").classList.toggle("damaged",built&&game.condition<45);
 $("visual-lab").classList.toggle("active",Engine.has(game,"lab"));
 let stage="ПОДГОТОВКА",caption="Сначала восстановите архив, затем отправьте атмосферный зонд.";
 if(Engine.has(game,"probe")){stage="ИССЛЕДОВАНИЯ";caption="Зонд начал изучать химическую и динамическую среду Венеры.";}
 if(Engine.has(game,"aerostat")){stage="АЭРОСТАТ";caption="Первый аппарат закрепился в облачном слое. Следите за состоянием и снабжением.";}
 if(Engine.has(game,"lab")){stage="ЛАБОРАТОРИЯ";caption="Исследовательская станция действует: "+game.consecutiveYears+"/3 устойчивых лет.";}
 if(game.finished){stage=game.outcome==="victory"?"МИССИЯ ВЫПОЛНЕНА":"МИССИЯ ПРОВАЛЕНА";caption=game.outcome==="victory"?"Венерианская исследовательская программа стала устойчивой.":"Время простоя уничтожило аэростат. Разберите решения и попробуйте другой путь.";}
 $("scene-stage").textContent=stage;
 $("scene-caption").textContent=caption;
 const policyRoot=$("policy-buttons");clear(policyRoot);
 for(const p of Object.values(Engine.POLICIES)){
   const btn=makeButton(p.name,()=>change({type:"policy",id:p.id}),!built||game.finished,"policy"+(game.policy===p.id?" active":""));
   policyRoot.append(btn);
 }
 $("policy-description").textContent=built?
   Engine.POLICIES[game.policy||"standard"].description+" · "+(Engine.has(game,"lab")?"Затраты: "+forecast.maintenance+" снабжения/ход.":"Полный выбор режима действует после создания лаборатории."):
   "Режимы откроются после запуска аэростата.";
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
 if(game.mode==="session")$("session-preset").value=game.preset||"standard";
 $("next").disabled=game.finished;
 $("next").querySelector("span").textContent=game.finished?"✓":"→";
 drawZones();drawProjects();drawStory();drawObjective();drawOperations();
 $("events").replaceChildren(...game.log.slice(0,9).map(x=>element("div","",x)));
 $("message").textContent=feedback;
}
function switchMode(mode){
 const preset=$("session-preset").value;
 if(game.mode===mode&&(mode!=="session"||game.preset===preset))return;
 if(!confirm("Начать новую "+(mode==="campaign"?"кампанию":"сессию")+"? Текущий прогресс будет потерян."))return;
 game=Engine.create(mode,preset);persist();feedback="Начата новая игра.";render();
}
$("next").addEventListener("click",()=>change({type:"next"}));
$("focus-goal").addEventListener("click",()=>{
 const goal=nextObjective();
 if(goal.zone)change({type:"select",id:goal.zone});
 else $("story-actions").scrollIntoView?.({behavior:"smooth",block:"center"});
});
$("campaign").addEventListener("click",()=>switchMode("campaign"));
$("session").addEventListener("click",()=>switchMode("session"));
$("save").addEventListener("click",()=>{feedback=persist()?"Прогресс сохранён на этом устройстве.":"Браузер не разрешил сохранить игру.";render();});
$("reset").addEventListener("click",()=>{if(!confirm("Сбросить текущую игру?"))return;game=Engine.create(game.mode);persist();feedback="Начата новая игра.";render();});

$("export-save").addEventListener("click",()=>{
 try{
  const data=JSON.stringify(game,null,2);
  const blob=new Blob([data],{type:"application/json;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download="HELIOS-Venus-"+game.mode+"-"+game.year+".json";
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
  feedback="Сформирована резервная копия игры.";
 }catch{
  feedback="Не удалось экспортировать партию на этом устройстве.";
 }
 render();
});
$("import-save").addEventListener("click",()=>$("import-file").click());
$("import-file").addEventListener("change",async event=>{
 const file=event.target.files?.[0];
 if(!file)return;
 if(file.size>1000000){feedback="Файл сохранения слишком большой (максимум 1 МБ).";render();return;}
 try{
  const raw=await file.text();
  const imported=Engine.restore(raw);
  if(!imported){feedback="Файл не является совместимым сохранением HELIOS.";render();return;}
  if(!confirm("Заменить текущую партию загруженным сохранением?"))return;
  game=imported;persist();feedback="Сохранение загружено. Прогресс восстановлен.";
 }catch{
  feedback="Файл не удалось прочитать.";
 }finally{
  event.target.value="";
 }
 render();
});
if(typeof navigator!=="undefined"&&"serviceWorker" in navigator&&location.protocol==="https:"){
 navigator.serviceWorker.register("./sw.js").catch(()=>{});
}

render();
