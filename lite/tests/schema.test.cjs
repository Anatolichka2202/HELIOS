"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const E=require("../engine.js");
const spec=require("../../shared/venus-scenario.json");

test("Venus regions agree across prototype and shared data contract",()=>{
  assert.deepEqual(E.ZONES.map(z=>z.id),spec.regions.map(z=>z.id));
});
test("engineering projects and prerequisites agree with shared contract",()=>{
  assert.deepEqual(E.PROJECTS.map(p=>({id:p.id,zone:p.zone,requires:p.requires,cost:p.cost})),spec.projects);
});
test("project prerequisites never contain unknown or duplicate identifiers",()=>{
  const ids=new Set(spec.projects.map(p=>p.id));
  assert.equal(ids.size,spec.projects.length);
  for(const project of spec.projects){
    assert.ok(spec.regions.some(r=>r.id===project.zone));
    for(const req of project.requires)assert.ok(ids.has(req)&&req!==project.id);
    for(const amount of Object.values(project.cost))assert.ok(Number.isFinite(amount)&&amount>0);
  }
});
test("logistics two-turn contract agrees with the engine",()=>{
  let state=E.create("session");
  const run=(type,id)=>{const r=E.apply(state,{type,id});assert.equal(r.error,null);state=r.state;};
  run("build","archive");run("build","relay");run("build","logistics");run("shipment");
  assert.equal(state.shipments[0].arrival-state.turn,spec.supply.turnsToArrive);
  run("next");assert.equal(state.shipments.length,1);
  const before=state.supplies;run("next");
  assert.equal(state.shipments.length,0);
  assert.equal(state.supplies-before,spec.supply.shipmentUnits);
});

test("political funding choices reproduce the documented resource deltas",()=>{
  assert.equal(spec.schemaVersion,5);
  const c=E.apply(E.create(),{type:"council"}).state;
  for(const key of ["public","private"]){
    const r=E.apply(c,{type:"funding",id:key});
    assert.equal(r.error,null);
    const delta=spec.fundingChoices[key].initialDelta;
    assert.equal(r.state.credits,c.credits+delta.credits);
    assert.equal(r.state.science,c.science+delta.science);
  }
});
test("mission failure requires documented number of critical years",()=>{
  assert.equal(spec.outcomes.missionFailureConsecutiveYears,2);
});

test("operation policies share the same values as the game engine",()=>{
 assert.equal(spec.schemaVersion,5);
 assert.equal(spec.operations.defaultPolicy,"standard");
 for(const key of ["conserve","standard","intensive"]){
   const engine=E.POLICIES[key];
   const contract=spec.operations.policyOptions[key];
   assert.equal(engine.supplies,contract.supplies);
   assert.equal(engine.energy,contract.energy);
   assert.equal(engine.science,contract.science);
   assert.equal(engine.wear,contract.wear);
 }
});
test("maintenance and transport cost definitions stay consistent",()=>{
 const state=E.create("session");
 assert.equal(spec.operations.repair.cost.credits,12);
 assert.equal(spec.operations.repair.cost.supplies,7);
 assert.equal(spec.operations.repair.restoredCondition,35);
 assert.equal(spec.supply.turnsToArrive,2);
 assert.equal(state.policy,spec.operations.defaultPolicy);
});

test("session preset starting resources match shared contract",()=>{
 const fields=["credits","science","energy","supplies"];
 for(const id of ["standard","constrained","funded"]){
   const state=E.create("session",id);
   for(const field of fields)assert.equal(state[field],spec.sessionPresets[id][field]);
 }
});

test("Lite exploratory designs and commissioning times match shared gameplay contract",()=>{
 const experimental=spec.liteExperimentalV07;
 for(const id of ["shield","light","legacy"]){
  const e=E.DESIGNS[id],x=experimental.designs[id];
  assert.deepEqual(e.cost,x.extraBuildCost);
  assert.equal(e.wear,x.wearAdjustment);
  assert.equal(e.storm,x.stormDamageAdjustment);
  assert.equal(e.science,x.scienceAdjustment);
 }
 assert.equal(experimental.constructionDurations.aerostat,1);
 assert.equal(experimental.constructionDurations.lab,1);
});
test("acid front science unlock has a published, bounded engineering cost",()=>{
 const x=spec.liteExperimentalV07.acidResistantPrototype;
 assert.deepEqual(x.cost,{credits:18,science:20,supplies:4});
 assert.equal(x.wearMitigation,3);
 assert.equal(x.stormMitigation,4);
});
