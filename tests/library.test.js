import test from 'node:test';
import assert from 'node:assert/strict';
import {libraryEntry,libraryModel,libraryPage,libraryResults} from '../library-view.js';
import {tasks,personas} from '../data.js';
import {stages} from '../stages.js';
import {buildJourney} from '../journey.js';
import {searchTasks} from '../learning-view.js';
import {freeCourses} from '../direct-learning.js';

test('实践指南只有一套主任务目录，保留全部任务与原说明、技术选读及专题入口',()=>{
 const model=libraryModel(),html=libraryPage();
 assert.equal(model.shown,tasks.length);assert.equal(model.groups.length,6);
 const ids=model.groups.flatMap(s=>s.tasks.map(t=>t.id));assert.equal(new Set(ids).size,tasks.length);
 assert.deepEqual([...ids].sort(),tasks.map(t=>t.id).sort());
 assert.equal((html.match(/data-library-task=/g)||[]).length,tasks.length);
 assert.ok(!html.includes('class="business-grid"'));assert.ok(!html.includes('class="library-grid"'));
 assert.ok(html.includes('<details class="catalog-help" id="library-help">'));
 assert.ok(html.includes('真实访谈、使用、交易与持续价值分别记录'));
 for(const href of ['#/learn','#/topics','#/cases','#/sources'])assert.ok(html.includes(`href="${href}"`));
 for(const source of freeCourses.filter(c=>c.task!=='find'))assert.ok(html.includes(source.resource.url.replaceAll('&','&amp;')));
});

test('搜索与六阶段筛选取交集，阶段数量随搜索更新，空结果可以清除条件',()=>{
 for(const stage of stages){
  const model=libraryModel({stage:stage.id});assert.equal(model.shown,stage.taskIds.length);
  assert.deepEqual(model.groups.flatMap(s=>s.tasks.map(t=>t.id)),stage.taskIds);
 }
 const query='接口',stage='delivery',model=libraryModel({query,stage});
 const expected=searchTasks(tasks,query).map(x=>x.task.id).filter(id=>stages.find(s=>s.id===stage).taskIds.includes(id));
 assert.deepEqual(model.groups.flatMap(s=>s.tasks.map(t=>t.id)).sort(),expected.sort());
 assert.equal(model.counts.all,searchTasks(tasks,query).length);
 const empty=libraryModel({query:'没有这个任务xyz'});assert.equal(empty.shown,0);
 assert.ok(libraryResults(empty).includes('id="library-reset"'));
 assert.ok(libraryPage({query:'"<script>'}).includes('&quot;&lt;script&gt;'));
});

test('目录入口读取原草稿与当前验收条件，区分继续填写、已自检、待复核与卡点',()=>{
 const j=buildJourney({profile:personas[0].profile}),task=j.list[0];
 assert.equal(libraryEntry(task).action,'开始实践');
 const state={worksheets:{[task.id]:''},records:{}};
 assert.equal(libraryEntry(task,state).section,'template');
 assert.equal(libraryEntry(task,state).status,'有草稿');
 const record={status:'done',criteria:JSON.stringify(task.checks),decision:'observe',date:'2026-10-25T08:00:00Z'};
 state.records[task.id]=record;const before=JSON.stringify(state);
 const model=libraryModel({...state,taskList:j.list});
 assert.equal(model.groups.flatMap(s=>s.tasks).find(t=>t.id===task.id).entry.action,'查看成果');
 assert.ok(libraryResults(model).includes(`href="#/task/${task.id}/acceptance"`));
 assert.equal(JSON.stringify(state),before);
 assert.equal(libraryEntry(task,{records:{[task.id]:{...record,criteria:'old'}}}).status,'待复核');
 assert.equal(libraryEntry(task,{records:{[task.id]:{status:'stuck'}}}).status,'卡点已记录');
 assert.equal(libraryEntry(task,{drafts:new Map([[task.id,{dirty:true}]])}).status,'输入暂存');
 assert.equal(libraryEntry(task,{drafts:new Map([[task.id,{checks:[true]}]])}).section,'acceptance');
});
