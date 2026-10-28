"use strict";
/**
 * HELIOS 0.8 narrative cinematics. Data only: no DOM and no external media.
 * Visuals are original project SVGs + CSS motion, not represented as real
 * gameplay footage. All important narration is available as visible text.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 else root.HeliosScenes=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 const SCENES=Object.freeze({
  prologue:{
   id:"prologue",series:"ГЛАВА I / ЗАБЫТАЯ ПРОГРАММА",
   beats:[
    {visual:"archive",label:"МОСКВА · 2034",title:"У проекта было другое имя",
     text:"В закрытом архиве обнаружили расчёты, которые десятилетиями считались фантазией. На полях одного документа — отметка: «Венера. Не закрывать»."},
    {visual:"archive-council",label:"НАУЧНЫЙ СОВЕТ",title:"«Вы предлагаете невозможное»",
     text:"Молодой инженер показывает расчёт аэростатных станций. Эксперты требуют доказательств: температура, химия, связь, снабжение. Ни одного права на ошибку."},
    {visual:"venus",label:"ДОКАЗАТЕЛЬСТВО НА ВАШЕЙ СТОРОНЕ",title:"Пусть ответит Венера",
     text:"У вас нет колонии и нет флота. Есть небольшой бюджет, спорная гипотеза и возможность послать первый зонд. Решения будут иметь цену.",
     finish:"Потребовать научную проверку"}
   ]
  },
  probe:{
   id:"probe",series:"МИССИЯ 01 / ТЕЛЕМЕТРИЯ",
   beats:[
    {visual:"probe",label:"ТЕЛЕМЕТРИЯ · ВХОД В АТМОСФЕРУ",title:"Аппарат входит в облака",
     text:"Поток раскалённых газов окружает зонд. Датчики работают. Первые измерения подтверждают: в верхнем облачном слое возможна длительная работа платформы."},
    {visual:"signal",label:"ВНИМАНИЕ · ПОТЕРЯ НЕСУЩЕЙ",title:"Связь оборвалась",
     text:"На высоте условного исследовательского коридора приборы фиксируют необычный химический сигнал. Спустя секунду телеметрия исчезает."},
    {visual:"signal-choice",label:"ИНЖЕНЕРНОЕ РЕШЕНИЕ",title:"Что делать с последним пакетом?",
     text:"Можно потратить ресурсы и попытаться восстановить последовательность измерений, раскрыть данные коллегам или спасти аппарат. Это изменит бюджет, науку и поддержку проекта.",
     choices:true}
   ]
  },
  aerostat:{
   id:"aerostat",series:"МИССИЯ 02 / ОБЛАЧНАЯ СТАНЦИЯ",
   beats:[
    {visual:"aerostat",label:"ВЕНЕРА · ВЕРХНИЕ ОБЛАКА",title:"Ниже — океан кислоты и ветра",
     text:"Грузовой модуль выводит первую платформу в расчётный слой. Тросы натягиваются, защитная оболочка наполняется, блоки постепенно выходят на связь."},
    {visual:"aerostat-light",label:"СИСТЕМЫ В НОМИНАЛЕ",title:"Мы впервые остались здесь",
     text:"Это ещё не город и не колония. Но человек построил над Венерой инженерный объект, которому предстоит жить дольше одного спуска. Он зависит от ваших решений."}
   ]
  },
  front:{
   id:"front",series:"КРИЗИС / ХИМИЧЕСКИЙ ФРОНТ",
   beats:[
    {visual:"storm",label:"АЛАРМ · СТАНЦИЯ В ОБЛАКАХ",title:"Оболочка теряет прочность",
     text:"Датчики фиксируют коррозионный фронт. На внешнем слое появляются повреждения. В научном модуле уверены: это уникальный шанс получить образцы."},
    {visual:"storm",label:"ЦЕНА ОТКРЫТИЯ",title:"Люди ждут решения",
     text:"Рискнуть ради науки, усилить защиту или остановить эксперименты? Каждый вариант изменит устойчивость программы и будущее Венеры.",
     finish:"Открыть аварийные решения"}
   ]
  },
  ending:{
   id:"ending",series:"ФИНАЛ ПЕРВОЙ ЭКСПЕДИЦИИ",
   beats:[
    {visual:"aerostat-light",label:"ДОКЛАД МИССИИ",title:"Здесь больше не пусто",
     text:"Научная программа доказала, что Венера может удерживать работающую инфраструктуру. Но дальнейшая судьба экспедиции зависит от того, какой ценой вам это удалось.",
     finish:"Прочитать итог экспедиции"}
   ]
  }
 });
 function next(state){
  const seen=state.cinematicSeen||[];
  if(state.mode==="campaign"&&state.storyStep===0&&!seen.includes("prologue"))return "prologue";
  if(state.completed.includes("probe")&&!seen.includes("probe"))return "probe";
  if(state.completed.includes("aerostat")&&!seen.includes("aerostat"))return "aerostat";
  if(state.event==="acid-front"&&!seen.includes("front"))return "front";
  if(state.finished&&!seen.includes("ending"))return "ending";
  return null;
 }
 function get(id){return Object.hasOwn(SCENES,id)?SCENES[id]:null;}
 const api={SCENES,next,get};
 return Object.freeze(api);
});
