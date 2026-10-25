import test from 'node:test';
import assert from 'node:assert/strict';
import {blankProfile,generateRoute,personas} from '../data.js';
import {profilePreview,routeChanges} from '../profile-preview.js';
import {buildJourney} from '../journey.js';
import {renderHome} from '../home-view.js';
test('实时预览与提交后的路线使用同一任务顺序，岗位标签不改变建议',()=>{
 for(const {profile} of personas){const list=generateRoute(profile),html=profilePreview(profile);for(const t of list)assert.ok(html.includes(t.title));assert.match(html,new RegExp(`<strong>${list.length}</strong>`));assert.deepEqual(routeChanges(list,generateRoute({...profile,roles:['测试']})),{added:[],removed:[],changed:[]});}
});
test('能力改变能解释基础课移除与成果确认，服务经历加入专项实践',()=>{
 const p=blankProfile(),before=generateRoute(p);p.skills.frontend=2;
 const delta=routeChanges(before,generateRoute(p));assert.deepEqual(delta.removed.map(t=>t.id),['web-basics','code-basics']);assert.ok(delta.changed.some(t=>t.id==='ui'&&t.mode==='confirm'));
 const html=profilePreview(p,{before});assert.match(html,/移出：/);assert.match(html,/可用成果确认：/);
 const original=generateRoute(p);p.serviceMode=true;assert.deepEqual(routeChanges(original,generateRoute(p)).added.map(t=>t.id),['service']);
});
test('首页六节点与真实阶段任务共用链接，目标输入按文本转义',()=>{
 const j=buildJourney();const html=renderHome(null,j);assert.equal((html.match(/data-stage=/g)||[]).length,6);assert.equal((html.match(/data-wire=/g)||[]).length,5);assert.ok(html.includes(`href="${j.stages[0].href}"`));assert.ok(!profilePreview({...blankProfile(),incomeGoal:'<script>'}).includes('<script>'));
});
test('出海只更新实际受影响任务的验收条件，不生成另一套技术路线',()=>{
 const p=blankProfile(),before=generateRoute(p),after={...p,market:'海外市场（产品出海）'};
 const delta=routeChanges(before,generateRoute(after));assert.equal(delta.added.length,0);assert.equal(delta.removed.length,0);assert.equal(delta.changed.length,6);
 assert.match(profilePreview(after,{before,field:'market'}),/6 项任务的市场验收条件，技术主线不变/);
});

 test('首页示例为公共路线和五类用户关联真实任务、首选资源与章节',async()=>{
 const {content}=await import('../generated/content.js');
 const {tasks}=await import('../data.js');
 const {resolveLesson}=await import('../lesson-materials.js');
 const {renderExample}=await import('../home-example.js');
 const {mapTaskHref}=await import('../map-view.js');
 const {safe}=await import('../learning-view.js');
 const steps=content.guides['home-example'].walkthrough;
 assert.equal(steps.length,4);
 for(const profile of [null,...personas.map(p=>p.profile)]){
  const journey=buildJourney({profile}),html=renderExample(journey);
  assert.equal((html.match(/aria-selected="true"/g)||[]).length,1);
  assert.equal((html.match(/inert aria-hidden="true"/g)||[]).length,3);
  for(const step of steps){
   const task=journey.list.find(t=>t.id===step.task)||tasks.find(t=>t.id===step.task);
   const reading=resolveLesson(task,journey.profile).readings[0];
   assert.ok(reading?.url&&reading?.chapter);
   assert.ok(html.includes(`href="${mapTaskHref(journey,step.task)}"`));
   assert.ok(html.includes(safe(reading.url))&&html.includes(safe(reading.chapter)));
  }
 }
 });
