"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const E=require("../engine.js");
const move=(state,type,id)=>E.apply(state,{type,id});
function campaignToBase(){
 let s=E.create();
 for(const [type,id] of [["council"],["funding","public"],["build","archive"],["build","probe"],["build","relay"],["treaty"],["build","aerostat"],["build","logistics"],["build","lab"]]){
  const r=move(s,type,id);assert.equal(r.error,null,JSON.stringify({type,id,error:r.error}));s=r.state;
 }
 return s;
}
test("campaign and session have distinct resource budgets",()=>{assert.equal(E.create().credits,125);assert.equal(E.create("session").credits,170);});
test("transitions are immutable",()=>{const first=E.create();const result=move(first,"build","archive");assert.equal(result.error,null);assert.equal(first.credits,125);assert.equal(result.state.credits,113);assert.notEqual(first.completed,result.state.completed);});
test("unlock prerequisites are enforced",()=>{const s=E.create();assert.equal(E.canBuild(s,"aerostat"),false);assert.equal(move(s,"build","aerostat").error!==null,true);});
test("cannot make an international treaty before probe and relay",()=>{let s=move(E.create(),"council").state;assert.ok(move(s,"treaty").error);});
test("complete campaign construction loop",()=>{const s=campaignToBase();assert.ok(E.has(s,"lab"));assert.ok(s.international);assert.equal(s.condition,100);assert.ok(s.credits>=0);});
test("lab earns science only while platform operating",()=>{let s=campaignToBase();const start=s.science;s=move(s,"next").state;assert.ok(s.science>=start+8);s={...s,condition:0};const after=s.science;s=move(s,"next").state;assert.equal(s.science-after,5);});
test("transport has a two-turn delivery delay",()=>{let s=campaignToBase();const first=s.supplies;let r=move(s,"shipment");assert.equal(r.error,null);s=r.state;assert.equal(s.shipments[0].arrival,s.turn+2);s=move(s,"next").state;assert.ok(s.supplies<first);s=move(s,"next").state;assert.equal(s.shipments.length,0);assert.ok(s.supplies>=first);});
test("aerostat condition decays and can be repaired",()=>{let s=campaignToBase();s=move(s,"next").state;assert.ok(s.condition<100);const before=s.condition;s=move(s,"repair").state;assert.ok(s.condition>before);});
test("campaign victory requires three stable years",()=>{let s=campaignToBase();for(let i=0;i<2;i++)s=move(s,"next").state;assert.equal(s.finished,false);s=move(s,"next").state;assert.equal(s.finished,true);assert.ok(move(s,"next").error);});
test("out-of-supply platform degrades faster",()=>{let s=campaignToBase();s={...s,supplies:0,energy:0};const after=move(s,"next").state;assert.ok(after.condition<=78);});
test("valid saves restore and malformed saves are rejected",()=>{const s=campaignToBase();assert.deepEqual(E.restore(JSON.stringify(s)),s);assert.equal(E.restore("not json"),null);assert.equal(E.restore('{"version":0}'),null);});
test("unknown actions and zones are rejected",()=>{const s=E.create();assert.ok(move(s,"nonsense").error);assert.ok(move(s,"select","pluto").error);});

test("funding branches create distinct meaningful economic outcomes",()=>{
  let base=E.apply(E.create(),{type:"council"}).state;
  const publicPath=E.apply(base,{type:"funding",id:"public"}).state;
  const privatePath=E.apply(base,{type:"funding",id:"private"}).state;
  assert.equal(publicPath.funding,"public");
  assert.equal(privatePath.funding,"private");
  assert.equal(publicPath.credits,base.credits-8);
  assert.equal(publicPath.science,base.science+12);
  assert.equal(privatePath.credits,base.credits+36);
  assert.equal(privatePath.science,base.science-6);
  assert.ok(E.apply(publicPath,{type:"funding",id:"private"}).error);
});
test("treaty cannot be signed without an explicit funding choice",()=>{
  let s=E.create();
  for(const [type,id] of [["council"],["build","archive"],["build","probe"],["build","relay"]]){
    const r=E.apply(s,{type,id});assert.equal(r.error,null);s=r.state;
  }
  assert.ok(E.apply(s,{type:"treaty"}).error);
});
test("aerostat lost for two consecutive years ends the mission in failure",()=>{
  let s=campaignToBase();s={...s,condition:0,supplies:0,energy:0};
  s=E.apply(s,{type:"next"}).state;
  assert.equal(s.finished,false);
  s=E.apply(s,{type:"next"}).state;
  assert.equal(s.finished,true);
  assert.equal(s.outcome,"failure");
});
test("old version-four saves recover new optional fields",()=>{
  let original=E.create();delete original.funding;delete original.criticalYears;delete original.outcome;
  const restored=E.restore(JSON.stringify(original));
  assert.equal(restored.funding,null);assert.equal(restored.criticalYears,0);assert.equal(restored.outcome,null);
});

test("science vs maintenance: policies shift production, power, and reliability",()=>{
 const base=campaignToBase();
 const intensive=move(base,"policy","intensive").state;
 const conservative=move(base,"policy","conserve").state;
 const advanced=move(intensive,"next").state;
 const saved=move(conservative,"next").state;
 assert.ok(advanced.science>saved.science);
 assert.ok(advanced.supplies<saved.supplies);
 assert.ok(advanced.condition<saved.condition);
 assert.equal(base.policy,"standard");
});
test("policy is disabled until a platform exists",()=>{
 const start=E.create();
 assert.ok(move(start,"policy","intensive").error);
 assert.equal(start.policy,"standard");
});
test("forecast reflects chosen policy and queued shipments",()=>{
 let s=campaignToBase();
 s=move(s,"policy","conserve").state;
 const first=E.forecast(s);
 assert.equal(first.maintenance,2);
 assert.equal(first.science,8);
 s=move(s,"shipment").state;
 assert.equal(E.forecast(s).incoming,0);
 s=move(s,"next").state;
 assert.equal(E.forecast(s).incoming,22);
 assert.equal(s.lastTurn.year,s.year);
});
test("older save restores default work policy and forecast fields",()=>{
 const state=E.create();
 delete state.policy;
 delete state.lastTurn;
 const restored=E.restore(JSON.stringify(state));
 assert.equal(restored.policy,"standard");
 assert.equal(restored.lastTurn,null);
});
test("game score rewards stable successful mission",()=>{
 let s=campaignToBase();
 s=move(s,"next").state;s=move(s,"next").state;s=move(s,"next").state;
 assert.equal(s.outcome,"victory");
 assert.ok(E.score(s)>300);
});
