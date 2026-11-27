import assert from 'node:assert/strict';
import { nodeLibrary } from './node-assets';
import { DEFAULT_PARAMS, yearsToAge, type HumanParams } from '../src/core/params';
import { buildHuman } from '../src/core/human';
import { dressing, garmentById } from '../src/core/garments';
import { STYLES, styleBlocked, applyStyle, genderPatch } from '../src/app/ui/quick-data';

const lib=await nodeLibrary();
const cat=lib.catalog;
const adult={...DEFAULT_PARAMS,age:yearsToAge(32),gender:1,detail:'medium' as const};
for(const s of STYLES){
 for(const gender of [0,.5,1]){
  const p={...adult,gender};
  const reason=styleBlocked(s,p,cat);
  assert.equal(reason,undefined,s.id+': '+reason);
  const next={...p,...applyStyle(p,s)};
  assert.equal(next.gender,gender);
  const patch=genderPatch(next,gender===1?'woman':'man',new Set()).patch;
  assert.deepEqual(Object.keys(patch),['gender'],'Body must not swap the outfit');
 }
}
for(const gender of [0,.5,1]){
 for(const weight of [.22,.8]){
  for(const id of ['wedding','cocktail_dress','business--woman']){
   const s=STYLES.find(x=>x.id===id)!;
   assert.ok(s,id);
   const p:HumanParams={...adult,gender,weight,muscle:gender===1?.8:.45,...applyStyle(adult,s),shoes:'heels',detail:'medium',accessories:[...new Set([...(applyStyle(adult,s).accessories??[]),'cross_tights_20'])]};
   assert.equal(dressing(p).footwear,'heels');
   const ch=await buildHuman(lib,p);
   assert.ok(ch.mesh.positions.length>0);
   assert.ok(ch.mesh.positions.every(Number.isFinite),id+' nonfinite positions');
   assert.ok(ch.mesh.normals.every(Number.isFinite),id+' nonfinite normals');
   assert.ok(ch.mesh.materials.some(m=>m.name.includes('Pantymedias')),id+' pantyhose not rendered');
   assert.ok(ch.mesh.groups.every(g=>g.indices.length>0));
   console.log('FIT',gender,weight,id,ch.mesh.positions.length/3);
  }
 }
}
for(const id of ['cross_tights_20','cross_tights_60','cross_tights_opaque'])assert.ok(garmentById.has(id));
console.log('Cross: all style choices and 18 actual garment builds passed');
