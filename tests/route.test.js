import test from 'node:test';
import assert from 'node:assert/strict';
import {personas,roles,generateRoute,blankProfile} from '../data.js';
test('五类起点对应预期的首个任务',()=>{
 assert.deepEqual(personas.map(p=>generateRoute(p.profile)[0].id),['evidence','evidence','find','find','review']);
});
test('只修改岗位不改变路线和跳过建议',()=>{
 for(const p of personas){
  const expected=generateRoute(p.profile).map(t=>[t.id,t.mode]);
  for(const role of roles)assert.deepEqual(generateRoute({...p.profile,roles:[role]}).map(t=>[t.id,t.mode]),expected);
 }
});
test('已有能力可验证跳过，未知能力保持待实践',()=>{
 const frontend=generateRoute(personas[2].profile);
 assert.equal(frontend.find(t=>t.id==='ui').mode,'confirm');
 assert.equal(frontend.find(t=>t.id==='verify').mode,'required');
 const p=blankProfile();assert.equal(generateRoute(p).find(t=>t.id==='ai-cost').mode,'required');
});
test('服务产品化依赖真实服务经历，不依赖运营岗位',()=>{
 assert.ok(generateRoute(personas[1].profile).some(t=>t.id==='service'));
 assert.ok(!generateRoute({...personas[1].profile,serviceMode:false}).some(t=>t.id==='service'));
 assert.ok(generateRoute({...personas[1].profile,roles:['后端']}).some(t=>t.id==='service'));
});
test('路线始终保留关键经营阶段，没有重复任务',()=>{
 for(const p of personas){const list=generateRoute(p.profile);assert.equal(new Set(list.map(t=>t.id)).size,list.length);for(const id of ['scope','price','verify','charge','operate'])assert.ok(list.some(t=>t.id===id));}
});
test('已有付费的用户不再收到未付费原因任务',()=>{
 const list=generateRoute({...personas[4].profile,paid:true});
 assert.equal(list[0].title,'回访付费用户，核对价值与交付');
});
