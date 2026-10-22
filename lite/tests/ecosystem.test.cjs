"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const api=require("../ecosystem.js");

test("three products have distinct roles and no claimed shop releases",()=>{
 assert.deepEqual(api.products.map(p=>p.id),["lite","mobile","pc"]);
 assert.equal(api.products[0].availability,"playable");
 assert.equal(api.products[1].availability,"development");
 assert.equal(api.products[2].availability,"development");
 for(const p of api.products){
  assert.ok(p.title&&p.pitch&&p.kind);
  assert.equal(api.isReleased(p),false);
 }
});

test("donation and paid episode offers are opt-in only after real checkout",()=>{
 assert.equal(api.hasPublishedLink(api.support),false);
 assert.equal(api.hasPublishedLink(api.paidEpisodes),false);
 assert.equal(api.hasPublishedLink({enabled:true,url:null}),false);
 assert.equal(api.hasPublishedLink({enabled:true,url:"javascript:alert(1)"}),false);
 assert.equal(api.hasPublishedLink({enabled:true,url:"http://example.org/pay"}),false);
 assert.equal(api.hasPublishedLink({enabled:true,url:"https://example.org/support"}),true);
});

test("unreleased game can never display purchase button only because URL exists",()=>{
 assert.equal(api.isReleased({availability:"development",url:"https://store.steampowered.com/app/123"}),false);
 assert.equal(api.isReleased({availability:"released",url:"https://store.steampowered.com/app/123"}),true);
 assert.equal(api.isReleased({availability:"released",url:"data:text/html,<script>"}),false);
 assert.equal(api.isSafePublicUrl("https://localhost/pay"),false);
 assert.equal(api.isSafePublicUrl("https://user:password@example.org/pay"),false);
});
