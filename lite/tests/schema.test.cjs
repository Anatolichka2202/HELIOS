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
