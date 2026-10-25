import test from 'node:test';
import assert from 'node:assert/strict';
import {content} from '../generated/content.js';
import {tasks,generateRoute} from '../data.js';
import {learningContent} from '../learning-view.js';

const gates=id=>content.curriculum[id].cnGate;

test('国内落地门槛只在写到的任务出现，内容只指向 HTTPS 官方页面',()=>{
 const withGate=tasks.filter(t=>gates(t.id)).map(t=>t.id);
 assert.ok(withGate.length>=12,'至少覆盖变现与合规链上的任务');
 assert.ok(withGate.includes('cn-gates'));
 assert.ok(withGate.includes('charge'));
 assert.ok(withGate.includes('app-release'));
 for(const id of withGate){
  const body=gates(id);
  assert.ok(body.trim().length>40,`${id} 的门槛章节过于简短`);
  for(const href of body.match(/\]\(([^)]+)\)/g)||[]){
   const target=href.slice(2,-1);
   if(target.startsWith('#/'))continue;
   assert.ok(/^https:\/\//.test(target),`${id} 出现非 HTTPS 链接 ${target}`);
  }
  // 政策类内容不给出具体金额或天数结论，避免页面改版后留下错误硬结论。
  assert.ok(!/\d+\s*个?工作日/.test(body)&&!/\d+\s*年有效期内/.test(body),`${id} 不应写死办理时限`);
 }
 const without=tasks.find(t=>!gates(t.id));
 assert.ok(!learningContent(without,{},{},tasks).includes('国内要过哪些关'),'未写章节的任务不显示该面板');
});

test('门槛核查任务的完成标准必须能证伪：写出本轮不做的事',()=>{
 const gate=tasks.find(t=>t.id==='cn-gates');
 assert.ok(gate,'cn-gates 任务存在');
 assert.equal(gate.track,'core','门槛核查属于必修主干');
 assert.ok(gate.checks.some(c=>c.includes('本轮不做')||c.includes('做不到')),'完成标准必须要求写出做不到的项');
 assert.ok(gate.checks.some(c=>c.includes('来源页面标题')&&c.includes('查询日期')),'每条结论要有来源与日期');
 assert.ok(content.curriculum['cn-gates'].template.includes('因此本轮不做什么'));
 assert.ok(generateRoute({}).some(t=>t.id==='cn-gates'),'默认路线包含门槛核查');
});

test('新增的国内资料都标了真实核验日期与证据边界',()=>{
 const ids=['cn-software-copyright','cn-miit','wxpay-applyment','alipay-open','alipay-docs','wx-categories','wx-minigame-rules','apple-review-cn','apple-small-business','mobile-oppo-release','mobile-vivo-release','mobile-tencent-release'];
 for(const id of ids){
  const source=content.readings[id];
  assert.ok(source,`${id} 已登记`);
  assert.equal(source.checkedAt,'2026-10-25',`${id} 需要真实核验日期`);
  assert.ok(/^https:\/\//.test(source.url));
  assert.ok(source.chapter&&source.goal,`${id} 需要选读范围与阅读终点`);
  assert.ok(source.note&&/实测|未验证/.test(source.note),`${id} 需要写明核验边界`);
 }
});
