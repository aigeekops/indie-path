import test from 'node:test';
import assert from 'node:assert/strict';
import {tasks,generateRoute,blankProfile,personas} from '../data.js';
import {curriculum,prerequisiteIds} from '../curriculum.js';
import {libraryModel} from '../library-view.js';
import {freeCourses,technicalReadings} from '../direct-learning.js';
import {learningContent} from '../learning-view.js';

const additions={discovery:['segment','alternatives','validation-experiment'],design:['positioning','landing-page','onboarding'],delivery:['ai-cost','ai-evaluation','mobile-performance'],acquisition:['content-plan','search-demand','community-launch','sales-demo'],monetization:['pricing-experiment','trial-conversion','entitlements'],operations:['retention','prioritization']};
const ids=Object.values(additions).flat();
test('扩展可从阶段目录进入、搜索和手动加入，内容计划进入默认路线',()=>{
 assert.equal(ids.length,18);
 const reference=ids.filter(id=>tasks.find(t=>t.id===id).track==='reference');
 for(const profile of [blankProfile(),...personas.map(p=>p.profile)]){
  const before=generateRoute(profile).map(t=>t.id);
  assert.ok(before.includes('content-plan'));
  assert.ok(!before.some(id=>reference.includes(id)));
  const withAdded=generateRoute(profile,ids).map(t=>t.id);
  assert.deepEqual(withAdded.slice(0,before.length),before);
  for(const id of ids)assert.equal(withAdded.filter(x=>x===id).length,1);
 }
 for(const [stage,added] of Object.entries(additions)){
  const visible=libraryModel({stage}).groups.flatMap(s=>s.tasks.map(t=>t.id));
  for(const id of added){
   assert.ok(visible.includes(id),id);
   const t=tasks.find(t=>t.id===id);
   assert.ok(libraryModel({query:t.title}).groups.flatMap(s=>s.tasks).some(x=>x.id===id));
   for(const p of prerequisiteIds(id,blankProfile()))assert.ok(tasks.some(t=>t.id===p));
   for(const reading of curriculum[id].readings)assert.match(reading.access,/免费/);
   assert.match(curriculum[id].example,/教学模拟/);
   const html=learningContent(t,null,{},tasks);
   assert.ok(html.includes('id="template"'));
   assert.ok(html.includes('id="practice"'));
  }
 }
});

test('有公开评价的课程展示可追溯依据，文档大纲不冒充系统推荐',()=>{
 const html=technicalReadings();
 assert.equal(freeCourses.filter(c=>c.tier==='core').length,4);
 for(const c of freeCourses){
  assert.ok(c.reason&&c.limits);
  assert.ok(tasks.some(t=>t.id===c.task));
  assert.ok(html.includes(c.html.reason));
  if(c.tier==='core')assert.match(c.html.reason,/<a href="https:/);
 }
 assert.ok(html.includes('有公开评价的课程'));assert.ok(html.includes('文档与大纲'));
 // 课程按证据充分程度分组，不与任务的必修 / 参考分级混用同一套说法。
 assert.ok(!html.includes('>核心课程<'));assert.ok(!html.includes('>实操与补充参考<'));
 assert.equal(freeCourses.find(c=>c.name.includes('CS146S')).tier,'reference');
 assert.match(curriculum['ai-cost'].prerequisite,/可能收费|按量计费/);
});
