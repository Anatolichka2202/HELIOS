"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const code = ["engine.js", "ecosystem.js", "scenes.js", "cinema.js", "game.js"].map(name => fs.readFileSync(path.join(root, name), "utf8"));
const expectedIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
class Element {
  constructor(tag="div") {
    this.tagName=tag; this.children=[]; this.textContent=""; this.disabled=false;this.events={};this.style={};
    this.classList={toggle:()=>{},add:()=>{},remove:()=>{}};
  }
  append(...children){this.children.push(...children);}
  replaceChildren(...children){this.children=[...children];}
  addEventListener(event,callback){this.events[event]=callback;}
  querySelector(){return new Element("span");}
  click(){assert.equal(typeof this.events.click,"function");this.events.click();}
}
function mount(store=new Map(),allowedStorage=true){
 const nodes=new Map();
 const document={
   getElementById(id){
     assert.ok(expectedIds.has(id),"Missing HTML id: "+id);
     if(!nodes.has(id))nodes.set(id,new Element());
     return nodes.get(id);
   },
   createElement(tag){return new Element(tag);}
 };
 const localStorage={
   getItem(key){if(!allowedStorage)throw Error("blocked");return store.get(key)||null;},
   setItem(key,value){if(!allowedStorage)throw Error("blocked");store.set(key,value);}
 };
 const sandbox={document,localStorage,confirm:()=>true};
 vm.createContext(sandbox);
 vm.runInContext(code[0],sandbox);
 vm.runInContext(code[1],sandbox);
 vm.runInContext(code[2],sandbox);
 vm.runInContext(code[3],sandbox);
 vm.runInContext(code[4],sandbox);
 return {nodes,store,sandbox,get:id=>document.getElementById(id)};
}
test("game loads with four Venus zones and campaign story",()=>{
 const app=mount();
 assert.equal(app.get("layers").children.length,4);
 assert.equal(app.get("year").textContent,2034);
 assert.ok(app.get("chapter-title").textContent.includes("Досье"));
});
test("turn advances and autosave survives remount",()=>{
 const store=new Map();
 const app=mount(store);
 app.get("next").click();
 assert.equal(app.get("year").textContent,2035);
 assert.ok(store.has("helios-venus-v4"));
 const reloaded=mount(store);
 assert.equal(reloaded.get("year").textContent,2035);
});
test("player can choose state science funding in campaign",()=>{
 const app=mount();
 app.get("story-actions").children[0].click();
 assert.equal(app.get("story-actions").children.length,2);
 app.get("story-actions").children[0].click();
 assert.ok(app.get("chapter-copy").textContent.includes("открытая"));
});
test("session mode bypasses campaign choices",()=>{
 const app=mount();
 app.get("session").click();
 assert.ok(app.get("chapter-title").textContent.includes("сессия"));
});
test("game renders even when storage is unavailable",()=>{
 const app=mount(new Map(),false);
 app.get("next").click();
 assert.equal(app.get("year").textContent,2035);
});

test("objective guides the first campaign step and then sector work",()=>{
 const app=mount();
 assert.equal(app.get("objective-title").textContent,"Доказать возможность проекта");
 app.get("story-actions").children[0].click();
 assert.equal(app.get("objective-title").textContent,"Выбрать финансирование");
 app.get("story-actions").children[0].click();
 assert.equal(app.get("objective-title").textContent,"Изучить секретный архив");
 app.get("projects").children[0].children.at(-1).click();
 assert.equal(app.get("objective-title").textContent,"Отправить атмосферный зонд");
 app.get("focus-goal").click();
 assert.equal(app.get("sector-name").textContent,"Облачный слой");
});

test("operations panel shows forecast and future shipment timeline",()=>{
 const app=mount();
 assert.equal(app.get("scene-stage").textContent,"ПОДГОТОВКА");
 assert.equal(app.get("forecast-year").textContent,2035);
 assert.equal(app.get("policy-buttons").children.length,3);
 assert.equal(app.get("condition").textContent,"Не построен");
});
test("operations panel responds to progression without browser-only APIs",()=>{
 const app=mount();
 app.get("story-actions").children[0].click();
 app.get("story-actions").children[0].click();
 app.get("projects").children[0].children.at(-1).click();
 app.get("focus-goal").click();
 app.get("projects").children[0].children.at(-1).click();
 assert.equal(app.get("scene-stage").textContent,"ИССЛЕДОВАНИЯ");
 assert.ok(app.get("scene-caption").textContent.includes("Зонд"));
});

