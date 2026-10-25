import {actionStages} from './action-map.js';
import {taskStatus} from './journey.js';
import {resultMatches} from './acceptance.js';
import {resolveLesson} from './lesson-materials.js';
import {safe} from './learning-view.js';
import {icon} from './ui.js';

export function mapSelection(journey,stageId,taskId){
 const stage=journey.stages.find(s=>s.id===stageId)||journey.stages.find(s=>s.current)||journey.stages[0];
 return {stage,task:stage.tasks.find(t=>t.id===taskId)||stage.entry};
}
export function mapTaskHref(journey,id,section=''){
 const stage=journey.stages.find(s=>s.tasks.some(t=>t.id===id));
 return stage?`#/map/${stage.id}/${id}/learn${section?'/'+section:''}`:`#/task/${id}${section?'/'+section:''}`;
}
export function mapPreview(journey,records,stage,task){
 const summary=actionStages.find(s=>s.id===stage.id);
 const lesson=task&&resolveLesson(task,journey.profile),reading=lesson?.readings[0];
 const done=task&&resultMatches(records[task.id],task),holding=stage.current&&['observe','stop'].includes(journey.action.kind);
 return `<div class="map-stage-intro"><div><span class="eyebrow">阶段 0${stage.number} / 06</span><h2>${safe(stage.title)}</h2><p>${safe(summary.question)}</p></div><span class="tag">${safe(stage.status)} · ${stage.completed}/${stage.tasks.length} 已自检</span></div><div class="map-preview-grid"><section class="map-task-picker" aria-label="本阶段任务"><div class="map-picker-heading">选择要了解的任务 <small>${stage.tasks.length} 项</small></div><div class="map-task-options">${stage.tasks.map(t=>`<button type="button" data-map-task="${t.id}" aria-pressed="${t.id===task?.id}"><strong>${safe(t.title)}</strong><small>${safe(taskStatus(t,records,journey.added))}${t.id===journey.action.task?.id?' · 当前行动':''}</small></button>`).join('')}</div></section><section class="map-task-preview" aria-label="任务预览">${task?`<div class="map-preview-label">任务预览 <span>${safe(task.effort)} · 编辑估算</span></div><h3>${safe(task.title)}</h3><p>${safe(task.subtitle)}</p><dl><div><dt>先学</dt><dd>${reading?`<strong>${safe(reading.name)}</strong><small>${safe(reading.chapterText||reading.chapter)}</small>`:'直接按任务步骤实践'}</dd></div><div><dt>再做</dt><dd>${safe(lesson.practice[0].title)}</dd></div><div><dt>交付</dt><dd>${lesson.deliverables.map(safe).join('；')}</dd></div></dl><div class="map-preview-action"><a class="button green" href="${mapTaskHref(journey,task.id,done?'acceptance':'')}">${done?'查看成果与决定':holding&&task.id===journey.action.task?.id?'查看当前决定':'开始学习'} →</a><small>在地图工作区打开，返回保留当前选择。</small></div>`:'<p>当前路线没有这个阶段的任务。</p>'}</section></div><details class="map-stage-criteria"><summary>查看本阶段的行动与完成标准</summary><dl><dt>行动</dt><dd>${safe(summary.action)}</dd><dt>留下什么</dt><dd>${safe(summary.output)}</dd><dt>完成标准</dt><dd>${safe(summary.check)}</dd></dl></details>`;
}
export function actionMapPage(journey,records={},selection={},taskMarkup=''){
 const {stage,task}=mapSelection(journey,selection.stageId,selection.taskId),learning=Boolean(taskMarkup);
 return `<div class="page map-workbench" id="map-workbench" data-map-stage-id="${stage.id}" data-map-task-id="${task?.id||''}" data-map-mode="${learning?'learn':'preview'}"><header class="map-heading"><div><span class="eyebrow">ACTION MAP / ${journey.personalized?'我的行动地图':'公共行动地图'}</span>${learning?'<h2>独立产品行动地图</h2>':'<h1>选一个阶段，专注一项行动。</h1>'}<p>点击阶段与任务原位预览；开始学习后，资料、实践和验收在同一工作区完成。</p></div><span class="map-total"><strong>${journey.completed} / ${journey.list.length}</strong> 项已自检</span></header><nav class="map-stage-switcher" aria-label="选择行动阶段">${journey.stages.map(s=>`<button type="button" data-map-stage="${s.id}" aria-pressed="${s.id===stage.id}" ${s.current?'data-recommended="true"':''}><span>0${s.number}<small>${s.completed}/${s.tasks.length}</small></span><strong>${safe(s.title)}</strong><small>${safe(s.status)}</small></button>`).join('')}</nav><div class="map-selection-note"><span id="map-selection-status" role="status">正在查看：${safe(stage.title)}${task?' / '+safe(task.title):''}</span>${journey.action.task?'<button type="button" class="text-link" data-map-current>定位当前行动</button>':'<span>本轮学习成果已记录</span>'}</div>${learning?`<section id="map-learning"><div class="map-learning-heading"><a class="text-link" data-map-return href="#/map/${stage.id}/${task.id}">← 返回阶段预览</a><span>${safe(stage.title)} / ${safe(task.title)}</span></div>${taskMarkup}</section>`:`<div id="map-preview">${mapPreview(journey,records,stage,task)}</div>`}<footer class="map-downloads"><div><strong>保存公共地图</strong><p>下载仅包含公共学习概览，不含个人信息或进度。</p></div><a class="text-link" href="./assets/action-map.png" download="独立之路行动地图.png">${icon('download')} PNG</a><a class="text-link" href="./assets/action-map.svg" download="独立之路行动地图.svg">SVG</a></footer><p class="quiet map-footnote">地图与我的路线共用任务、成果和反馈决定。自检完成不代表盈利。</p></div>`;
}
// 浏览阶段只替换预览内容，不触发路由、滚动或写入学习进度。
export function bindMap(journey,records,onSelection){
 const root=document.getElementById('map-workbench');if(!root)return;
 const revealSelected=()=>{const list=root.querySelector('.map-task-options'),selected=list?.querySelector('[aria-pressed="true"]');if(selected)list.scrollTop+=selected.getBoundingClientRect().top-list.getBoundingClientRect().top;};
 revealSelected();
 const select=(stageId,taskId)=>{
  const {stage,task}=mapSelection(journey,stageId,taskId),hash=`#/map/${stage.id}${task?'/'+task.id:''}`;
  if(root.dataset.mapMode==='learn'){location.hash=hash;return;}
  if(stage.id===root.dataset.mapStageId&&task?.id===root.dataset.mapTaskId)return;
  const y=window.scrollY,previousStage=root.dataset.mapStageId;
  root.dataset.mapStageId=stage.id;root.dataset.mapTaskId=task?.id||'';
  document.querySelectorAll('[data-map-stage]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mapStage===stage.id)));
  const picker=document.querySelector('.map-task-options'),pickerScroll=stage.id===previousStage?picker?.scrollTop||0:0;
  const focusTask=document.activeElement?.dataset.mapTask;
  document.getElementById('map-preview').innerHTML=mapPreview(journey,records,stage,task);
  document.getElementById('map-selection-status').textContent=`正在查看：${stage.title}${task?' / '+task.title:''}`;
  history.replaceState(null,'',hash);onSelection(stage.id,task?.id);
  document.querySelector('.map-task-options').scrollTop=pickerScroll;
  if(stage.id!==previousStage)revealSelected();
  if(focusTask)root.querySelector(`[data-map-task="${task.id}"]`)?.focus({preventScroll:true});
  window.scrollTo({top:y,behavior:'instant'});
 };
 root.addEventListener('click',event=>{
  const stage=event.target.closest('[data-map-stage]'),task=event.target.closest('[data-map-task]');
  if(stage)select(stage.dataset.mapStage,stage.dataset.mapStage===root.dataset.mapStageId?root.dataset.mapTaskId:undefined);
  else if(task)select(root.dataset.mapStageId,task.dataset.mapTask);
  else if(event.target.closest('[data-map-current]')){const current=journey.stages.find(s=>s.current);if(current)select(current.id,current.entry.id);}
 });
 root.querySelector('.map-stage-switcher').addEventListener('keydown',event=>{
  const buttons=[...root.querySelectorAll('[data-map-stage]')],index=buttons.indexOf(event.target);if(index<0)return;
  const offset={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[event.key];
  const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:offset!==undefined?(index+offset+buttons.length)%buttons.length:null;
  if(next===null)return;event.preventDefault();buttons[next].focus({preventScroll:true});select(buttons[next].dataset.mapStage);
 });
}
