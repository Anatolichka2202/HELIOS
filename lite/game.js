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
  const queued=(game.buildQueue||[]).find(x=>x.id===project.id);
  const missing=project.requires.filter(x=>!Engine.has(game,x));
  const cost=Engine.projectCost(game,project.id);
  card.children[2].textContent=listCost(cost);
  const label=done?"В эксплуатации":queued?"Монтаж · до "+(2034+queued.ready-1)+" года":
    project.id==="aerostat"&&!game.design?"Нужно выбрать конструкцию":
    missing.length?"Нужно: "+missing.map(x=>Engine.PROJECTS.find(p=>p.id===x)?.name||x).join(", "):"Начать проект";
  card.append(makeButton(label,()=>change({type:"build",id:project.id}),!Engine.canBuild(game,project.id)));
  root.append(card);
 }
 if(game.selected==="orbit"&&Engine.has(game,"logistics")){
  const card=element("div","project");
  card.append(element("h4","","Отправить снабжение с Земли"),element("p","","22 единицы через два игровых хода. Перевозка стоит 16 бюджета и 3 энергии."));
  card.append(makeButton("Заказать груз",()=>change({type:"shipment"}),game.credits<16||game.energy<3||game.finished));root.append(card);
 }
 if(game.selected==="clouds"&&game.insight==="sample"&&Engine.has(game,"lab")){
  const card=element("div","project technology");
  card.append(element("h4","","Кислотостойкое покрытие — открытая технология"),
    element("p","","Исследования химического фронта позволяют создать новый состав для оболочки. Навсегда уменьшает износ на 3 и ущерб штормов на 4."),
    element("small","","18 бюджета · 20 науки · 4 снабжения"));
  card.append(makeButton(game.prototype?"Прототип установлен":"Синтезировать покрытие",()=>change({type:"prototype"}),
    game.prototype||game.credits<18||game.science<20||game.supplies<4||game.finished));
  root.append(card);
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
  const result=Engine.ending(game);
  title.textContent=result.title;
  copy.textContent=result.story;
  const details=element("div","epilogue");
  details.append(element("strong","","ИТОГОВЫЙ ОТЧЁТ"),
    element("p","","Оценка: "+Engine.score(game)+" · Проектов введено: "+game.completed.length+
      " · Устойчивых периодов: "+game.consecutiveYears+
      " · Конструкция: "+(Engine.DESIGNS[game.design]?.name||"не выбрана")),
    element("p","","Научная программа: "+(game.insight==="sample"?"рисковый пробоотбор":
      game.insight==="protect"?"защита станции":game.insight==="retreat"?"остановка экспериментов":"без исследовательского кризиса")+
      (game.prototype?" · создано кислотостойкое покрытие":"")));
  actions.append(details,element("p","subtle","Попробуйте другую конструкцию, финансирование или научную тактику — последствия изменятся."));
  const continueUniverse=element("a","ecosystem-jump","Какие ещё истории есть во вселенной HELIOS →");
  continueUniverse.href="#helios-universe";
  actions.append(continueUniverse);
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
function drawDecisions(){
 const root=$("decision-card"),options=$("decision-options");
 clear(options);
 if(game.finished){root.hidden=true;return;}
 if(game.event==="acid-front"){
   root.hidden=false;
   $("decision-title").textContent="Кислотный фронт над станцией";
   $("decision-copy").textContent="Зонд зафиксировал необычную химическую структуру. Оболочка аэростата уже подвергается воздействию. Можно рискнуть ради открытия, срочно усилить защиту или прервать исследование.";
   const choices=[
    {id:"sample",title:"Взять образцы",effect:"+22 науки · −16 состояния аэростата",desc:"Мы получим редкие данные о Венере, но подставим платформу под кислотный фронт."},
    {id:"protect",title:"Усилить защиту",effect:"−14 бюджета · −5 снабжения · +10 состояния",desc:"Устраним часть повреждений и снизим ущерб от будущих штормов."},
    {id:"retreat",title:"Остановить эксперименты",effect:"+5 состояния · серия устойчивой работы обнуляется",desc:"Сохраняем исследовательскую платформу ценой научной программы и времени."}
   ];
   for(const choice of choices){
    const b=makeButton(choice.title+" — "+choice.effect,()=>change({type:"respond",id:choice.id}),
      choice.id==="protect"&&(game.credits<14||game.supplies<5),"decision-choice");
    b.append(element("small","",choice.desc));options.append(b);
   }
   return;
 }
 const canChoose=game.design===null&&Engine.has(game,"probe")&&Engine.has(game,"relay")&&
   (game.mode==="session"||game.international);
 if(!canChoose){root.hidden=true;return;}
 root.hidden=false;
 $("decision-title").textContent="Каким будет первый аэростат?";
 $("decision-copy").textContent="Два проекта отвечают на один инженерный вопрос по-разному. Выбор фиксируется до постройки платформы и влияет на цену строительства, исследования и опасность штормов.";
 for(const d of [Engine.DESIGNS.shield,Engine.DESIGNS.light]){
   const cost=Engine.projectCost({...game,design:d.id},"aerostat");
   const b=makeButton(d.name+" · "+listCost(cost),()=>change({type:"design",id:d.id}),false,"decision-choice");
   b.append(element("small","",d.description));options.append(b);
 }
}
function nextObjective(){
 if(game.finished)return {title:game.outcome==="failure"?"Миссия сорвана":"Первая экспедиция завершена",description:"Откройте новую партию, чтобы попробовать другой путь.",zone:null};
 if(game.event)return {title:"Срочное решение — кислотный фронт",description:"Экспедиция приостановлена до вашего инженерного решения. Выберите один из трёх способов реагирования.",zone:null};
 if((game.buildQueue||[]).some(q=>q.id==="lab"))return {title:"Ввод лаборатории в эксплуатацию",description:"Оборудование монтируется. Завершите следующий игровой период.",zone:null};
 if((game.buildQueue||[]).some(q=>q.id==="aerostat"))return {title:"Монтаж первого аэростата",description:"Конструкция выбрана, расходники зарезервированы. Завершите следующий игровой период.",zone:null};
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
 if(!game.design)return {title:"Выбрать конструкцию аэростата",description:"Дорогая защита уменьшит аварии; лёгкая платформа ускорит науку, но потребует тщательного обслуживания.",zone:null};
 const expansion=[
  ["aerostat","Развернуть первый аэростат","Проверьте научный демонстратор в облаках Венеры."],
  ["logistics","Организовать грузовые рейсы","Грузы с Земли приходят через два игровых хода (пока без реальной баллистики)."],
  ["lab","Построить облачную лабораторию","Научная станция должна работать несмотря на износ."]
 ];
 for(const [id,title,description] of expansion){
  if(!Engine.has(game,id))return {title,description,zone:Engine.PROJECTS.find(p=>p.id===id).zone};
 }
 if(game.insight==="sample"&&!game.prototype&&Engine.has(game,"lab")&&game.science>=20&&game.credits>=18&&game.supplies>=4)
   return {title:"Создать кислотостойкое покрытие",description:"В результате рискованного пробоотбора открыта новая технология. Уменьшите будущий износ аэростата.",zone:"clouds"};
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
 $("visual-aerostat").classList.toggle("building",(game.buildQueue||[]).some(q=>q.id==="aerostat"));
 $("visual-aerostat").classList.toggle("damaged",built&&game.condition<45);
 $("visual-aerostat").classList.toggle("prototype",built&&game.prototype);
 $("visual-lab").classList.toggle("active",Engine.has(game,"lab"));
 $("visual-lab").classList.toggle("building",(game.buildQueue||[]).some(q=>q.id==="lab"));
 let stage="ПОДГОТОВКА",caption="Сначала восстановите архив, затем отправьте атмосферный зонд.";
 if(Engine.has(game,"probe")){stage="ИССЛЕДОВАНИЯ";caption="Зонд начал изучать химическую и динамическую среду Венеры.";}
 if(Engine.has(game,"aerostat")){stage="АЭРОСТАТ";caption="Первый аппарат закрепился в облачном слое. Следите за состоянием и снабжением.";}
 if(Engine.has(game,"lab")){stage="ЛАБОРАТОРИЯ";caption="Исследовательская станция действует: "+game.consecutiveYears+"/3 устойчивых лет.";}
 if((game.buildQueue||[]).some(q=>q.id==="aerostat")){stage="МОНТАЖ";caption="Инженеры собирают "+Engine.DESIGNS[game.design].name.toLowerCase()+". Ввод после следующего периода.";}
 if((game.buildQueue||[]).some(q=>q.id==="lab")){stage="МОНТАЖ ЛАБОРАТОРИИ";caption="Научные модули проходят установку. Требуется один игровой период.";}
 if(game.event){stage="КРИЗИС";caption="Кислотный фронт. Выберите ответ экспедиции, прежде чем продолжать симуляцию.";}
 if(game.prototype){caption="Экспериментальное защитное покрытие установлено. Износ и ущерб кислотных фронтов сокращены.";}
 if(game.finished){stage=game.outcome==="victory"?"МИССИЯ ВЫПОЛНЕНА":"МИССИЯ ПРОВАЛЕНА";caption=game.outcome==="victory"?"Венерианская исследовательская программа стала устойчивой.":"Время простоя уничтожило аэростат. Разберите решения и попробуйте другой путь.";}
 $("illustrated-stage").classList.toggle("crisis",!!game.event);
 $("illustrated-stage").classList.toggle("science-breakthrough",!!game.prototype);
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

function renderEcosystem(){
 const config=globalThis.HeliosEcosystem;
 if(!config)return;
 const root=$("ecosystem-products"),offers=$("ecosystem-offers");
 clear(root);clear(offers);offers.hidden=true;
 for(const product of config.products){
   const card=element("article","ecosystem-card ecosystem-"+product.id);
   const header=element("div","ecosystem-card-head");
   header.append(element("span","ecosystem-category",product.kind),
     element("strong","ecosystem-availability",
       product.availability==="playable"?"ДОСТУПНАЯ ИГРА":
       product.availability==="released"?"ВЫШЛА":"В РАЗРАБОТКЕ"));
   card.append(header,element("h3","",product.title),element("p","",product.pitch));
   if(config.isReleased(product)){
     const link=element("a","ecosystem-link",product.action||"Открыть продукт");
     link.href=product.url;link.target="_blank";link.rel="noopener noreferrer";
     card.append(link);
   }else{
     card.append(element("span","ecosystem-promise",
       product.id==="lite"?"Вы сейчас играете в эту историю.":"Другой сюжет и масштаб, а не повторение этой кампании."));
   }
   root.append(card);
 }
 for(const [kind,offer,description] of [
   ["support",config.support,"Добровольная поддержка создания новых эпизодов. Без игровых преимуществ."],
   ["chapter",config.paidEpisodes,"Отдельная законченная браузерная история, а не недостающий финал текущей."]
 ]){
   if(!config.hasPublishedLink(offer))continue;
   const segment=element("div","ecosystem-offer ecosystem-offer-"+kind);
   segment.append(element("p","",description));
   const link=element("a","ecosystem-link",offer.action);
   link.href=offer.url;link.target="_blank";link.rel="noopener noreferrer";
   segment.append(link);offers.append(segment);offers.hidden=false;
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
 if(game.mode==="session")$("session-preset").value=game.preset||"standard";
 $("next").disabled=game.finished||!!game.event;
 $("next").querySelector("span").textContent=game.finished?"✓":"→";
 drawZones();drawProjects();drawStory();drawObjective();drawOperations();drawDecisions();
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
 else if(game.event||(!game.design&&Engine.has(game,"probe")&&Engine.has(game,"relay")))
   $("decision-card").scrollIntoView?.({behavior:"smooth",block:"center"});
 else $("story-actions").scrollIntoView?.({behavior:"smooth",block:"center"});
});
$("campaign").addEventListener("click",()=>switchMode("campaign"));
$("session").addEventListener("click",()=>switchMode("session"));
$("save").addEventListener("click",()=>{feedback=persist()?"Прогресс сохранён на этом устройстве.":"Браузер не разрешил сохранить игру.";render();});
$("reset").addEventListener("click",()=>{if(!confirm("Сбросить текущую игру?"))return;game=Engine.create(game.mode,game.preset||"standard");persist();feedback="Начата новая игра.";render();});

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

renderEcosystem();
render();
