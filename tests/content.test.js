import test from 'node:test';
import assert from 'node:assert/strict';
import {tasks,personas,generateRoute,blankProfile,CORE_TRACK} from '../data.js';
import {curriculum,adaptLesson} from '../curriculum.js';
import {searchTasks,learningContent} from '../learning-view.js';
import {content} from '../generated/content.js';

test('每项任务有完整教学结构和可定位的原始资源',()=>{
 for(const t of tasks){
  const c=curriculum[t.id];assert.ok(c,t.id);
  for(const key of ['why','prerequisite','template','example','next'])assert.ok(c[key]?.trim(),t.id+':'+key);
  assert.ok(c.practice.length>=4,t.id);
  assert.ok(t.checks.length>=2&&c.deliverables.length>=2);
  for(const s of c.practice)assert.ok(s.title&&s.action&&s.result);
  for(const r of c.readings){assert.equal(new URL(r.url).protocol,'https:');assert.ok(r.chapter&&r.goal&&r.checkedAt);}
  assert.ok(learningContent(t,null).includes('id="template"'));
 }
});

test('没有开发基础的产品/运营有桥接，已有开发经验不重复入门',()=>{
 for(const p of personas){const ids=generateRoute(p.profile).map(t=>t.id);
  assert.equal(ids.includes('code-basics'),['产品','运营'].includes(p.role));
  if(ids.includes('code-basics'))assert.ok(ids.indexOf('code-basics')<ids.indexOf('ai-cost'));
  assert.ok(ids.indexOf('price')<ids.indexOf('charge'));
  assert.ok(ids.indexOf('scope')<ids.indexOf('ship'));
  assert.ok(ids.indexOf('ai-cost')<ids.indexOf('ai-evaluation'));}
});

test('必修主干与目录分级一致，网页路线只从必修派生',()=>{
 assert.equal(CORE_TRACK.length,25);
 assert.deepEqual(CORE_TRACK.slice().sort(),tasks.filter(t=>t.track==='core').map(t=>t.id).sort());
 assert.equal(new Set(CORE_TRACK).size,CORE_TRACK.length);
 for(const id of generateRoute(blankProfile()).map(t=>t.id)){
  const task=tasks.find(t=>t.id===id);
  assert.equal(task.track==='core'||id==='service',true,id);
 }
 for(const stage of new Set(tasks.filter(t=>t.track==='core').map(t=>t.stageId)))assert.ok(stage);
});

test('起步包四件套渲染为可复制区块，边界单独列出',()=>{
 const ids=content.scaffoldedCoreIds;
 assert.ok(ids.length>=3,ids.join(','));
 for(const id of ids){
  const task=tasks.find(t=>t.id===id),l=curriculum[id];
  for(const key of ['starter','prompts','exemplar','aiBoundary'])assert.ok(l[key]?.length,id+':'+key);
  const html=learningContent(task,null);
  assert.ok(html.includes('class="starter-kit"'),id);
  assert.ok(html.includes('id="starter-code"')&&html.includes('data-copy="#starter-code"'),id);
  assert.ok(html.includes('id="prompt-code"')&&html.includes('data-copy="#prompt-code"'),id);
  assert.ok(html.includes('class="ai-boundary"'),id);
 }
 const plain=tasks.find(t=>!ids.includes(t.id));
 assert.ok(!learningContent(plain,null).includes('class="starter-kit"'),plain.id);
});

test('技术路径和真实付费状态会调整教材，而非只改标题',()=>{
 const api=tasks.find(t=>t.id==='api');
 assert.ok(adaptLesson(api,personas[3].profile).readings.every(r=>r.url.includes('fastapi')));
 assert.ok(adaptLesson(api,personas[2].profile).readings.every(r=>r.url.includes('fullstackopen')));
 const p={...personas[4].profile,paid:true};const t=generateRoute(p)[0];const l=adaptLesson(t,p);
 assert.ok(l.practice.some(s=>s.action.includes('退款')));
 assert.ok(!t.checks.some(s=>s.includes('未付款')));
});

test('全局搜索覆盖具体章节、步骤、模板和卡点',()=>{
 for(const [q,id] of [['不会编程','code-basics'],['Session Dependency','api'],['重复事件','charge'],['现金','operate'],['逐步点击','usability']]){
  assert.ok(searchTasks(tasks,q).some(x=>x.task.id===id),q);
 }
});

test('未知起点保留诊断，不把未知当已有经验',()=>{
 const route=generateRoute(blankProfile());
 assert.ok(route.some(t=>t.id==='web-basics'));assert.ok(route.some(t=>t.id==='code-basics'));
 assert.equal(new Set(tasks.map(t=>t.id)).size,tasks.length);
});

test('接口类实践按需加入，单项产品经验不跳过接口约定',()=>{
 const reference=['contract','api','auth'];
 const base=generateRoute(blankProfile()).map(t=>t.id);
 assert.ok(!reference.some(id=>base.includes(id)),'契约与接口不再自动进入默认主干');
 const added=generateRoute(blankProfile(),reference).map(t=>t.id);
 assert.equal(added.slice(0,base.length).join(),base.join(),'手填任务追加在主干之后，不打乱既有顺序');
 assert.ok(added.indexOf('contract')<added.indexOf('api'));
 assert.ok(added.indexOf('api')<added.indexOf('auth'));
 assert.equal(generateRoute(blankProfile(),['contract']).find(t=>t.id==='contract').mode,'required');
 assert.ok(curriculum.contract.practice.some(s=>s.action.includes('无需提前实现')));
});

test('资源覆盖实际练习：状态、写请求、Python身份与测试、部署持久化',()=>{
 const byId=id=>tasks.find(t=>t.id===id);
 const ui=adaptLesson(byId('ui'),personas[3].profile);
 for(const part of ['java_script','component_state_event_handlers','altering_data_in_server'])assert.ok(ui.readings.some(r=>r.url.includes(part)),part);
 assert.ok(adaptLesson(byId('auth'),personas[3].profile).readings.some(r=>r.url.includes('oauth2-jwt')));
 assert.ok(adaptLesson(byId('verify'),personas[3].profile).readings.some(r=>r.url.includes('fastapi.tiangolo.com/tutorial/testing')));
 assert.ok(adaptLesson(byId('ship'),personas[3].profile).readings.some(r=>r.url.includes('deploy-fastapi')));
 assert.ok(adaptLesson(byId('ship'),personas[2].profile).readings.some(r=>r.url.includes('deploy-node-express')));
 assert.ok(searchTasks(tasks,'Handle JWT tokens').some(x=>x.task.id==='auth'));
});
