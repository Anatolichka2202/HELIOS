"use strict";
/* HELIOS: VENUS simulation. Pure game rules; no DOM, browser, or engine dependencies. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.HeliosVenus=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
const ZONES=Object.freeze([
{id:"orbit",name:"Орбита Венеры",alt:"Снабжение / связь",description:"Управление каналом доставки Земля — Венера. Пусковые окна пока представлены условной задержкой.",hazard:"Транспортные окна и задержки связи"},
{id:"clouds",name:"Облачный слой",alt:"Около 50–60 км",description:"Аэростатные платформы требуют энергии, расходных материалов и защиты от кислотных аэрозолей.",hazard:"Серная кислота, ветры и ресурс оболочки"},
{id:"lower",name:"Нижняя атмосфера",alt:"Ниже 50 км",description:"Сложные температурные и барические условия. Только автоматические аппараты.",hazard:"Температура, давление и связь"},
{id:"surface",name:"Поверхность",alt:"Около 92 бар / 465 °C",description:"Кратковременные роботизированные исследования. Долговременное присутствие не подразумевается.",hazard:"Экстремальные температура и давление"}
]);
const PROJECTS=Object.freeze([
{id:"archive",zone:"orbit",name:"Архив закрытой программы",cost:{credits:12},requires:[],description:"Восстановить документы секретного советского проекта — художественный элемент альтернативной истории."},
{id:"probe",zone:"clouds",name:"Атмосферный зонд",cost:{credits:24,science:6},requires:["archive"],description:"Проверить условия существования автономных платформ. Возвращает 10 научных данных."},
{id:"relay",zone:"orbit",name:"Орбитальный ретранслятор",cost:{credits:18,energy:4},requires:["archive"],description:"Установить канал связи и навигационного обеспечения."},
{id:"aerostat",zone:"clouds",name:"Первый аэростат",cost:{credits:40,science:12,supplies:12},requires:["probe","relay"],description:"Работающая облачная платформа с износом и расходом снабжения."},
{id:"logistics",zone:"orbit",name:"Грузовая программа",cost:{credits:28,energy:6},requires:["relay"],description:"Разрешает отправлять снабжение с Земли. Грузы прибывают через два хода."},
{id:"lab",zone:"clouds",name:"Облачная лаборатория",cost:{credits:34,science:12,supplies:6},requires:["aerostat","logistics"],description:"Научный комплекс. Даёт данные только при работоспособном аэростате."},
{id:"descent",zone:"lower",name:"Спускаемый аппарат",cost:{credits:25,science:10},requires:["probe"],description:"Исследование нижних слоёв атмосферы."},
{id:"lander",zone:"surface",name:"Поверхностный модуль",cost:{credits:32,science:15},requires:["descent","relay"],description:"Кратковременная роботизированная миссия к поверхности."}
]);
const PROJECT_BY_ID=Object.fromEntries(PROJECTS.map(p=>[p.id,p]));
// Operations policy is a real trade-off: discoveries vs consumption and wear.
// The nominal policy deliberately preserves the behavior of earlier Venus saves.
const POLICIES=Object.freeze({
  conserve:{id:"conserve",name:"Консервация",supplies:2,energy:1,science:3,wear:2,description:"Меньше экспериментов и износа; экономим запчасти."},
  standard:{id:"standard",name:"Штатная работа",supplies:5,energy:3,science:8,wear:4,description:"Сбалансированные исследования и эксплуатация."},
  intensive:{id:"intensive",name:"Интенсивные опыты",supplies:8,energy:5,science:13,wear:8,description:"Больше научных данных, но дорогие расходники и ускоренный износ."}
});
const DESIGNS=Object.freeze({
 shield:{id:"shield",name:"Защищённая платформа",cost:{credits:14,supplies:4},wear:-2,storm:-8,science:-2,
  description:"Дороже на старте, но лучше переживает кислоты и требует меньше ремонтов."},
 light:{id:"light",name:"Лёгкая научная станция",cost:{credits:-8,supplies:-4},wear:3,storm:4,science:4,
  description:"Быстрее и дешевле, больше научных данных, но оболочка изнашивается быстрее."},
 legacy:{id:"legacy",name:"Первоначальный демонстратор",cost:{},wear:0,storm:0,science:0,
  description:"Конструкция из старого сохранения. Модель оставлена для совместимости."}
});
const SCHEDULED=Object.freeze({aerostat:1,lab:1});
const SESSION_PRESETS=Object.freeze({
 standard:{name:"Стандарт",credits:170,science:36,energy:25,supplies:32,description:"Сбалансированная первая экспедиция."},
 constrained:{name:"Дефицит",credits:120,science:26,energy:20,supplies:20,description:"Поставки и финансирование особенно важны."},
 funded:{name:"Консорциум",credits:250,science:60,energy:40,supplies:55,description:"Больше ресурсов для крупных инженерных экспериментов."}
});
function create(mode="campaign",preset="standard"){
 if(!["campaign","session"].includes(mode))throw Error("Invalid mode");
 if(!SESSION_PRESETS[preset])throw Error("Invalid preset");
 const starting=SESSION_PRESETS[preset];
 return {version:4,mode,preset:mode==="session"?preset:"standard",turn:1,year:2034,
  credits:mode==="session"?starting.credits:125,science:mode==="session"?starting.science:20,
  energy:mode==="session"?starting.energy:25,supplies:mode==="session"?starting.supplies:32,
  selected:"orbit",completed:[],shipments:[],condition:0,consecutiveYears:0,international:false,
  storyStep:0,funding:null,criticalYears:0,outcome:null,policy:"standard",design:null,buildQueue:[],event:null,eventResolved:false,insight:null,prototype:false,lastTurn:null,finished:false,
  log:["2034 · В России обнаружен архив закрытой венерианской программы."]};
}
function copy(s){return {...s,completed:[...s.completed],shipments:s.shipments.map(x=>({...x})),
 buildQueue:(s.buildQueue||[]).map(x=>({...x})),log:[...s.log],lastTurn:s.lastTurn?{...s.lastTurn}:null};}
function has(s,id){return s.completed.includes(id);}
function addLog(s,text){s.log.unshift(s.year+" · "+text);s.log=s.log.slice(0,25);}
function projectCost(s,id){
 const p=PROJECT_BY_ID[id];if(!p)return null;
 const cost={...p.cost};
 if(id==="aerostat"&&DESIGNS[s.design]){
  for(const [key,delta] of Object.entries(DESIGNS[s.design].cost))cost[key]=(cost[key]||0)+delta;
 }
 return cost;
}
function canBuild(s,id){
 const p=PROJECT_BY_ID[id];if(!p||s.finished||has(s,id)||(s.buildQueue||[]).some(x=>x.id===id))return false;
 if(id==="aerostat"&&!DESIGNS[s.design])return false;
 const cost=projectCost(s,id);
 return p.requires.every(r=>has(s,r))&&Object.entries(cost).every(([k,v])=>s[k]>=v);
}
function apply(s,command){const n=copy(s);if(n.version!==4)return {state:s,error:"Несовместимая версия сохранения."};
if(n.finished&&command.type!=="select")return {state:s,error:"Сессия завершена. Можно начать новую игру."};
switch(command.type){
case "select":if(!ZONES.some(z=>z.id===command.id))return {state:s,error:"Неизвестная зона."};n.selected=command.id;break;
case "build":{
 const p=PROJECT_BY_ID[command.id];
 if(!canBuild(n,command.id))return {state:s,error:"Недоступный проект, очередь строительства или недостаточно ресурсов."};
 for(const [key,val] of Object.entries(projectCost(n,p.id)))n[key]-=val;
 if(SCHEDULED[p.id]){
  n.buildQueue.push({id:p.id,ready:n.turn+SCHEDULED[p.id]});
  addLog(n,"Начат монтаж «"+p.name+"». Ввод в эксплуатацию — после следующего периода.");
 }else{
  n.completed.push(p.id);
  if(p.id==="probe")n.science+=10;
  if(p.id==="descent")n.science+=8;
  addLog(n,"Завершено: "+p.name+".");
 }
 break;
}
case "design":{
 if(!DESIGNS[command.id]||command.id==="legacy"||n.design!==null||has(n,"aerostat")||
    n.buildQueue.some(x=>x.id==="aerostat")||!has(n,"probe")||!has(n,"relay"))
    return {state:s,error:"Для выбора конструкции сначала нужны зонд и ретранслятор."};
 n.design=command.id;
 addLog(n,"Инженерное решение: "+DESIGNS[n.design].name+".");
 break;
}
case "prototype":{
 if(n.insight!=="sample"||!has(n,"lab")||n.prototype)
   return {state:s,error:"Технология кислотостойкой оболочки ещё не исследована."};
 if(n.credits<18||n.science<20||n.supplies<4)
   return {state:s,error:"Для технологии нужно 18 бюджета, 20 науки и 4 расходника."};
 n.credits-=18;n.science-=20;n.supplies-=4;n.prototype=true;
 addLog(n,"Прототип кислотостойкой оболочки готов. Износ снижен на 3, ущерб штормов на 4.");
 break;
}
case "respond":{
 if(n.event!=="acid-front"||!["sample","protect","retreat"].includes(command.id))
   return {state:s,error:"Сейчас нет такого инженерного решения."};
 if(command.id==="protect"&&(n.credits<14||n.supplies<5))
   return {state:s,error:"Усиление защиты требует 14 бюджета и 5 снабжения."};
 if(command.id==="sample"){
   n.science+=22;n.condition=Math.max(0,n.condition-16);n.insight="sample";
   addLog(n,"Рискованный пробоотбор дал +22 науки, но повредил оболочку на 16 пунктов.");
 }else if(command.id==="protect"){
   n.credits-=14;n.supplies-=5;n.condition=Math.min(100,n.condition+10);n.insight="protect";
   addLog(n,"Усилена кислотная защита. Будущие штормы слабее, станция получила +10 состояния.");
 }else{
   n.condition=Math.min(100,n.condition+5);n.consecutiveYears=0;n.insight="retreat";
   addLog(n,"Опыты остановлены для безопасности. Серия устойчивой работы начнётся заново.");
 }
 n.event=null;n.eventResolved=true;
 break;
}
case "council":if(n.mode!=="campaign"||n.storyStep!==0)return {state:s,error:"Решение недоступно."};n.storyStep=1;n.science+=8;addLog(n,"Научный совет согласился проверить расчёты молодого инженера.");break;
case "funding":{
 if(n.mode!=="campaign"||n.storyStep!==1||n.funding!==null||!["public","private"].includes(command.id))return {state:s,error:"Источник финансирования сейчас недоступен."};
 n.funding=command.id;
 if(command.id==="public"){if(n.credits<8)return {state:s,error:"Для открытых исследований нужен резерв 8 бюджета."};n.credits-=8;n.science+=12;addLog(n,"Выбраны открытые государственные исследования: +12 науки, −8 бюджета.");}
 else{n.credits+=36;n.science=Math.max(0,n.science-6);addLog(n,"Подключены частные инвесторы: +36 бюджета, −6 науки. Права на результаты ограничены.");}
 break;
}
case "treaty":{
 if(n.mode!=="campaign"||n.storyStep!==1||n.funding===null||!has(n,"probe")||!has(n,"relay"))return {state:s,error:"Нужны источник финансирования, зонд и ретранслятор."};
 n.storyStep=2;n.international=true;
 const grant=n.funding==="public"?65:45, supplies=n.funding==="public"?20:8;
 n.credits+=grant;n.supplies+=supplies;
 addLog(n,"Открыта международная программа. Грант: +"+grant+" бюджета, +"+supplies+" снабжения.");
 break;
}
case "policy":
 if(!POLICIES[command.id]||!has(n,"aerostat"))return {state:s,error:"Режим аэростата недоступен."};
 n.policy=command.id;
 addLog(n,"Аэростат переведён в режим «"+POLICIES[command.id].name+"».");
 break;
case "shipment":if(!has(n,"logistics")||n.credits<16||n.energy<3)return {state:s,error:"Нужна грузовая программа и 16 бюджета, 3 энергии."};n.credits-=16;n.energy-=3;n.shipments.push({arrival:n.turn+2,amount:22});addLog(n,"С Земли отправлен груз (+22 через два хода).");break;
case "repair":if(!has(n,"aerostat")||n.condition>=100||n.credits<12||n.supplies<7)return {state:s,error:"Для ремонта нужны 12 бюджета и 7 снабжения."};n.credits-=12;n.supplies-=7;n.condition=Math.min(100,n.condition+35);addLog(n,"Выполнен ремонт аэростата: +35 состояния.");break;
case "next":{
 if(n.event)return {state:s,error:"Экспедиция ждёт решения по атмосферному событию."};
 const hadAerostat=has(n,"aerostat"),hadLab=has(n,"lab");
 const oldCredits=n.credits,oldScience=n.science,oldEnergy=n.energy,oldSupplies=n.supplies;
 n.turn++;n.year++;
 const income=13+(n.international?9:0)-(n.funding==="private"&&hadLab?6:0);
 n.credits+=income;n.science+=3+(has(n,"probe")?2:0)+(n.funding==="public"&&hadLab?3:0);n.energy+=3;
 if(n.funding==="private"&&hadLab)addLog(n,"Инвесторам выплачено 6 бюджета за лицензионный доступ.");
 if(n.funding==="public"&&hadLab)addLog(n,"Открытый научный обмен: +3 науки.");
 const arriving=n.shipments.filter(x=>x.arrival<=n.turn);n.shipments=n.shipments.filter(x=>x.arrival>n.turn);for(const load of arriving){n.supplies+=load.amount;addLog(n,"Земной груз доставлен: +"+load.amount+" снабжения.");}
if(hadAerostat){
 const policy=hadLab?POLICIES[n.policy||"standard"]:null;
 const maintenance=policy?policy.supplies:3;
 const power=policy?policy.energy:2;
 const stocked=n.supplies>=maintenance&&n.energy>=power;
 if(stocked){n.supplies-=maintenance;n.energy-=power;
  const wear=Math.max(1,(policy?policy.wear:4)+(DESIGNS[n.design]?.wear||0)-(n.prototype?3:0));
  n.condition=Math.max(0,n.condition-wear);}
 else {n.condition=Math.max(0,n.condition-22);addLog(n,"Недостаток энергии или снабжения: ускоренный износ платформы.");}
const storm=(n.turn*7+3)%13>=10;if(storm){
 const stormDamage=Math.max(1,13+(DESIGNS[n.design]?.storm||0)-(n.insight==="protect"?5:0)-(n.prototype?4:0));
 n.condition=Math.max(0,n.condition-stormDamage);
 addLog(n,"Кислотный шторм: −"+stormDamage+" состояния. Конструкция и защита влияют на ущерб.");
}if(n.condition===0){n.criticalYears++;addLog(n,"Аэростат выведен из эксплуатации: ещё один год простоя сорвёт миссию.");}
else n.criticalYears=0;
}
if(hadLab&&n.condition>=40){
 n.science+=Math.max(1,(POLICIES[n.policy||"standard"]||POLICIES.standard).science+(DESIGNS[n.design]?.science||0));
}
if(hadLab&&n.condition>=60&&(n.mode==="session"||n.international))n.consecutiveYears++;else n.consecutiveYears=0;
const ready=n.buildQueue.filter(x=>x.ready<=n.turn);
n.buildQueue=n.buildQueue.filter(x=>x.ready>n.turn);
for(const queued of ready){
 n.completed.push(queued.id);
 if(queued.id==="aerostat")n.condition=100;
 addLog(n,"Ввод в эксплуатацию: "+PROJECT_BY_ID[queued.id].name+".");
}
if(hadLab&&!n.eventResolved&&!n.event){
 n.event="acid-front";
 addLog(n,"Неожиданный химический фронт: нужно выбрать действия научной экспедиции.");
}
if(n.criticalYears>=2){n.finished=true;n.outcome="failure";addLog(n,"Миссия сорвана: аэростат не восстановлен в течение двух лет.");}
else if(n.consecutiveYears>=3&&!n.event){n.finished=true;n.outcome="victory";addLog(n,"Устойчивая программа исследований Венеры создана. Первый сценарий завершён.");}
else addLog(n,"Годовой бюджет: +"+income+". Исследования продолжены.");
 n.lastTurn={year:n.year,credits:n.credits-oldCredits,science:n.science-oldScience,energy:n.energy-oldEnergy,supplies:n.supplies-oldSupplies,arrivals:arriving.reduce((total,load)=>total+load.amount,0),condition:n.condition,operating:has(n,"aerostat")&&n.condition>0,policy:n.policy||"standard"};
 break;}
default:return {state:s,error:"Неизвестная команда."};
}return {state:n,error:null};}
function restore(json){try{const s=JSON.parse(json);if(!s||s.version!==4||!["campaign","session"].includes(s.mode)||!ZONES.some(z=>z.id===s.selected)||!Array.isArray(s.completed)||!Array.isArray(s.shipments)||!Array.isArray(s.log))return null;for(const k of ["turn","year","credits","science","energy","supplies","condition","consecutiveYears","storyStep"])if(!Number.isFinite(s[k])||s[k]<0)return null;if(s.completed.some(id=>!PROJECT_BY_ID[id]))return null;
 if(s.funding===undefined)s.funding=null;
 if(s.criticalYears===undefined)s.criticalYears=0;
 if(s.outcome===undefined)s.outcome=s.finished?"victory":null;
 if(s.policy===undefined)s.policy="standard";
 if(s.preset===undefined)s.preset="standard";
 if(s.lastTurn===undefined)s.lastTurn=null;
 if(s.design===undefined)s.design=s.completed.includes("aerostat")?"legacy":null;
 if(s.buildQueue===undefined)s.buildQueue=[];
 if(s.event===undefined)s.event=null;
 if(s.eventResolved===undefined)s.eventResolved=false;
 if(s.insight===undefined)s.insight=null;
 if(s.prototype===undefined)s.prototype=false;
 if(!Array.isArray(s.buildQueue)||s.buildQueue.some(q=>!SCHEDULED[q.id]||
    !Number.isInteger(q.ready)||q.ready<s.turn||s.completed.includes(q.id)))return null;
 if(typeof s.prototype!=="boolean"||![null,"shield","light","legacy"].includes(s.design)||
    ![null,"acid-front"].includes(s.event)||
    ![null,"sample","protect","retreat"].includes(s.insight))return null;
 if(![null,"public","private"].includes(s.funding)||!Number.isInteger(s.criticalYears)||s.criticalYears<0||!POLICIES[s.policy]||!SESSION_PRESETS[s.preset])return null;
 return s;}catch{return null;}}
function forecast(s){
 const active=has(s,"aerostat"),lab=has(s,"lab"),policy=lab?(POLICIES[s.policy||"standard"]||POLICIES.standard):null;
 const arriving=s.shipments.filter(x=>x.arrival<=s.turn+1).reduce((n,x)=>n+x.amount,0);
 const cost=active?(policy?policy.supplies:3):0;
 const power=active?(policy?policy.energy:2):0;
 const stocked=!active||s.supplies+arriving>=cost&&s.energy+3>=power;
 const wear=Math.max(1,(policy?policy.wear:4)+(DESIGNS[s.design]?.wear||0)-(s.prototype?3:0));
 return {
 nextYear:s.year+1,
 credits:13+(s.international?9:0)-(s.funding==="private"&&lab?6:0),
 science:3+(has(s,"probe")?2:0)+(s.funding==="public"&&lab?3:0)+
  (lab&&s.condition>=40?Math.max(1,(policy||POLICIES.standard).science+(DESIGNS[s.design]?.science||0)):0),
 energy:3-(active&&stocked?power:0),
 supplies:arriving-(active&&stocked?cost:0),
 incoming:arriving,maintenance:cost,shortage:!stocked,
 predictedCondition:active?Math.max(0,s.condition-(stocked?wear:22)):null,
 construction:s.buildQueue.map(q=>({...q})),
 stormRisk:"Прогноз без непредвиденного кислотного шторма."};
}
function score(s){
 return Math.max(0,Math.round(
   (s.outcome==="victory"?300:0)
   +s.completed.length*25+(s.prototype?25:0)
   +s.science*2
   +Math.max(0,s.condition)
   +s.credits
   -Math.max(0,s.turn-1)*8
 ));
}
return {ZONES,PROJECTS,POLICIES,DESIGNS,SESSION_PRESETS,create,apply,has,canBuild,projectCost,restore,forecast,score};
});