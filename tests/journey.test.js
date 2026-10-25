import test from 'node:test';
import assert from 'node:assert/strict';
import {stages} from '../stages.js';
import {tasks,personas,generateRoute} from '../data.js';
import {buildJourney,taskStatus} from '../journey.js';
import {actionMapPage} from '../action-view.js';
import {mapSelection,mapTaskHref} from '../map-view.js';
import {renderHome} from '../home-view.js';
const record=(task,decision='continue',extra={})=>({status:'done',criteria:JSON.stringify(task.checks),decision,date:'2026-10-25T00:00:00Z',note:'测试成果',observation:'测试反馈',...extra});

test('公共地图与五类路线使用同一六阶段，每项任务仅归属一次',()=>{
 assert.equal(stages.length,6);
 const ids=stages.flatMap(s=>s.taskIds);
 assert.equal(new Set(ids).size,tasks.length);
 assert.deepEqual([...ids].sort(),tasks.map(t=>t.id).sort());
 for(const profile of [null,...personas.map(p=>p.profile)]){
  const j=buildJourney({profile});
  assert.deepEqual(j.stages.map(s=>s.id),stages.map(s=>s.id));
  assert.equal(j.stages.reduce((n,s)=>n+s.tasks.length,0),j.list.length);
  assert.equal(j.stages.find(s=>s.current).entry.id,j.action.task.id);
  const html=actionMapPage(j);
  for(const stage of j.stages){assert.ok(html.includes(`data-map-stage="${stage.id}"`));assert.ok(stage.tasks.some(t=>t.id===stage.entry.id));const preview=actionMapPage(j,{}, {stageId:stage.id});assert.ok(preview.includes(`href="${mapTaskHref(j,stage.entry.id)}"`));}
  assert.ok(renderHome(profile,j).includes(`href="${j.stages.find(s=>s.current).href}"`));
 }
 assert.deepEqual(personas.map(p=>buildJourney({profile:p.profile}).stages[0].entry.id),['evidence','evidence','find','find','review']);
});
test('保存反馈同时改变地图推荐、阶段状态和自检数量，等待及停止不跳过',()=>{
 const profile=personas[0].profile,first=generateRoute(profile)[0];
 for(const decision of ['continue','adjust','observe','stop']){
  const records={[first.id]:record(first,decision,{nextTask:'verify'})};
  const j=buildJourney({profile,records});
  assert.equal(j.completed,1);assert.equal(j.stages[0].completed,1);
  if(decision==='adjust'){assert.equal(j.action.task.id,'verify');assert.equal(j.stages[2].status,'调整后再验证');}
  if(['stop','observe'].includes(decision)){
   assert.equal(j.stages[0].current,true);assert.equal(j.stages[0].href,`#/task/${first.id}/acceptance`);
  }
  const html=actionMapPage(j,records);
  assert.ok(html.includes(j.stages.find(s=>s.current).status));
  assert.ok(actionMapPage(j,records,{stageId:first.stageId,taskId:first.id}).includes(taskStatus(first,records)));
 }
});
test('补充任务参与同一推荐；市场改变后旧验收不误算完成',()=>{
 const profile={...personas[2].profile,market:'国内客户'};
 const j=buildJourney({profile,added:['evidence','evidence']});
 assert.equal(j.list.filter(t=>t.id==='evidence').length,1);
 assert.ok(j.stages[0].tasks.some(t=>t.id==='evidence'));
 const charge=j.list.find(t=>t.id==='charge');
 const records={charge:record(charge,'stop')};
 const changed=buildJourney({profile:{...profile,market:'海外市场（产品出海）'},records});
 assert.equal(changed.completed,0);assert.equal(changed.action.kind,'continue');
 assert.equal(taskStatus(changed.list.find(t=>t.id==='charge'),records),'成果待复核');
});
test('所有任务已自检仍可回看成果，不宣称经营成功',()=>{
 const profile=personas[4].profile,list=generateRoute(profile),records=Object.fromEntries(list.map(t=>[t.id,record(t)]));
 const j=buildJourney({profile,records});
 assert.equal(j.action.task,undefined);assert.equal(j.completed,list.length);
 for(const stage of j.stages){assert.equal(stage.status,'已自检');assert.ok(stage.href.endsWith('/acceptance'));}
 assert.ok(!actionMapPage(j,records).includes('已经盈利'));
});

test('地图原位选阶段和任务，学习与返回地址保留上下文',()=>{
 for(const profile of [null,...personas.map(p=>p.profile)]){
  const j=buildJourney({profile});
  for(const stage of j.stages){
   for(const task of stage.tasks){
    const selected=mapSelection(j,stage.id,task.id);
    assert.equal(selected.task.id,task.id);
    const html=actionMapPage(j,{}, {stageId:stage.id,taskId:task.id});
    assert.equal((html.match(/aria-label="任务预览"/g)||[]).length,1);
    assert.ok(html.includes(`href="${mapTaskHref(j,task.id)}"`));
    assert.ok(!html.includes('在我的路线中展开此阶段'));
    assert.ok(!html.includes('href="#/route/'));
    const learning=actionMapPage(j,{}, {stageId:stage.id,taskId:task.id},'<article>共享任务正文</article>');
    assert.ok(learning.includes(`data-map-return href="#/map/${stage.id}/${task.id}"`));
    assert.ok(!learning.includes('id="map-preview"'));
   }
  }
  assert.equal(mapSelection(j,'design','charge').task.stageId,'design');
  assert.equal(mapSelection(j,'invalid','invalid').task.id,j.action.task.id);
 }
});
