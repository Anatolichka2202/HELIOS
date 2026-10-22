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
function create(mode="campaign"){if(!["campaign","session"].includes(mode))throw Error("Invalid mode");return {version:4,mode,turn:1,year:2034,credits:mode==="session"?170:125,science:mode==="session"?36:20,energy:25,supplies:32,selected:"orbit",completed:[],shipments:[],condition:0,consecutiveYears:0,international:false,storyStep:0,funding:null,criticalYears:0,outcome:null,policy:"standard",lastTurn:null,finished:false,log:["2034 · В России обнаружен архив закрытой венерианской программы."]};}
function copy(s){return {...s,completed:[...s.completed],shipments:s.shipments.map(x=>({...x})),log:[...s.log],lastTurn:s.lastTurn?{...s.lastTurn}:null};}
function has(s,id){return s.completed.includes(id);}
function addLog(s,text){s.log.unshift(s.year+" · "+text);s.log=s.log.slice(0,25);}
function canBuild(s,id){const p=PROJECT_BY_ID[id];return !!p&&!s.finished&&!has(s,id)&&p.requires.every(r=>has(s,r))&&Object.entries(p.cost).every(([k,v])=>s[k]>=v);}
function apply(s,command){const n=copy(s);if(n.version!==4)return {state:s,error:"Несовместимая версия сохранения."};
if(n.finished&&command.type!=="select")return {state:s,error:"Сессия завершена. Можно начать новую игру."};
switch(command.type){
case "select":if(!ZONES.some(z=>z.id===command.id))return {state:s,error:"Неизвестная зона."};n.selected=command.id;break;
case "build":{const p=PROJECT_BY_ID[command.id];if(!canBuild(n,command.id))return {state:s,error:"Недоступный проект или недостаточно ресурсов."};for(const [key,val]of Object.entries(p.cost))n[key]-=val;n.completed.push(p.id);if(p.id==="probe")n.science+=10;if(p.id==="descent")n.science+=8;if(p.id==="aerostat")n.condition=100;addLog(n,"Завершено: "+p.name+".");break;}
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
 const oldCredits=n.credits,oldScience=n.science,oldEnergy=n.energy,oldSupplies=n.supplies;
 n.turn++;n.year++;
 const income=13+(n.international?9:0);
 n.credits+=income;n.science+=3+(has(n,"probe")?2:0);n.energy+=3;
 const arriving=n.shipments.filter(x=>x.arrival<=n.turn);n.shipments=n.shipments.filter(x=>x.arrival>n.turn);for(const load of arriving){n.supplies+=load.amount;addLog(n,"Земной груз доставлен: +"+load.amount+" снабжения.");}
if(has(n,"aerostat")){
 const policy=has(n,"lab")?POLICIES[n.policy||"standard"]:null;
 const maintenance=policy?policy.supplies:3;
 const power=policy?policy.energy:2;
 const stocked=n.supplies>=maintenance&&n.energy>=power;
 if(stocked){n.supplies-=maintenance;n.energy-=power;n.condition=Math.max(0,n.condition-(policy?policy.wear:4));}
 else {n.condition=Math.max(0,n.condition-22);addLog(n,"Недостаток энергии или снабжения: ускоренный износ платформы.");}
const storm=(n.turn*7+3)%13>=10;if(storm){n.condition=Math.max(0,n.condition-13);addLog(n,"Кислотный шторм: повреждение аэростатной платформы.");}if(n.condition===0){n.criticalYears++;addLog(n,"Аэростат выведен из эксплуатации: ещё один год простоя сорвёт миссию.");}
else n.criticalYears=0;
}
if(has(n,"lab")&&n.condition>=40)n.science+=(POLICIES[n.policy||"standard"]||POLICIES.standard).science;
if(has(n,"lab")&&n.condition>=60&&(n.mode==="session"||n.international))n.consecutiveYears++;else n.consecutiveYears=0;
if(n.criticalYears>=2){n.finished=true;n.outcome="failure";addLog(n,"Миссия сорвана: аэростат не восстановлен в течение двух лет.");}
else if(n.consecutiveYears>=3){n.finished=true;n.outcome="victory";addLog(n,"Устойчивая программа исследований Венеры создана. Первый сценарий завершён.");}
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
 if(s.lastTurn===undefined)s.lastTurn=null;
 if(![null,"public","private"].includes(s.funding)||!Number.isInteger(s.criticalYears)||s.criticalYears<0||!POLICIES[s.policy])return null;
 return s;}catch{return null;}}
function forecast(s){
 const policy=(has(s,"lab")?POLICIES[s.policy||"standard"]:null);
 const hasStation=has(s,"aerostat");
 return {
  nextYear:s.year+1,
  credits:13+(s.international?9:0),
  science:3+(has(s,"probe")?2:0)+(has(s,"lab")&&s.condition>=40?(policy||POLICIES.standard).science:0),
  energy:3-(hasStation?(policy?policy.energy:2):0),
  supplies:(s.shipments||[]).filter(load=>load.arrival<=s.turn+1).reduce((n,load)=>n+load.amount,0)-(hasStation?(policy?policy.supplies:3):0),
  incoming:(s.shipments||[]).filter(load=>load.arrival<=s.turn+1).reduce((n,load)=>n+load.amount,0),
  maintenance:hasStation?(policy?policy.supplies:3):0,
  predictedCondition:hasStation?Math.max(0,s.condition-(policy?policy.wear:4)):null,
  stormRisk:"Возможны дополнительные потери при атмосферном событии."
 };
}
function score(s){
 return Math.max(0,Math.round(
   (s.outcome==="victory"?300:0)
   +s.completed.length*25
   +s.science*2
   +Math.max(0,s.condition)
   +s.credits
   -Math.max(0,s.turn-1)*8
 ));
}
return {ZONES,PROJECTS,POLICIES,create,apply,has,canBuild,restore,forecast,score};
});