test("policy selector becomes available after aerostat construction",()=>{
 const app=mount();
 const clickFirstProject=()=>app.get("projects").children[0].children.at(-1).click();
 app.get("story-actions").children[0].click(); // scientific council
 app.get("story-actions").children[0].click(); // public funding
 clickFirstProject(); // archive
 app.get("layers").children[1].click();
 clickFirstProject(); // probe
 app.get("layers").children[0].click();
 app.get("projects").children[1].children.at(-1).click(); // relay
 app.get("story-actions").children[0].click(); // treaty
 assert.equal(app.get("decision-card").hidden,false);
 assert.equal(app.get("decision-options").children.length,2);
 app.get("decision-options").children[0].click(); // shield design
 app.get("layers").children[1].click();
 app.get("projects").children[1].children.at(-1).click(); // aerostat queue
 assert.equal(app.get("scene-stage").textContent,"МОНТАЖ");
 assert.equal(app.get("policy-buttons").children[2].disabled,true);
 app.get("next").click(); // commission
 assert.equal(app.get("scene-stage").textContent,"АЭРОСТАТ");
 assert.equal(app.get("policy-buttons").children[2].disabled,false);
 app.get("policy-buttons").children[2].click();
 const saved=JSON.parse(app.store.get("helios-venus-v4"));
 assert.equal(saved.policy,"intensive");
});
test("compatible save file can be imported while invalid JSON is refused",async()=>{
 const app=mount();
 const initial=app.store.get("helios-venus-v4");
 app.get("next").click();
 const year=app.get("year").textContent;
 assert.equal(year,2035);
 const valid=JSON.stringify(app.sandbox.HeliosVenus.create());
 const field=app.get("import-file");
 const good={files:[{size:valid.length,text:async()=>valid}],value:""};
 await field.events.change({target:good});
 assert.equal(app.get("year").textContent,2034);
 const bad={files:[{size:20,text:async()=>"{bad"}],value:""};
 await field.events.change({target:bad});
 assert.equal(app.get("year").textContent,2034);
 assert.ok(app.get("message").textContent.includes("совместимым"));
});

test("session challenge selector changes initial resources",()=>{
 const app=mount();
 app.get("session-preset").value="constrained";
 app.get("session").click();
 assert.equal(app.get("credits").textContent,120);
 assert.equal(app.get("supplies").textContent,20);
 assert.equal(app.get("session-preset").value,"constrained");
});

test("operations forecast exposes a dedicated resource-warning message",()=>{
 const app=mount();
 assert.equal(app.get("forecast-alert").textContent,"");
 assert.ok(app.get("policy-buttons").children.length===3);
});

test("player chooses a different engineering design and sees its higher cost",()=>{
 const app=mount();
 app.get("session").click();
 app.get("projects").children[0].children.at(-1).click();
 app.get("layers").children[1].click();
 app.get("projects").children[0].children.at(-1).click();
 app.get("layers").children[0].click();
 app.get("projects").children[1].children.at(-1).click();
 assert.equal(app.get("decision-options").children.length,2);
 app.get("decision-options").children[1].click();
 const s=JSON.parse(app.store.get("helios-venus-v4"));
 assert.equal(s.design,"light");
 app.get("layers").children[1].click();
 assert.ok(app.get("projects").children[1].children[2].textContent.includes("32 бюджет"));
});
test("acid front is visible and next year is blocked until a crisis choice",()=>{
 const app=mount();
 app.get("session-preset").value="funded";
 app.get("session").click();
 const build=(index=0)=>app.get("projects").children[index].children.at(-1).click();
 build(); // archive
 app.get("layers").children[1].click();build(); // probe
 app.get("layers").children[0].click();build(1); // relay
 app.get("decision-options").children[0].click(); // reinforced
 app.get("layers").children[1].click();build(1); // aerostat started
 app.get("next").click(); // commissioned
 app.get("layers").children[0].click();build(2); // logistics
 app.get("layers").children[1].click();build(2); // lab started
 app.get("next").click(); // lab completed
 app.get("next").click(); // first year triggers event
 assert.equal(app.get("decision-card").hidden,false);
 assert.ok(app.get("decision-title").textContent.includes("Кислотный"));
 assert.equal(app.get("next").disabled,true);
 app.get("decision-options").children[1].click(); // reinforce, if enough supplies
 assert.equal(app.get("next").disabled,false);
});

