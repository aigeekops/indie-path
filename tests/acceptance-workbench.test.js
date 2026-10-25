import test from 'node:test';
import assert from 'node:assert/strict';
import {selfCheckRecord,blockerRecord,decisionRecord,selfCheckError,acceptanceEditor} from '../acceptance-workbench.js';
import {resultMatches} from '../acceptance.js';
import {resultReceipt,commitTaskRecord} from '../task-workbench.js';
import {buildJourney} from '../journey.js';
import {personas} from '../data.js';
const profile=personas[0].profile;
const list=buildJourney({profile}).list,task=list[0];
const href=(id,section='')=>`#/task/${id}${section?'/'+section:''}`;

test('引用草稿只做一次成果记录，反馈可留空，保存自检不替用户选择下一步',()=>{
 const draft='实际成果草稿 </pre><script>不执行</script>';
 const record=selfCheckRecord(task,null,{note:draft,source:'worksheet'});
 assert.equal(record.note,draft);assert.equal(record.observation,'');assert.equal(record.decision,null);assert.ok(resultMatches(record,task));
 const j=buildJourney({profile,records:{[task.id]:record}}),html=resultReceipt(task,j,record,href);
 assert.match(html,/下一步尚未选择/);assert.ok(html.includes('data-continue-task'));assert.ok(html.includes(href(list[1].id)));assert.ok(html.includes('&lt;script&gt;'));
 const editor=acceptanceEditor(task,null,null,draft,'原验收说明');
 assert.ok(editor.includes('data-source="worksheet"'));assert.ok(editor.includes('id="existing-reference" hidden'));assert.ok(editor.includes('原验收说明'));
 assert.ok(!editor.includes(' required'));assert.ok(!editor.includes('name="next-decision"'));assert.ok(!editor.includes('name="decision"'));
 assert.ok(selfCheckError(task,task.checks.map(()=>true),'')?.message);
 assert.ok(selfCheckError(task,task.checks.map(()=>false),draft)?.message);
 assert.equal(selfCheckError(task,task.checks.map(()=>true),draft),null);
});

test('独立保存下一步保留成果、条件和原始记录；保存失败回滚决定，不撤销已存自检',()=>{
 const record=selfCheckRecord(task,null,{note:'可追溯成果',observation:'原反馈'}),state={records:{[task.id]:record},worksheets:{[task.id]:'原草稿'}};
 const next=decisionRecord(task,record,{decision:'observe',observation:'等待回访'},list);
 assert.equal(next.note,record.note);assert.equal(next.criteria,record.criteria);assert.equal(next.observation,'等待回访');
 assert.equal(commitTaskRecord(state,task.id,next,undefined,()=>false),false);assert.equal(state.records[task.id],record);assert.ok(resultMatches(state.records[task.id],task));assert.equal(state.worksheets[task.id],'原草稿');
 assert.equal(commitTaskRecord(state,task.id,next,undefined,()=>true),true);assert.equal(buildJourney({profile,...state}).action.kind,'observe');
 assert.equal(decisionRecord(task,record,{decision:'adjust',nextTask:'不存在'},list),null);
 assert.equal(decisionRecord(task,{...record,criteria:'old'},{decision:'continue'},list),null);
 for(const decision of ['stop','observe','adjust']){const prior={...record,decision,nextTask:task.id};const updated=selfCheckRecord(task,prior,{note:'更新成果',observation:prior.observation});assert.equal(updated.decision,decision);assert.equal(updated.nextTask,decision==='adjust'?task.id:null);}
});

test('卡点只需原因，不增加完成数；已自检后记录卡点仍保留原成果、草稿与进度',()=>{
 const stuck=blockerRecord(task,null,{blocker:'不会实现或缺少前置知识'});
 assert.equal(stuck.status,'stuck');assert.equal(stuck.blockerNote,'');assert.equal(buildJourney({profile,records:{[task.id]:stuck}}).completed,0);
 const completed=selfCheckRecord(task,null,{note:'之前的完整成果',observation:'原反馈'}),record=blockerRecord(task,completed,{blocker:'结果不符合预期',note:'补充卡点'});
 assert.equal(record.status,'done');assert.equal(record.decision,null);assert.equal(record.blockerActive,true);assert.equal(record.note,completed.note);assert.equal(record.criteria,completed.criteria);assert.equal(record.observation,completed.observation);assert.ok(resultMatches(record,task));assert.equal(buildJourney({profile,records:{[task.id]:record}}).completed,1);
 const resolved=selfCheckRecord(task,stuck,{note:'完成后的成果'});assert.equal(resolved.status,'done');assert.equal(resolved.decision,null);assert.equal(resolved.blocker,null);
});

test('已完成卡点后的明确调整目标优先于原卡点，手填成果随卡点保存且不算完成',()=>{
 const completed=selfCheckRecord(task,null,{note:'已有成果'}),card=blockerRecord(task,completed,{blocker:'结果不符合预期'});
 const target=list[1],adjusted=decisionRecord(task,card,{decision:'adjust',nextTask:target.id},list);
 assert.equal(adjusted.blockerActive,false);assert.equal(adjusted.note,completed.note);
 const html=resultReceipt(task,buildJourney({profile,records:{[task.id]:adjusted}}),adjusted,href);
 assert.ok(html.includes(`href="${href(target.id,'practice')}"`));
 const draft=blockerRecord(task,null,{blocker:'不会实现或缺少前置知识',achievementNote:'自己手填的成果说明',achievementSource:'existing'});
 assert.equal(draft.note,'自己手填的成果说明');assert.equal(draft.noteSource,'existing');assert.equal(draft.status,'stuck');
 const receipt=resultReceipt(task,buildJourney({profile,records:{[task.id]:draft}}),draft,href);assert.ok(receipt.includes('<pre>自己手填的成果说明</pre>'));assert.ok(!receipt.includes('<p>自己手填的成果说明</p>'));
 const editor=acceptanceEditor(task,draft,null,undefined,'原验收说明');assert.ok(editor.includes('自己手填的成果说明'));
 assert.equal(buildJourney({profile,records:{[task.id]:draft}}).completed,0);
});

test('旧版已有成果确认记录经历卡点与重新自检，仍保留来源、决定和完成数',()=>{
 const old={status:'skipped',note:'此前已有的项目成果',criteria:JSON.stringify(task.checks),decision:'observe',observation:'原有回访计划',date:'2026-10-25T00:00:00Z'};
 const card=blockerRecord(task,old,{blocker:'结果不符合预期'});
 const html=acceptanceEditor(task,card,null,undefined,'原验收说明');
 assert.ok(html.includes('data-mode="stuck" data-complete-mode="skipped"'));
 const mode=html.match(/data-complete-mode="([^"]+)"/)[1];
 const updated=selfCheckRecord(task,card,{mode,note:card.note,source:'record',observation:card.observation});
 assert.equal(updated.status,'skipped');assert.equal(updated.note,old.note);
 assert.equal(updated.decision,'observe');assert.equal(updated.observation,old.observation);
 assert.ok(resultMatches(updated,task));assert.equal(buildJourney({profile,records:{[task.id]:updated}}).completed,1);
});
