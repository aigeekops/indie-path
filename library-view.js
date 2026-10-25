import {tasks,taskForProfile} from './data.js';
import {stages} from './stages.js';
import {resultMatches} from './acceptance.js';
import {searchTasks,guideIntro,safe} from './learning-view.js';
import {technicalReadings} from './direct-learning.js';
import {icon} from './ui.js';

// 目录状态直接读取任务页使用的任务、成果和草稿，不另存一套学习进度。
export function libraryEntry(task,{records={},worksheets={},drafts=new Map()}={}){
 const record=records[task.id],draft=drafts.get(task.id);
 if(resultMatches(record,task))return {status:'已自检',action:'查看成果',section:'acceptance',kind:'done'};
 if(record&&['done','skipped'].includes(record.status))return {status:'待复核',action:'核对成果',section:'acceptance',kind:'review'};
 if(record?.status==='stuck')return {status:'卡点已记录',action:'处理卡点',section:'acceptance',kind:'draft'};
 if(Object.hasOwn(worksheets,task.id)||draft?.dirty)return {status:draft?.dirty?'输入暂存':'有草稿',action:'继续填写',section:'template',kind:'draft'};
 if(draft?.checks?.some(Boolean)||draft?.feedback?.observation?.trim()||draft?.feedback?.note?.trim())return {status:'有待提交记录',action:'继续填写',section:'acceptance',kind:'draft'};
 return {status:'',action:'开始实践',section:'',kind:''};
}
export function libraryModel({query='',stage='all',taskList=null,profile=null,...state}={}){
 const matched=new Set(searchTasks(tasks,query).map(({task})=>task.id));
 const groups=stages.map(s=>({...s,tasks:s.taskIds.filter(id=>matched.has(id)).map(id=>{
  const task=taskList?.find(t=>t.id===id)||taskForProfile(tasks.find(t=>t.id===id),profile);
  return {...task,entry:libraryEntry(task,state)};
 })}));
 const counts={all:matched.size,...Object.fromEntries(groups.map(s=>[s.id,s.tasks.length]))};
 const visible=groups.filter(s=>(stage==='all'||stage===s.id)&&s.tasks.length);
 return {query,stage,counts,groups:visible,total:tasks.length,shown:visible.reduce((n,s)=>n+s.tasks.length,0)};
}
export function libraryResults(model){
 if(!model.shown)return `<div class="catalog-empty"><h2>没有匹配的任务</h2><p>可以修改关键词，或清除搜索与阶段筛选。</p><button class="text-link" id="library-reset">清除搜索与筛选 →</button></div>`;
 return model.groups.map(stage=>`<section class="catalog-stage" aria-labelledby="catalog-stage-${stage.id}"><div class="catalog-stage-heading"><h2 id="catalog-stage-${stage.id}">${safe(stage.title)} <small>${stage.tasks.length} 项</small></h2><p>${safe(stage.card.description)}</p></div><ul class="catalog-task-list">${stage.tasks.map(task=>`<li><a class="catalog-task" id="library-task-${task.id}" data-library-task="${task.id}" href="#/task/${task.id}${task.entry.section?'/'+task.entry.section:''}"><div class="catalog-task-copy"><div class="catalog-task-title"><h3>${safe(task.title)}</h3>${task.entry.status?`<span class="catalog-task-status ${task.entry.kind}">${safe(task.entry.status)}</span>`:''}</div><p>${safe(task.subtitle)}</p></div><span class="catalog-task-effort">${safe(task.effort)}<small>编辑估算</small></span><span class="catalog-task-action">${task.entry.action} <span aria-hidden="true">→</span></span></a></li>`).join('')}</ul></section>`).join('');
}
export function libraryPage(options={}){
 const model=libraryModel(options);
 return `<div class="page guide-catalog"><div class="catalog-top"><header class="catalog-heading"><h1>实践指南</h1><p>找到当前问题，完成一次实践。不必先填资料，也不必全部学完。</p></header><details class="catalog-help" id="library-help"><summary>如何使用 <span aria-hidden="true">ⓘ</span></summary><div>${guideIntro()}<a class="text-link" href="#/learn">查看六阶段行动与模板说明 →</a></div></details></div>
 <div class="catalog-tools"><div class="catalog-search" role="search" aria-label="搜索实践任务">${icon('search')}<input id="library-search" type="search" aria-label="搜索实践任务" placeholder="搜索任务：访谈、接口、上线、报价……" value="${safe(model.query)}" autocomplete="off" aria-controls="library-results"></div><nav class="catalog-filters" aria-label="按阶段筛选任务">${[['all','全部'],...stages.map(s=>[s.id,s.title])].map(([id,title])=>`<button type="button" data-library-stage="${id}" aria-pressed="${model.stage===id}" aria-controls="library-results">${safe(title)} <span data-library-count="${id}">${model.counts[id]}</span></button>`).join('')}</nav></div>
 <p class="catalog-result-count" id="library-result-count" role="status">显示 ${model.shown} / ${model.total} 项任务</p><div id="library-results">${libraryResults(model)}</div>
 <section class="catalog-resources" aria-labelledby="catalog-resources-title"><h2 id="catalog-resources-title">按需深入</h2><div class="catalog-resource-links"><a href="#/topics">公司、收款与财税专题 →</a><a href="#/cases">教学案例 →</a><a href="#/sources">资料来源与核验记录 →</a></div>${technicalReadings()}</section></div>`;
}
