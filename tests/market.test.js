import test from 'node:test';
import assert from 'node:assert/strict';
import {cases,marketSources,selectedCaseIds,marketContext,marketTask} from '../market-content.js';
import {tasks,personas,generateRoute} from '../data.js';
import {learningContent,searchTasks} from '../learning-view.js';
import {casePage,taskMarketContent,marketPlan} from '../market-view.js';
import {focusCard} from '../growth-view.js';
import {resultMatches} from '../acceptance.js';

test('国内与产品出海案例均保留七个教学章节，样例、实践、验收和决策可追溯',()=>{
 for(const c of Object.values(cases)){
  assert.equal(Object.keys(c.phases).length,7);
  for(const x of Object.values(c.phases)){
   assert.ok(x.learn.length>=3&&x.practice.length>=4&&x.checks.length>=4);
   assert.ok(x.artifact.includes('模拟')&&x.bad.includes('不合格'));
   assert.equal(x.branches.length,3);
   for(const b of x.branches)if(b.task)assert.ok(tasks.some(t=>t.id===b.task));
   for(const r of x.resources)assert.ok(r.chapter&&r.goal&&new URL(r.url).protocol==='https:');
  }
  const html=casePage(c.id,null);for(let n=1;n<=7;n++)assert.ok(html.includes(`id="case-phase-${n}"`));
 }
});
test('五种职业的国内和出海分支保留能力路线，但切换案例、支付资料和验收',()=>{
 for(const {profile} of personas){
  const domestic={...profile,market:'国内客户',customer:'企业或团队',language:'中文'};
  const overseas={...profile,market:'海外市场（产品出海）',customer:'个人或自由职业者',language:'英文',country:'美国'};
  const a=generateRoute(domestic),b=generateRoute(overseas);
  assert.deepEqual(a.map(t=>t.id),b.map(t=>t.id));
  assert.deepEqual(selectedCaseIds(domestic),['domestic']);assert.deepEqual(selectedCaseIds(overseas),['overseas']);
  const charge=id=>id.find(t=>t.id==='charge');
  assert.ok(learningContent(charge(a),domestic).includes('pay.wechatpay.cn'));
  assert.ok(learningContent(charge(b),overseas).includes('经营主体'));
  assert.notDeepEqual(charge(a).checks,charge(b).checks);
  const record={status:'done',criteria:JSON.stringify(charge(a).checks)};
  assert.equal(resultMatches(record,charge(b)),false);
 }
});
test('出海不等于移居或境外主体，国家/客户/语言有具体学习提示',()=>{
 const p={market:'海外市场（产品出海）',customer:'企业或团队',language:'英文',country:'美国'};
 const text=marketContext(p,6).join('');assert.ok(text.includes('产品出海')&&text.includes('采购')&&text.includes('美国')&&text.includes('不假设'));
 assert.ok(marketContext({...p,customer:'个人或自由职业者'},6).join('').includes('续费'));
 assert.equal(selectedCaseIds(null).length,2);
 const r=generateRoute({...personas[0].profile,...p});const r2=generateRoute({...personas[0].profile,...p,country:'日本'});
 assert.deepEqual(r[0].checks,r2[0].checks);
 assert.notDeepEqual(r.find(t=>t.id==='charge').checks,r2.find(t=>t.id==='charge').checks);
 const html=casePage('overseas',{...p,country:'<img src=x onerror=alert(1)>'});assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<img src=x'));
});
test('官方资料标明核验边界，搜索包含两条案例的章节和成果',()=>{
 for(const r of Object.values(marketSources))assert.ok(r.checkedAt&&r.note&&r.url.startsWith('https://'));
 assert.ok(marketSources.claudeRegions.note.includes('晚于'));
 assert.ok(marketSources.redbook.note.includes('正文未取得'));
 assert.ok(searchTasks(tasks,'商户订单号').some(x=>x.task.id==='charge'));
 assert.ok(searchTasks(tasks,'Product Hunt').some(x=>x.task.id==='reach'));
 assert.ok(cases.overseas.phases[4].resources.some(r=>r.url.includes('github-pages-limits')));
});

test('切换市场不改变共用技术教材、验收与已完成结果',()=>{
 for(const {profile} of personas){
  const a={...profile,market:'国内客户',language:'中文',customer:'企业或团队'};
  const b={...profile,market:'海外市场（产品出海）',language:'英文',customer:'个人或自由职业者',country:'美国'};
  const ra=generateRoute(a),rb=generateRoute(b);
  for(const id of ['find','evidence','service','scope','support','operate','contract','api','auth','verify']){
   const x=ra.find(t=>t.id===id)||marketTask(tasks.find(t=>t.id===id),a),y=rb.find(t=>t.id===id)||marketTask(tasks.find(t=>t.id===id),b);
   assert.deepEqual(x.checks,y.checks);
   assert.ok(resultMatches({status:'done',criteria:JSON.stringify(x.checks)},y));
   assert.equal(learningContent(x,a),learningContent(y,b));
  }
  assert.deepEqual(cases.domestic.phases[3].practice,cases.overseas.phases[3].practice);
 }
});

test('未定市场和双市场不默认出海，仅在获客、收费和交付提示本轮条件',()=>{
 for(const p of [null,{market:'尚未确定'},{market:'国内和海外'}]){
  assert.ok(!marketPlan(p).includes('case-mini'));
  for(const id of ['find','scope','operate']){
   const task=tasks.find(t=>t.id===id);
   assert.equal(taskMarketContent(task,p),'');
   assert.ok(!/海外客户|国内客户|产品出海怎么做/.test(focusCard({task,kind:'continue',reason:''},p)));
  }
  for(const id of ['reach','price','usability','charge']){
   const task=tasks.find(t=>t.id===id),card=focusCard({task,kind:'continue',reason:''},p),detail=taskMarketContent(task,p);
   assert.ok(detail.includes(p?.market==='国内和海外'?'本轮先选一个具体客户群':'目标市场尚未确定'));
   assert.ok(!/海外客户：|国内客户：|产品出海怎么做/.test(card));
   assert.ok(!detail.includes('class="case-detail" open'));
   assert.ok(detail.includes('本轮'));
  }
 }
});
