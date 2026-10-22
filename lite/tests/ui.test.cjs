"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const code = ["engine.js", "game.js"].map(name => fs.readFileSync(path.join(root, name), "utf8"));
const expectedIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
class Element {
  constructor(tag="div") {
    this.tagName=tag; this.children=[]; this.textContent=""; this.disabled=false;this.events={};
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
