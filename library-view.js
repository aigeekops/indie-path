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
export const TRACK_LABELS={all:'全部',core:'必修',reference:'参考'};
// 分级徽标：产品形态对应的平台专项虽然不在通用必修里，对该用户仍是必须走完的关卡。
export function trackBadge(task,profile){
 if(task.track==='core')return {label:'必修',cls:'core',hint:'必修主干：不做完这条闭环走不通'};
 const form=profile?.form||'',mobile=/^手机/.test(form),wechat=/^微信/.test(form);
 if((mobile&&/^(app|game)-/.test(task.id))||(wechat&&/^(wx|game)-/.test(task.id)))return {label:'专项',cls:'track',hint:'你选的产品形态专属关卡，同样必须走完'};
 return {label:'参考',cls:'reference',hint:'参考项：卡在这里再查，不必预先学'};
}
export function libraryModel({query='',stage='all',track='all',taskList=null,profile=null,...state}={}){
 const matched=new Set(searchTasks(tasks,query).map(({task})=>task.id));
 const groups=stages.map(s=>({...s,tasks:s.taskIds.filter(id=>matched.has(id)).map(id=>{
  const task=taskList?.find(t=>t.id===id)||taskForProfile(tasks.find(t=>t.id===id),profile);
  return {...task,entry:libraryEntry(task,state),badge:trackBadge(task,profile)};
 }).filter(task=>track==='all'||task.track===track).sort((a,b)=>(a.track==='core'?0:1)-(b.track==='core'?0:1)||a.order-b.order)}));
 const counts={all:matched.size,...Object.fromEntries(groups.map(s=>[s.id,s.tasks.length]))};
 const trackCounts={all:matched.size,core:tasks.filter(t=>matched.has(t.id)&&t.track==='core').length,reference:tasks.filter(t=>matched.has(t.id)&&t.track==='reference').length};
 const visible=groups.filter(s=>(stage==='all'||stage===s.id)&&s.tasks.length);
 return {query,stage,track,counts,trackCounts,groups:visible,total:tasks.length,shown:visible.reduce((n,s)=>n+s.tasks.length,0)};
}
export function libraryResults(model){
 if(!model.shown)return `<div class="catalog-empty"><h2>没有匹配的任务</h2><p>可以修改关键词，或清除搜索与阶段筛选。</p><button class="text-link" id="library-reset">清除搜索与筛选 →</button></div>`;
 const trackSummary=stage=>`<span class="catalog-stage-tracks">必修 ${stage.tasks.filter(t=>t.track==='core').length} · 参考 ${stage.tasks.filter(t=>t.track==='reference').length}</span>`;
 return model.groups.map(stage=>`<section class="catalog-stage" aria-labelledby="catalog-stage-${stage.id}"><div class="catalog-stage-heading"><h2 id="catalog-stage-${stage.id}">${safe(stage.title)} <small>${stage.tasks.length} 项</small></h2>${trackSummary(stage)}<p>${safe(stage.card.description)}</p></div><ul class="catalog-task-list">${stage.tasks.map(task=>`<li><a class="catalog-task" id="library-task-${task.id}" data-library-task="${task.id}" href="#/task/${task.id}${task.entry.section?'/'+task.entry.section:''}"><div class="catalog-task-copy"><div class="catalog-task-title"><h3>${safe(task.title)}</h3><span class="catalog-task-track ${task.badge.cls}" title="${safe(task.badge.hint)}">${safe(task.badge.label)}</span>${task.entry.status?`<span class="catalog-task-status ${task.entry.kind}">${safe(task.entry.status)}</span>`:''}</div><p>${safe(task.subtitle)}</p></div><span class="catalog-task-effort">${safe(task.effort)}<small>编辑估算</small></span><span class="catalog-task-action">${task.entry.action} <span aria-hidden="true">→</span></span></a></li>`).join('')}</ul></section>`).join('');
}
export function libraryPage(options={}){
 const model=libraryModel(options);
 return `<div class="page guide-catalog"><div class="catalog-top"><header class="catalog-heading"><h1>实践指南</h1><p>找到当前问题，完成一次实践。不必先填资料，也不必全部学完。</p></header><details class="catalog-help" id="library-help"><summary>如何使用 <span aria-hidden="true">ⓘ</span></summary><div>${guideIntro()}<a class="text-link" href="#/learn">查看六阶段行动与模板说明 →</a></div></details></div>
 <div class="catalog-tools"><div class="catalog-search" role="search" aria-label="搜索实践任务">${icon('search')}<input id="library-search" type="search" aria-label="搜索实践任务" placeholder="搜索任务：访谈、接口、上线、报价……" value="${safe(model.query)}" autocomplete="off" aria-controls="library-results"></div><nav class="catalog-track-filters" aria-label="按必修或参考筛选任务">${Object.entries(TRACK_LABELS).map(([id,label])=>`<button type="button" data-library-track="${id}" aria-pressed="${model.track===id}" aria-controls="library-results">${label} <span data-library-track-count="${id}">${model.trackCounts[id]}</span></button>`).join('')}</nav><nav class="catalog-filters" aria-label="按阶段筛选任务">${[['all','全部'],...stages.map(s=>[s.id,s.title])].map(([id,title])=>`<button type="button" data-library-stage="${id}" aria-pressed="${model.stage===id}" aria-controls="library-results">${safe(title)} <span data-library-count="${id}">${model.counts[id]}</span></button>`).join('')}</nav></div>
 <p class="catalog-result-count" id="library-result-count" role="status">显示 ${model.shown} / ${model.total} 项任务 · 必修 ${model.trackCounts.core} 项构成一条最小闭环，参考 ${model.trackCounts.reference} 项按需查阅</p><div id="library-results">${libraryResults(model)}</div>
 <section class="catalog-resources" aria-labelledby="catalog-resources-title"><h2 id="catalog-resources-title">按需深入</h2><p class="quiet catalog-resources-note">下面这些不是必修，是卡住时查的：不必预先读，遇到问题再回来翻。</p><div class="catalog-resource-links">${[['#/topics','公司、收款与财税专题','要注册公司、开发票、过税、对账时'],['#/cases','教学案例','想看一遍完整流程是怎么走下来的'],['#/sources','资料来源与核验记录','想核对某条说法的原始出处与核验范围']].map(([href,title,when])=>`<a href="${href}"><span><strong>${safe(title)}</strong><small>${safe(when)}</small></span><span class="catalog-resource-arrow" aria-hidden="true">→</span></a>`).join('')}</div>${technicalReadings()}</section></div>`;
}
