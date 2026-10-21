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
function create(mode="campaign"){if(!["campaign","session"].includes(mode))throw Error("Invalid mode");return {version:4,mode,turn:1,year:2034,credits:mode==="session"?170:125,science:mode==="session"?36:20,energy:25,supplies:32,selected:"orbit",completed:[],shipments:[],condition:0,consecutiveYears:0,international:false,storyStep:0,finished:false,log:["2034 · В России обнаружен архив закрытой венерианской программы."]};}
function copy(s){return {...s,completed:[...s.completed],shipments:s.shipments.map(x=>({...x})),log:[...s.log]};}
function has(s,id){return s.completed.includes(id);}
function addLog(s,text){s.log.unshift(s.year+" · "+text);s.log=s.log.slice(0,25);}
function canBuild(s,id){const p=PROJECT_BY_ID[id];return !!p&&!s.finished&&!has(s,id)&&p.requires.every(r=>has(s,r))&&Object.entries(p.cost).every(([k,v])=>s[k]>=v);}
function apply(s,command){const n=copy(s);if(n.version!==4)return {state:s,error:"Несовместимая версия сохранения."};
if(n.finished&&command.type!=="select")return {state:s,error:"Сессия завершена. Можно начать новую игру."};
switch(command.type){
case "select":if(!ZONES.some(z=>z.id===command.id))return {state:s,error:"Неизвестная зона."};n.selected=command.id;break;
case "build":{const p=PROJECT_BY_ID[command.id];if(!canBuild(n,command.id))return {state:s,error:"Недоступный проект или недостаточно ресурсов."};for(const [key,val]of Object.entries(p.cost))n[key]-=val;n.completed.push(p.id);if(p.id==="probe")n.science+=10;if(p.id==="descent")n.science+=8;if(p.id==="aerostat")n.condition=100;addLog(n,"Завершено: "+p.name+".");break;}
case "council":if(n.mode!=="campaign"||n.storyStep!==0)return {state:s,error:"Решение недоступно."};n.storyStep=1;n.science+=8;addLog(n,"Научный совет согласился проверить расчёты молодого инженера.");break;
case "treaty":if(n.mode!=="campaign"||n.storyStep!==1||!has(n,"probe")||!has(n,"relay"))return {state:s,error:"Сначала нужен зонд и ретранслятор."};n.storyStep=2;n.international=true;n.credits+=55;n.supplies+=12;addLog(n,"Заключено предварительное международное соглашение. +55 бюджета, +12 снабжения.");break;
case "shipment":if(!has(n,"logistics")||n.credits<16||n.energy<3)return {state:s,error:"Нужна грузовая программа и 16 бюджета, 3 энергии."};n.credits-=16;n.energy-=3;n.shipments.push({arrival:n.turn+2,amount:22});addLog(n,"С Земли отправлен груз (+22 через два хода).");break;
case "repair":if(!has(n,"aerostat")||n.condition>=100||n.credits<12||n.supplies<7)return {state:s,error:"Для ремонта нужны 12 бюджета и 7 снабжения."};n.credits-=12;n.supplies-=7;n.condition=Math.min(100,n.condition+35);addLog(n,"Выполнен ремонт аэростата: +35 состояния.");break;
case "next":{n.turn++;n.year++;let income=13+(n.international?9:0);n.credits+=income;n.science+=3+(has(n,"probe")?2:0);n.energy+=3;const arriving=n.shipments.filter(x=>x.arrival<=n.turn);n.shipments=n.shipments.filter(x=>x.arrival>n.turn);for(const load of arriving){n.supplies+=load.amount;addLog(n,"Земной груз доставлен: +"+load.amount+" снабжения.");}
if(has(n,"aerostat")){const maintenance=has(n,"lab")?5:3;const power=has(n,"lab")?3:2;const stocked=n.supplies>=maintenance&&n.energy>=power;if(stocked){n.supplies-=maintenance;n.energy-=power;n.condition=Math.max(0,n.condition-4);}else{n.condition=Math.max(0,n.condition-22);addLog(n,"Недостаток энергии или снабжения: деградация платформы.");}
const storm=(n.turn*7+3)%13>=10;if(storm){n.condition=Math.max(0,n.condition-13);addLog(n,"Кислотный шторм: повреждение аэростатной платформы.");}if(n.condition===0)addLog(n,"Аэростат выведен из эксплуатации. Требуется ремонт.");}
if(has(n,"lab")&&n.condition>=40)n.science+=8;
if(has(n,"lab")&&n.condition>=60&&(n.mode==="session"||n.international))n.consecutiveYears++;else n.consecutiveYears=0;
if(n.consecutiveYears>=3){n.finished=true;addLog(n,"Устойчивая программа исследований Венеры создана. Первый сценарий завершён.");}else addLog(n,"Годовой бюджет: +"+income+". Исследования продолжены.");break;}
default:return {state:s,error:"Неизвестная команда."};
}return {state:n,error:null};}
function restore(json){try{const s=JSON.parse(json);if(!s||s.version!==4||!["campaign","session"].includes(s.mode)||!ZONES.some(z=>z.id===s.selected)||!Array.isArray(s.completed)||!Array.isArray(s.shipments)||!Array.isArray(s.log))return null;for(const k of ["turn","year","credits","science","energy","supplies","condition","consecutiveYears","storyStep"])if(!Number.isFinite(s[k])||s[k]<0)return null;if(s.completed.some(id=>!PROJECT_BY_ID[id]))return null;return s;}catch{return null;}}
return {ZONES,PROJECTS,create,apply,has,canBuild,restore};
});