test("franchise cards are distinguishable and contain no invented shop links",()=>{
 const app=mount();
 const products=app.get("ecosystem-products").children;
 assert.equal(products.length,3);
 assert.ok(products[0].children[1].textContent.includes("Досье"));
 assert.ok(products[1].children[1].textContent.includes("Облачная"));
 assert.ok(products[2].children[1].textContent.includes("Большая"));
 for(const product of products){
   assert.equal(product.children.some(child=>child.tagName==="a"),false);
 }
 assert.equal(app.get("ecosystem-offers").hidden,true);
});
test("browser holds independent campaign state when ecosystem display is rendered",()=>{
 const app=mount();
 assert.equal(app.get("year").textContent,2034);
 assert.equal(app.get("layers").children.length,4);
 assert.equal(app.get("ecosystem-products").children.length,3);
 app.get("next").click();
 assert.equal(app.get("year").textContent,2035);
 assert.equal(app.get("ecosystem-products").children.length,3);
});

test("Venus 0.8 opens a captioned classified-file cinematic and can begin council",()=>{
 const app=mount();
 assert.equal(app.get("cinema").hidden,false);
 assert.ok(app.get("cinema-title").textContent.includes("другое имя"));
 assert.equal(app.get("cinema-next").disabled,false);
 app.get("cinema-next").click();
 assert.ok(app.get("cinema-title").textContent.includes("невозможное"));
 app.get("cinema-next").click();
 assert.ok(app.get("cinema-title").textContent.includes("Венера"));
 app.get("cinema-next").click();
 const state=JSON.parse(app.store.get("helios-venus-v4"));
 assert.equal(state.storyStep,1);
 assert.deepEqual(Array.from(state.cinematicSeen),["prologue"]);
 assert.equal(app.get("cinema").hidden,true);
});

test("probe signal-loss film leads to a meaningful saved engineering decision",()=>{
 const app=mount();
 app.get("cinema-skip").click(); // archive prologue is optional
 app.get("story-actions").children[0].click(); // council
 app.get("story-actions").children[0].click(); // public funding
 app.get("projects").children[0].children.at(-1).click(); // archive
 app.get("layers").children[1].click(); // clouds
 app.get("projects").children[0].children.at(-1).click(); // probe
 assert.equal(app.get("cinema").hidden,false);
 assert.ok(app.get("cinema-title").textContent.includes("облака"));
 app.get("cinema-next").click(); // blackout
 assert.ok(app.get("cinema-telemetry-value").textContent.includes("ПОТЕРЯН"));
 app.get("cinema-next").click(); // decision
 assert.equal(app.get("cinema-next").hidden,true);
 assert.equal(app.get("cinema-choices").children.length,3);
 app.get("cinema-choices").children[0].click(); // recover
 const saved=JSON.parse(app.store.get("helios-venus-v4"));
 assert.equal(saved.probeDiscovery,"recover");
 assert.equal(saved.cinematicSeen.includes("probe"),true);
 assert.equal(app.get("cinema").hidden,true);
 const reloaded=mount(app.store);
 assert.equal(JSON.parse(reloaded.store.get("helios-venus-v4")).probeDiscovery,"recover");
 assert.equal(reloaded.get("cinema").hidden,true);
});

test("players can skip a film and still choose a probe strategy in the mission UI",()=>{
 const app=mount();
 app.get("cinema-skip").click();
 app.get("session").click();
 app.get("projects").children[0].children.at(-1).click(); // archive
 app.get("layers").children[1].click(); // clouds
 app.get("projects").children[0].children.at(-1).click(); // probe
 app.get("cinema-skip").click();
 assert.equal(app.get("cinema").hidden,true);
 const projects=app.get("projects").children;
 const incident=projects.find(node=>node.className?.includes("signal-investigation"));
 assert.ok(incident);
 assert.ok(incident.children.length>=6);
 incident.children[2].click(); // broadcast option
 const saved=JSON.parse(app.store.get("helios-venus-v4"));
 assert.equal(saved.probeDiscovery,"broadcast");
 assert.equal(app.get("objective-title").textContent,"Создать орбитальную связь");
});

test("replaying cinematics never changes research budget or construction progress",()=>{
 const app=mount();
 app.get("cinema-skip").click();
 const first=JSON.parse(app.store.get("helios-venus-v4"));
 app.get("cinema-replay").click();
 assert.equal(app.get("cinema").hidden,false);
 app.get("cinema-skip").click();
 const after=JSON.parse(app.store.get("helios-venus-v4"));
 assert.equal(after.credits,first.credits);
 assert.equal(after.science,first.science);
 assert.deepEqual(after.completed,first.completed);
});
