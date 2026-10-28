"use strict";
/* Accessible HELIOS Venus 0.8 cinematics; no paid assets, network calls or autoplay. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 else root.HeliosCinema=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 let bindings=null,active=null,step=0,soundEnabled=false,audio=null;
 const byId=id=>document.getElementById(id);
 function element(tag,cls,text){
  const el=document.createElement(tag);
  if(cls)el.className=cls;
  if(text!==undefined)el.textContent=text;
  return el;
 }
 function cue(kind){
  if(!soundEnabled||typeof window==="undefined")return;
  try{
   const Context=window.AudioContext||window.webkitAudioContext;
   if(!Context)return;
   audio=audio||new Context();
   if(audio.state==="suspended")audio.resume().catch(()=>{});
   const oscillator=audio.createOscillator(),gain=audio.createGain(),now=audio.currentTime;
   oscillator.type=kind==="alarm"?"sawtooth":"sine";
   oscillator.frequency.setValueAtTime(kind==="alarm"?185:kind==="probe"?310:218,now);
   oscillator.frequency.exponentialRampToValueAtTime(kind==="alarm"?97:kind==="probe"?440:165,now+.28);
   gain.gain.setValueAtTime(.0001,now);
   gain.gain.exponentialRampToValueAtTime(.032,now+.025);
   gain.gain.exponentialRampToValueAtTime(.0001,now+.42);
   oscillator.connect(gain);gain.connect(audio.destination);
   oscillator.start(now);oscillator.stop(now+.45);
  }catch{/* Optional audio never prevents the game running. */}
 }
 function current(){return bindings.getGame();}
 function scene(){return globalThis.HeliosScenes?.get(active);}
 function open(id,initialStep=0){
  const target=globalThis.HeliosScenes?.get(id);
  if(!target||!bindings)return;
  active=id;
  step=Math.max(0,Math.min(initialStep,target.beats.length-1));
  byId("cinema").hidden=false;
  draw();
  byId("cinema-next").focus?.();
 }
 function draw(){
  const s=scene();if(!s)return;
  const beat=s.beats[step],state=current();
  byId("cinema").hidden=false;
  byId("cinema-stage").className="cinema-stage scene-"+s.id+" beat-"+beat.visual;
  byId("cinema-series").textContent=s.series;
  byId("cinema-beat-label").textContent=beat.label;
  byId("cinema-title").textContent=beat.title;
  byId("cinema-copy").textContent=beat.text;
  byId("cinema-telemetry-value").textContent=
   beat.visual==="signal"||beat.visual==="signal-choice"?"СИГНАЛ / ПОТЕРЯН":
   beat.visual==="storm"?"ОБОЛОЧКА / ТРЕВОГА":"СИГНАЛ / ПРИЁМ";
  const progress=byId("cinema-progress");progress.replaceChildren();
  for(let i=0;i<s.beats.length;i++)progress.append(element("i",i<=step?"active":""));
  byId("cinema-back").disabled=step===0;
  const last=step===s.beats.length-1;
  const choices=byId("cinema-choices");choices.replaceChildren();
  const decisionPending=last&&s.id==="probe"&&!state.probeDiscovery;
  if(decisionPending){
   for(const d of Object.values(bindings.engine.PROBE_STRATEGIES)){
    const tooExpensive=Object.entries(d.cost).some(([key,value])=>state[key]<value);
    const button=element("button","cinema-choice",d.name);
    button.type="button";button.disabled=tooExpensive;
    const labels={credits:"бюджета",energy:"энергии",science:"науки",supplies:"снабжения"};
    const spend=Object.entries(d.cost).map(([key,value])=>"−"+value+" "+labels[key]).join(" · ");
    const gain=Object.entries(d.gains).map(([key,value])=>"+"+value+" "+labels[key]).join(" · ");
    button.append(element("small","",d.description+" · "+[spend,gain].filter(Boolean).join(" · ")));
    button.addEventListener("click",()=>{
     const result=bindings.engine.apply(current(),{type:"probe-response",id:d.id});
     if(result.error)return;
     bindings.act({type:"probe-response",id:d.id});
     close();
    });
    choices.append(button);
   }
  }
  const next=byId("cinema-next");
  next.hidden=decisionPending;next.disabled=decisionPending;
  next.textContent=last?
   (s.id==="prologue"&&state.storyStep===0?"Вынести гипотезу на совет →":
    beat.finish||"Вернуться к экспедиции →"):"Дальше →";
 }
 function close(){
  if(!active)return;
  const completed=active;active=null;
  byId("cinema").hidden=true;
  bindings.act({type:"cinema",id:completed});
  if(completed==="front")byId("decision-card").scrollIntoView?.({behavior:"smooth",block:"center"});
 }
 function clear(){active=null;if(typeof document!=="undefined"&&byId("cinema"))byId("cinema").hidden=true;}
 function advance(){
  const s=scene();if(!s)return;
  if(step<s.beats.length-1){
   step++;draw();
   cue(s.id==="probe"&&step===1?"alarm":s.id==="probe"?"probe":"normal");
   return;
  }
  const shouldCouncil=s.id==="prologue"&&current().storyStep===0;
  close();
  if(shouldCouncil)bindings.act({type:"council"});
 }
 function replay(){
  const state=current();
  const scenes=globalThis.HeliosScenes;
  const next=scenes.next(state);
  const id=next||(state.finished?"ending":state.event==="acid-front"||state.eventResolved?"front":
   state.completed.includes("aerostat")?"aerostat":state.completed.includes("probe")?"probe":"prologue");
  open(id);
 }
 function sync(){
  if(!bindings)return;
  if(active){draw();return;}
  const next=globalThis.HeliosScenes?.next(current());
  if(next)open(next);
 }
 function initialize(options){
  if(bindings)return;
  bindings=options;
  byId("cinema").hidden=true;
  byId("cinema-replay").addEventListener("click",replay);
  byId("cinema-next").addEventListener("click",advance);
  byId("cinema-skip").addEventListener("click",close);
  byId("cinema-back").addEventListener("click",()=>{if(step>0){step--;draw();}});
  byId("cinema-sound").addEventListener("click",()=>{
   soundEnabled=!soundEnabled;
   byId("cinema-sound").textContent=soundEnabled?"Звук: вкл.":"Звук: выкл.";
   byId("cinema-sound").setAttribute?.("aria-pressed",String(soundEnabled));
   if(soundEnabled)cue("normal");
  });
  document.addEventListener?.("keydown",event=>{
   if(byId("cinema").hidden)return;
   if(event.key==="Escape"){close();event.preventDefault();}
   else if(event.key==="ArrowRight"&&!byId("cinema-next").disabled){advance();event.preventDefault();}
   else if(event.key==="ArrowLeft"&&step>0){step--;draw();event.preventDefault();}
  });
 }
 return Object.freeze({initialize,sync,clear,open,replay});
});
