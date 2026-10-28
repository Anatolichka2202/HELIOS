"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const E=require("../engine.js");
const S=require("../scenes.js");

test("all cinematics have unique ids and accessible, non-empty narrated beats",()=>{
 assert.deepEqual(Object.keys(S.SCENES),E.CINEMATICS);
 for(const [id,scene] of Object.entries(S.SCENES)){
  assert.equal(S.get(id),scene);
  assert.ok(scene.series);
  assert.ok(scene.beats.length>=1);
  for(const beat of scene.beats){
   assert.ok(beat.title&&beat.text&&beat.visual&&beat.label);
   assert.ok(beat.text.length>30);
  }
 }
 assert.equal(S.get("invalid"),null);
});
test("prologue is only a campaign experience; session reaches probe without it",()=>{
 const fresh=E.create();
 assert.equal(S.next(fresh),"prologue");
 const seen=E.apply(fresh,{type:"cinema",id:"prologue"}).state;
 assert.equal(S.next(seen),null);
 assert.equal(S.next(E.create("session")),null);
});
test("cinematic trigger order is tied to actual project and event state",()=>{
 let s=E.create("session");
 const command=(type,id)=>{const r=E.apply(s,{type,id});assert.equal(r.error,null);s=r.state;};
 command("build","archive");
 assert.equal(S.next(s),null);
 command("build","probe");
 assert.equal(S.next(s),"probe");
 command("cinema","probe");
 assert.equal(S.next(s),null);
 // Movie playback is independent of engineering signal response.
 assert.equal(s.probeDiscovery,null);
 command("probe-response","broadcast");
 assert.equal(S.next(s),null);
 const onStation={...s,completed:[...s.completed,"aerostat"]};
 assert.equal(S.next(onStation),"aerostat");
 const arrived={...onStation,cinematicSeen:["probe","aerostat"],event:"acid-front"};
 assert.equal(S.next(arrived),"front");
 assert.equal(S.next({...arrived,cinematicSeen:[...arrived.cinematicSeen,"front"]}),null);
 assert.equal(S.next({...arrived,cinematicSeen:[...arrived.cinematicSeen,"front"],event:null,finished:true}),"ending");
});
