import test from 'node:test';
import assert from 'node:assert/strict';
import {blankProfile,personas,generateRoute,tasks} from '../data.js';
import {resolveLesson} from '../lesson-materials.js';
import {buildJourney} from '../journey.js';
import {resultMatches} from '../acceptance.js';
import {learningContent} from '../learning-view.js';
import {content} from '../generated/content.js';
import {mapPreview} from '../map-view.js';

test('五类用户及网页、应用、小程序共用内容实践，归入地图相同阶段且不重复',()=>{
 for(const base of [blankProfile(),...personas.map(p=>p.profile)]){
  for(const form of ['网页产品','移动端','微信小程序']){
   const profile={...base,form},route=generateRoute(profile,['content-plan','content-review']);
   const ids=route.map(t=>t.id),acquisition=ids.findIndex(id=>['reach','app-store-growth','wx-growth'].includes(id));
   const operation=ids.findIndex(id=>['operate','app-operations','wx-operations'].includes(id));
   assert.equal(ids[acquisition+1],'content-plan');
   assert.equal(ids[operation-1],'content-review');
   assert.equal(ids.filter(id=>id==='content-plan').length,1);
   assert.equal(ids.filter(id=>id==='content-review').length,1);
   const journey=buildJourney({profile});
   assert.ok(journey.stages.find(s=>s.id==='acquisition').tasks.some(t=>t.id==='content-plan'));
   assert.ok(journey.stages.find(s=>s.id==='operations').tasks.some(t=>t.id==='content-review'));
   const stage=journey.stages.find(s=>s.id==='acquisition');
   const preview=mapPreview(journey,{},stage,stage.tasks.find(t=>t.id==='content-plan'));
   assert.ok(!preview.includes('[微信公众平台]('));
  }
 }
});

test('按市场排列选读但保留四平台，资源链接渲染且发布与复盘可交接',()=>{
 for(const id of ['content-plan','content-review']){
  const task=tasks.find(t=>t.id===id);
  for(const [market,first] of [['国内客户','social-wechat'],['海外市场（产品出海）','social-x'],['尚未确定',id==='content-plan'?'content-marketing-course':'retention-analysis']]){
   const profile={...blankProfile(),market},lesson=resolveLesson(task,profile);
   assert.equal(lesson.readings[0].contentPath,'content/sources/'+first+'.md');
   const sourceIds=lesson.readings.map(r=>r.contentPath);
   for(const source of ['social-wechat','social-xiaohongshu','social-x',id==='content-plan'?'social-youtube':'social-youtube-review'])assert.ok(sourceIds.includes('content/sources/'+source+'.md'));
   for(const title of Object.keys(lesson.stepReadings))assert.ok(lesson.practice.some(s=>s.title===title));
   for(const field of ['内容编号','用户代号','订单','未知','工时'])assert.ok(lesson.template.includes(field),id+':'+field);
   const html=learningContent(task,profile,{},tasks);
   assert.ok(html.includes('href="https://creator.xiaohongshu.com/"'));
   assert.ok(html.includes('href="https://mp.weixin.qq.com/"'));
   assert.ok(!html.includes('[微信公众平台]('));
  }
 }
 const review=resolveLesson(tasks.find(t=>t.id==='content-review'),blankProfile());
 assert.match(review.example,/3\/6/);assert.match(review.example,/1\/3/);assert.match(review.example,/1\/2/);
 assert.match(review.example,/14美元/);assert.match(review.practice.map(s=>s.action).join(' '),/不能除以0/);
 assert.match(content.readings['social-wechat'].note,/未取得/);
 assert.match(content.readings['social-xiaohongshu'].note,/未取得完整正文/);
});

test('旧经营成果与草稿保留，新任务没有凭空完成，旧内容计划按新标准复核',()=>{
 const profile=personas[0].profile,old=tasks.find(t=>t.id==='operate');
 const records={operate:{status:'done',criteria:JSON.stringify(old.checks),date:'2026-10-25T10:00:00Z'},'content-plan':{status:'done',criteria:JSON.stringify(['选题有用户问题出处']),date:'2026-10-25T10:00:00Z'}};
 const before=JSON.stringify(records),journey=buildJourney({profile,records});
 assert.ok(resultMatches(records.operate,journey.list.find(t=>t.id==='operate')));
 assert.ok(!resultMatches(records['content-plan'],journey.list.find(t=>t.id==='content-plan')));
 assert.equal(journey.completed,1);
 assert.ok(!resultMatches(undefined,journey.list.find(t=>t.id==='content-review')));
 assert.equal(JSON.stringify(records),before);
});
