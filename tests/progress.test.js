import test from 'node:test';
import assert from 'node:assert/strict';
import {nextAction,profitProgress,validMonth} from '../progress.js';
import {blankProfile,personas,generateRoute} from '../data.js';
import {resultMatches} from '../acceptance.js';
const completed=(task,decision,extra={})=>({status:'done',criteria:JSON.stringify(task.checks),note:'可追溯成果',observation:'实际反馈',decision,date:'2026-10-25T01:00:00Z',...extra});

test('五类用户由未验收任务开始；继续、调整、等待、停止会改变下一步',()=>{
 for(const p of personas){
  const list=generateRoute(p.profile),first=list[0],second=list[1];
  assert.equal(nextAction(list).task.id,first.id);
  assert.equal(nextAction(list,{[first.id]:completed(first,'continue')}).task.id,second.id);
  assert.equal(nextAction(list,{[first.id]:completed(first,'adjust',{nextTask:first.id})}).task.id,first.id);
  for(const decision of ['observe','stop'])assert.equal(nextAction(list,{[first.id]:completed(first,decision)}).kind,decision);
 }
});
test('新的实践结果解除旧决定，验收变更后不能沿用旧完成与旧停止',()=>{
 const list=generateRoute(blankProfile()),[first,second]=list;
 const records={[first.id]:completed(first,'stop'),[second.id]:completed(second,'continue',{date:'2026-10-25T02:00:00Z'})};
 assert.equal(nextAction(list,records).kind,'continue');
 assert.equal(nextAction(list,{[first.id]:completed(first,'stop',{criteria:'旧条件'})}).kind,'continue');
 assert.equal(nextAction(list,{[first.id]:{status:'stuck',blocker:'不会实现',date:'2026-10-25T03:00:00Z'}}).kind,'adjust');
});
test('先保存自检、尚未选择下一步时，最新有效成果解除旧等待、停止与卡点',()=>{
 const list=generateRoute(blankProfile()),[first,second,third]=list;
 for(const kind of ['stop','observe','stuck']){
  const previous=kind==='stuck'?{status:'stuck',blocker:'旧卡点',date:'2026-10-25T01:00:00Z'}:completed(first,kind);
  const records={[first.id]:previous,[second.id]:completed(second,null,{date:'2026-10-25T02:00:00Z'})};
  const snapshot=JSON.stringify(records),action=nextAction(list,records);
  assert.equal(action.kind,'continue');
  // 旧卡点未验收时仍是待完成任务，但不再沿用旧的卡点决定。
  assert.equal(action.task.id,kind==='stuck'?first.id:third.id);
  assert.ok(!action.reason.includes('旧卡点'));
  assert.equal(JSON.stringify(records),snapshot);
  assert.equal(records[second.id].decision,null);
 }
});
test('同项自检保留已有决定；过期条件的新成果不能解除有效的旧决定',()=>{
 const list=generateRoute(blankProfile()),[first,second]=list;
 for(const decision of ['stop','observe','adjust']){
  const old=completed(first,decision,{nextTask:first.id});
  const saved={...old,note:'更新成果后仍保留决定',date:'2026-10-25T02:00:00Z'};
  const action=nextAction(list,{[first.id]:saved});
  assert.equal(action.kind,decision);assert.equal(action.task.id,first.id);
 }
 const records={[first.id]:completed(first,'stop'),[second.id]:completed(second,null,{criteria:'旧条件',date:'2026-10-25T02:00:00Z'})};
 assert.equal(nextAction(list,records).kind,'stop');
 assert.equal(nextAction(list,records).task.id,first.id);
});
test('已完成后的活动卡点只改变推荐，不伪造决定或撤销完成；已有等待停止优先',()=>{
 const list=generateRoute(blankProfile()),[first,second,third]=list;
 for(const decision of [null,'continue']){
  const record=completed(first,decision,{blockerActive:true,blocker:'结果不符合预期'}),snapshot=JSON.stringify(record);
  const action=nextAction(list,{[first.id]:record});
  assert.equal(action.kind,'adjust');assert.equal(action.task.id,first.id);assert.match(action.reason,/结果不符合预期/);
  assert.equal(JSON.stringify(record),snapshot);assert.ok(resultMatches(record,first));assert.equal(record.status,'done');
 }
 for(const decision of ['observe','stop']){
  const record=completed(first,decision,{blockerActive:true,blocker:'结果不符合预期'});
  assert.equal(nextAction(list,{[first.id]:record}).kind,decision);
 }
 const resolved=completed(first,'adjust',{blockerActive:false,blocker:'结果不符合预期',nextTask:third.id});
 assert.equal(nextAction(list,{[first.id]:resolved}).task.id,third.id);
 assert.equal(nextAction(list,{[first.id]:{...resolved,decision:'continue',nextTask:null}}).task.id,second.id);
});
test('盈利目标只统计同币种、已结束、连续月份的真实填报，不以营收或学习完成判定',()=>{
 const now=new Date(2026,9,25),profile={incomeGoal:1000,currency:'CNY',goalMonths:2};
 const month=(date,extra={})=>({month:date,currency:'CNY',income:1500,cost:400,hours:20,evidence:'个人账单',...extra});
 const records={a:month('2026-09'),b:month('2026-08')};
 assert.equal(profitProgress(profile,records,now).met,true);
 assert.equal(profitProgress(profile,{a:records.a},now).streak,1);
 assert.equal(profitProgress(profile,{a:records.a,b:month('2026-07')},now).met,false);
 assert.equal(profitProgress(profile,{a:month('2026-09',{cost:800}),b:records.b},now).streak,0);
 assert.equal(profitProgress(profile,{a:month('2026-09',{currency:'USD'}),b:records.b},now).streak,0);
 assert.equal(profitProgress(profile,{a:month('2026-08'),b:month('2026-07')},now).met,false);
 assert.equal(profitProgress({...profile,incomeGoal:''},records,now).configured,false);
 assert.equal(profitProgress({...profile,incomeGoal:0.1,goalMonths:1},{a:month('2026-09',{income:0.3,cost:0.2})},now).met,true);
 assert.equal(validMonth(month('2026-10'),now),false);
 assert.equal(validMonth(month('2026-09',{cost:''}),now),false);
 assert.equal(validMonth(month('2026-09',{evidence:'  '}),now),false);
});
