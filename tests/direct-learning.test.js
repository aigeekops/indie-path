import test from 'node:test';
import assert from 'node:assert/strict';
import {freeLibrary} from '../direct-learning.js';
import {focusCard} from '../growth-view.js';
import {nextAction} from '../progress.js';
import {personas,generateRoute,tasks} from '../data.js';
import {businessStages,acquisitionOptional} from '../business-learning.js';
import {marketTopicByTask} from '../market-content.js';
import {learningContent,learningAcceptance,safe} from '../learning-view.js';
import {resolveLesson} from '../lesson-materials.js';

test('六阶段卡片提供中文行动和模板，不把国外课程作为主入口',()=>{
 const html=freeLibrary(),main=html.split('<details class="technical-supplement">')[0];
 assert.equal((main.match(/>开始实践</g)||[]).length,6);
 assert.equal((main.match(/>打开模板</g)||[]).length,6);
 assert.ok(!main.includes('target="_blank"'));
 for(const s of businessStages){
  assert.ok(main.includes(`href="#/task/${s.task}"`));
  assert.ok(main.includes(`href="#/task/${s.task}/template"`));
  assert.ok(main.includes(s.card.title));assert.ok(main.includes(s.card.template));
  for(const detail of [s.watch,s.practice,s.output,s.accept])assert.ok(!main.includes(safe(detail)));
 }
 assert.ok(!html.includes('<details class="technical-supplement" open'));
});

test('个人路线将当前行动、补学章节和产出连起来，可直接打开精选资源',()=>{
 for(const {profile} of personas){
  const t=generateRoute(profile)[0],html=focusCard(nextAction(generateRoute(profile)),profile),lesson=resolveLesson(t,profile);
  assert.ok(html.includes(safe(lesson.practice[0].title)));
  assert.ok(html.includes(`href="#/route/task/${t.id}"`));
  assert.ok(html.includes(safe(lesson.readings[0].chapter)));
  assert.ok(html.includes(`href="${safe(lesson.readings[0].url)}"`));
  assert.ok(html.includes('target="_blank"'));
 }
});

test('六阶段精选章节在前，行动、模板、验收连续呈现，补充资料按需展开',()=>{
 for(const stage of businessStages){
  const task=tasks.find(t=>t.id===stage.task);
  for(const market of ['国内客户','海外市场（产品出海）','尚未确定']){
   const profile={...personas[0].profile,market};
   const html=learningContent(task,profile,{},tasks)+learningAcceptance(task);
   for(const detail of [stage.watch,stage.practice,stage.output,stage.accept])assert.ok(html.includes(safe(detail)),`${stage.id}: ${detail}`);
   assert.ok(html.indexOf('id="practice"')<html.indexOf('id="template"'));
   assert.ok(html.indexOf('id="resources"')<html.indexOf('id="practice"'));
   assert.ok(html.includes('class="task-section task-block lesson-study" name="task-panels" id="resources"'));
   assert.ok(html.includes('<details class="supplement-readings">'));
   for(const r of [stage.primary,...stage.secondary]){
    assert.ok(html.includes(safe(r.url)));assert.ok(html.includes(safe(r.chapter)));assert.ok(html.includes(safe(r.access)));
   }
   if(marketTopicByTask[task.id]&&market!=='尚未确定')assert.ok(html.includes(safe(market==='国内客户'?stage.domesticPractice:stage.exportPractice)));
   if(!marketTopicByTask[task.id])assert.ok(!html.includes('id="market-practice"'));
   if(stage.id==='acquisition')assert.equal(html.includes(acquisitionOptional.url),market==='海外市场（产品出海）');
   if(stage.id==='monetization')assert.ok(html.includes('#/task/charge'));
  }
 }
});

test('收费的中文行动不预设境外平台，接入资料按实际市场选读',()=>{
 const task=tasks.find(t=>t.id==='charge');
 for(const market of ['尚未确定','国内和海外','国内客户','海外市场（产品出海）']){
  const p={...personas[0].profile,market};const l=resolveLesson(task,p);
  assert.ok(!l.practice.some(s=>/Stripe|Checkout/.test(s.action)));
  if(market==='国内客户'){
   assert.ok(l.readings.some(r=>r.url.includes('pay.wechatpay.cn')));
   assert.ok(!l.readings.some(r=>r.url.includes('docs.stripe.com')));
  }
  if(market==='海外市场（产品出海）')assert.ok(l.readings.some(r=>r.url.includes('docs.stripe.com')));
 }
});
