import test from 'node:test';
import assert from 'node:assert/strict';
import {personas,generateRoute} from '../data.js';
import {buildJourney} from '../journey.js';
import {resultReceipt,commitTaskRecord} from '../task-workbench.js';
import {routeTaskHref} from '../route-view.js';
test('保存回执与路线推荐一致，等待和停止不出现继续任务入口',()=>{
 const profile=personas[0].profile,[first,second]=generateRoute(profile);
 for(const decision of ['continue','adjust','observe','stop']){
  const record={status:'done',note:'验收用成果',observation:'验收用反馈',criteria:JSON.stringify(first.checks),decision,nextTask:first.id,date:'2026-10-25T08:00:00Z'};
  const j=buildJourney({profile,records:{[first.id]:record}}),html=resultReceipt(first,j,record,routeTaskHref);
  assert.equal(j.completed,1);assert.ok(html.includes(`已自检 1 / ${j.list.length} 项`));
  if(decision==='continue')assert.ok(html.includes(routeTaskHref(second.id)));
  if(decision==='adjust')assert.ok(html.includes(routeTaskHref(first.id,'practice')));
  if(['observe','stop'].includes(decision)){assert.ok(!html.includes('进入下一项任务'));assert.ok(!html.includes('返回实践调整'));assert.ok(!html.includes('data-continue-task'));assert.match(html,/已保存下一步/);}
 }
});
test('保存失败回滚成果与模板，成功才更新；卡点不计为完成',()=>{
 const profile=personas[0].profile,task=generateRoute(profile)[0],state={records:{},worksheets:{[task.id]:'之前草稿'}};
 const record={status:'stuck',note:'未完成',blocker:'不会实现',date:'2026-10-25T09:00:00Z'};
 assert.equal(commitTaskRecord(state,task.id,record,'新草稿',()=>false),false);assert.deepEqual(state.records,{});assert.equal(state.worksheets[task.id],'之前草稿');
 assert.equal(commitTaskRecord(state,task.id,record,'新草稿',()=>true),true);assert.equal(state.worksheets[task.id],'新草稿');assert.equal(buildJourney({profile,...state}).completed,0);
 const html=resultReceipt(task,buildJourney({profile,...state}),record,routeTaskHref);assert.match(html,/卡点已记录/);assert.match(html,/返回实践调整/);
});
