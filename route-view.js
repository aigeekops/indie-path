import {isPlatformProduct} from './product-paths.js';
import {skills,stageLabels} from './data.js';
import {resultMatches} from './acceptance.js';
import {taskStatus} from './journey.js';
import {profitProgress} from './progress.js';
import {focusCard,profitPanel} from './growth-view.js';
import {personalStudyNote,studyPlan,safe} from './learning-view.js';
import {marketPlan} from './market-view.js';

export const routeTaskHref=(id,section='')=>`#/route/task/${id}${section?'/'+section:''}`;
const decisionLabel={continue:'继续推进',adjust:'调整后再验证',observe:'等待真实反馈',stop:'停止本轮投入'};
function goalSummary(journey,businessMonths){
 const p=journey.profile,profit=profitProgress(p,businessMonths);
 return profit.configured?`每月结余 ${profit.target} ${p.currency||'CNY'} · 连续达标 ${profit.streak}/${profit.required} 个月`:'尚未设置经营目标';
}
export function routeStages(journey,{records={},added=[],activeTaskId=null,prefix='route',taskHref=routeTaskHref}={}){
 return journey.stages.map(stage=>`<details class="phase ${stage.current?'current-stage':''}" id="${prefix}-${stage.id}" ${stage.tasks.some(t=>t.id===activeTaskId)||(!activeTaskId&&stage.current)?'open':''}><summary><span class="phase-number">0${stage.number}</span><strong>${stage.title}</strong><small>${stage.current?safe(stage.status)+' · ':''}${stage.completed}/${stage.tasks.length}</small></summary>${stage.tasks.map(t=>{
  const done=resultMatches(records[t.id],t),viewing=t.id===activeTaskId,recommended=t.id===journey.action.task?.id;
  return `<a href="${taskHref(t.id,done?'acceptance':'')}" data-route-task="${t.id}" class="route-task ${viewing?'selected-task':''}" ${viewing?'aria-current="page"':''}><span class="task-dot ${done?'done':t.mode==='confirm'?'confirm':''}"></span><span class="task-main"><strong>${safe(t.title)}</strong><small>${viewing?'正在查看 · ':''}${recommended?'当前建议 · ':''}${safe(taskStatus(t,records,added))}</small></span>${done?'<span class="tag green">已自检</span>':''}</a>`;
 }).join('')||'<p class="quiet route-stage-empty">本阶段暂无安排的任务。</p>'}</details>`).join('');
}
export function personalRoute(journey,{businessMonths={},source=null,taskMarkup='',...options}={}){
 if(taskMarkup)return `<div class="page personal-route route-task-page">${taskMarkup}</div>`;
 const p=journey.profile;
 return `<div class="page personal-route route-overview"><header class="route-heading"><div><h1>我的路线</h1><p>${p.idea?'项目：'+safe(p.idea):'从当前问题开始，推进你的独立产品。'}</p>${source?`<small>${safe(source)}</small>`:''}</div><button class="text-link" data-route-panel="profile">个人情况与路线依据</button></header>
 ${focusCard(journey.action,p)}
 <div class="route-overview-tools"><div><span>经营目标</span><p>${safe(goalSummary(journey,businessMonths))}</p></div><button class="text-link" data-route-panel="profit">查看经营记录 →</button></div>
 <section class="route-stages" aria-labelledby="route-stages-title"><div class="route-stages-heading"><h2 id="route-stages-title">完整路线</h2><span>已自检 ${journey.completed} / ${journey.list.length} 项</span></div>${routeStages(journey,options)}<div class="route-stages-foot"><p>阶段用于归类，按“当前建议”推进。应用与微信产品的变现接入在提审前验证；自检完成不代表盈利。</p><a class="text-link" href="#/map">查看行动地图</a></div></section></div>`;
}
function profileDetails(journey){
 const p=journey.profile,strong=skills.filter(([id])=>p.skills[id]===2).map(([,name])=>name);
 return `<div class="route-support-body"><div class="section-heading"><h3>我的起点</h3><button class="text-link" id="edit-profile">修改情况</button></div><dl class="route-profile-facts"><div><dt>当前情况</dt><dd>${safe(stageLabels[p.stage])}</dd></div><div><dt>工作经历</dt><dd>${safe(p.roles.join(' / ')||'未填写')}</dd></div><div><dt>独立做过</dt><dd>${safe(strong.join('、')||'尚未确认')}</dd></div><div><dt>投入与形态</dt><dd>${safe(p.time)} / 周 · ${safe(p.form)}${p.stack?' · '+safe(p.stack):''}</dd></div><div><dt>实际反馈</dt><dd>使用：${p.used?'自述已有真实使用':'尚未确认'}；付费：${p.paid?'自述已有真实付费':'尚未确认'}。任务自检不会自动改变这些事实。${p.userContext?'<p>'+safe(p.userContext)+'</p>':''}</dd></div></dl>${p.form!=='网页产品'&&!isPlatformProduct(p)?'<div class="notice">插件与桌面专项尚未覆盖，当前展示通用实践。</div>':''}${studyPlan(p,journey.list)}${personalStudyNote(p)}${marketPlan(p)}<a class="text-link" href="#/compare">比较五类起点的路线</a></div>`;
}
export function globalRoute(journey,{businessMonths={},activeTaskId=null,...options}={}){
 if(!journey.personalized)return '';
 const viewing=journey.list.find(t=>t.id===activeTaskId),stage=journey.stages.find(s=>s.tasks.some(t=>t.id===activeTaskId));
 return `<div class="global-route-bar"><button class="route-switcher" data-route-panel="route" aria-haspopup="dialog" aria-controls="route-dialog" aria-expanded="false"><span class="global-route-location">${viewing?safe(stage.title)+' / '+safe(viewing.title):'我的路线 · '+safe(decisionLabel[journey.action.kind])}</span><span class="global-route-count">已自检 <strong>${journey.completed}/${journey.list.length}</strong></span><span class="route-switcher-label"><span>切换任务</span><svg class="route-switcher-chevron" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></span></button><button class="route-goal-button" data-route-panel="profit"><span>经营记录</span></button><span class="global-route-track" aria-hidden="true"><i style="width:${journey.list.length?journey.completed/journey.list.length*100:0}%"></i></span></div>
 <dialog id="route-dialog" class="route-dialog" aria-labelledby="route-panel-title"><div class="route-dialog-heading"><h2 id="route-panel-title">完整路线</h2><button class="icon-button" id="route-panel-close" aria-label="关闭路线面板">×</button></div><div class="route-panel-body" data-route-pane="route"><p class="route-panel-intro">已自检 ${journey.completed} / ${journey.list.length} 项 · ${safe(decisionLabel[journey.action.kind])}</p><nav aria-label="切换路线任务">${routeStages(journey,{...options,activeTaskId,prefix:'global-route'})}</nav><p class="quiet">任务自检用于记录能力成果，不代表盈利。 <a class="text-link" href="#/route">查看路线总览 →</a></p></div><div class="route-panel-body" data-route-pane="profit" hidden>${profitPanel(journey.profile,businessMonths)}</div><div class="route-panel-body" data-route-pane="profile" hidden>${profileDetails(journey)}</div><div class="route-panel-footer"><button class="text-link" data-route-panel="route">完整路线</button><button class="text-link" data-route-panel="profit">经营目标与记录</button><button class="text-link" data-route-panel="profile">个人情况与依据</button></div></dialog>`;
}
