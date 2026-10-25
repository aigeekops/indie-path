import test from 'node:test';
import assert from 'node:assert/strict';
import {personalRoute,routeTaskHref,globalRoute} from '../route-view.js';
import {buildJourney} from '../journey.js';
import {personas,tasks} from '../data.js';
import {learningContent,learningAcceptance} from '../learning-view.js';

test('五类路线以同一推荐任务进入原位工作区，等待反馈仍进入原决定',()=>{
 for(const {profile} of personas){
  const j=buildJourney({profile}),task=j.action.task,html=personalRoute(j);
  assert.ok(html.includes(`href="${routeTaskHref(task.id)}"`));
  assert.ok(html.indexOf('route-focus')<html.indexOf('id="route-stages-title"'));
  assert.ok(html.includes('data-route-panel="profit"'));
  assert.ok(!html.includes('id="profit-form"'));
  assert.equal((html.match(/<h1>/g)||[]).length,1);
  assert.ok(!html.includes('route-sidebar'));
  const records={[task.id]:{status:'done',criteria:JSON.stringify(task.checks),decision:'observe',observation:'等待回访',date:'2026-10-25T01:00:00Z'}};
  const held=personalRoute(buildJourney({profile,records}),{records});
  assert.ok(held.includes(`href="${routeTaskHref(task.id,'acceptance')}"`));
  assert.ok(held.includes('等待真实反馈'));
  const expanded=personalRoute(j,{taskMarkup:'<article data-task-id="test">工作区</article>'});
  assert.ok(expanded.includes('data-task-id="test"'));
  assert.ok(!expanded.includes('route-focus'));
  assert.ok(!expanded.includes('id="route-stages-title"'));
  assert.ok(!expanded.includes('route-support'));
  assert.ok(!expanded.includes('data-route-panel')); 
 }
});

test('原位任务保留已存草稿、前置学习与收费入口，不把草稿当完成',()=>{
 const profile=personas[0].profile,task=tasks.find(t=>t.id==='api');
 const draft='交互验收草稿 </textarea><script>不执行</script>';
 const html=learningContent(task,profile,{},tasks,{taskHref:routeTaskHref,worksheet:draft});
 assert.ok(html.includes('data-worksheet-id="api"'));
 assert.ok(html.includes('交互验收草稿 &lt;/textarea&gt;&lt;script&gt;'));
 assert.ok(html.includes('草稿单独保存'));
 assert.ok(html.includes('href="#/route/task/contract"'));
 assert.ok(learningAcceptance(tasks.find(t=>t.id==='price'),routeTaskHref).includes('href="#/route/task/charge"'));
 assert.ok(learningContent(task,profile,{},tasks).includes('id="save-worksheet"'));
 assert.ok(!html.includes('class="lesson-example-details" id="example" open'));
});

// 全局入口与页面总览使用同一派生状态，不另存完成数量。
test('全局面板可在所有页面查看路线，区分正在查看与当前建议，按需查看经营和资料',()=>{
 assert.equal(globalRoute(buildJourney({})), '');
 const profile=personas[0].profile,j=buildJourney({profile}),recommended=j.action.task;
 const viewed=j.list.find(t=>t.id!==recommended.id);
 const html=globalRoute(j,{activeTaskId:viewed.id});
 assert.ok(html.includes('aria-haspopup="dialog"'));
 assert.ok(html.includes('正在查看 · '));
 assert.ok(html.includes('当前建议 · '));
 assert.ok(html.includes('data-route-pane="profit" hidden'));
 assert.ok(html.includes('data-route-pane="profile" hidden'));
 assert.ok(html.includes('id="profit-form"'));
 assert.ok(html.includes('id="edit-profile"'));
 assert.ok(html.includes(`data-route-task="${viewed.id}" class="route-task selected-task" aria-current="page"`));
 const records={[recommended.id]:{status:'done',criteria:JSON.stringify(recommended.checks),decision:'continue',date:'2026-10-25T01:00:00Z'}};
 const updated=globalRoute(buildJourney({profile,records}),{records});
 assert.ok(updated.includes('<strong>1/'));
 assert.ok(updated.includes('已自检</span>'));
 const stale={[recommended.id]:{...records[recommended.id],criteria:'old'}};
 assert.ok(globalRoute(buildJourney({profile,records:stale}),{records:stale}).includes('成果待复核'));
});
