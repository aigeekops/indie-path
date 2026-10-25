import {resultMatches} from './acceptance.js';
import {decisions} from './progress.js';
const e=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function taskNavigation(task,record,hasDraft){
 return `<nav class="task-workflow" aria-label="任务操作步骤">${[['resources','先学','选读资源'],['practice','实践','按步骤做'],['template','成果',hasDraft?'已存草稿':'填写模板'],['acceptance','验收',resultMatches(record,task)?'已自检':`0/${task.checks.length} 核对`]].map(([id,label,hint],i)=>`<a href="#${id}" data-scroll="${id}"><span>0${i+1}</span><strong>${label}</strong><small ${id==='template'?'id="draft-indicator"':id==='acceptance'?'id="check-indicator"':''}>${hint}</small></a>`).join('')}</nav>`;
}
export function resultReceipt(task,journey,record,taskHref,draft={}){
 if(!record)return '';
 const valid=resultMatches(record,task);if(!valid&&record.status!=='stuck')return '';
 const action=journey.action,blocked=Boolean(record.blocker)&&(record.status==='stuck'||record.blockerActive),hold=['observe','stop'].includes(record.decision)||['observe','stop'].includes(action.kind);
 const choices=journey.list.some(t=>t.id===task.id)?journey.list:[task,...journey.list];
 const adjustment=blocked||record.decision==='adjust'||action.kind==='adjust';
 const next=record.blockerActive?task:record.decision==='adjust'?(choices.find(t=>t.id===record.nextTask)||task):blocked?task:action.task;
 const nextDraft=draft.nextStep||{},selected=nextDraft.decision??record.decision;
 const achievement=record.status!=='stuck'||record.noteSource?record.note:'';
 const blockerNote=record.blockerNote??(!record.noteSource&&record.status==='stuck'?record.note:'');
 const caption=blocked?(valid?'卡点已记录，原自检保留':'卡点已记录'):'本次自检已保存';
 return `<div class="result-receipt receipt-compact" id="saved-result" tabindex="-1"><div class="receipt-caption" role="status"><strong>✓ ${caption}</strong><span>已自检 ${journey.completed} / ${journey.list.length} 项 · ${e(new Date(record.date).toLocaleString('zh-CN',{hour12:false}))}</span></div>
 <details class="receipt-evidence"><summary>查看已保存${blocked?'记录':'成果'}</summary>${achievement?`<pre>${e(achievement)}</pre>`:''}${record.observation?`<p>本次反馈：${e(record.observation)}</p>`:''}${record.blocker?`<p>卡点记录：${e(record.blocker)}</p>${blockerNote?`<p>${e(blockerNote)}</p>`:''}`:''}</details>
 ${decisions[record.decision]?`<p class="receipt-choice">已保存下一步：${e(decisions[record.decision])}</p>`:valid?'<p class="receipt-choice">下一步尚未选择，可以稍后再决定。</p>':''}
 <div class="receipt-next">${hold?`<p>${e(decisions[record.decision]||decisions[action.kind])}；有新反馈后再更新决定。</p>`:next?`<p>${adjustment?'接下来处理':'建议下一项'}：<strong>${e(next.title)}</strong></p><a class="button small green" ${valid&&!adjustment?'data-continue-task':''} href="${taskHref(next.id,adjustment?'practice':'')}">${adjustment?'返回实践调整':'进入这项任务'} →</a>`:'<p>本轮学习成果已记录，可继续查看实际使用与经营结果。</p><a class="text-link" href="#/route/profit">记录经营结果 →</a>'}</div>
 ${valid?`<details class="receipt-options" id="next-step-options" ${nextDraft.open?'open':''}><summary>其他下一步</summary><form id="next-step-form" novalidate><fieldset class="next-decision-options"><legend>接下来怎么做？</legend>${Object.entries(decisions).map(([id,label])=>`<label><input type="radio" name="next-decision" value="${id}" ${selected===id?'checked':''}><span>${e(label)}</span></label>`).join('')}</fieldset><div class="field" id="decision-target-field" ${selected==='adjust'?'':'hidden'}><label for="decision-target">回到哪项实践调整</label><select id="decision-target">${choices.map(t=>`<option value="${t.id}" ${(nextDraft.nextTask||record.nextTask||task.id)===t.id?'selected':''}>${e(t.title)}</option>`).join('')}</select></div><details class="decision-note"><summary>补充反馈（选填）</summary><label for="decision-observation">反馈或决定原因</label><textarea id="decision-observation" rows="2">${e(nextDraft.observation??record.observation??'')}</textarea></details><button class="button small" type="submit">保存下一步</button></form></details><p class="form-error" id="decision-error" role="alert" hidden></p>`:''}
 <p class="receipt-note">草稿、自检与经营结果分别记录；已自检不代表盈利。</p></div>`;
}
// 只有浏览器写入成功，才把新成果作为当前路线状态。
export function commitTaskRecord(state,id,record,worksheet,save){
 const previous=state.records[id],hadSheet=Object.hasOwn(state.worksheets,id),previousSheet=state.worksheets[id];
 state.records[id]=record;if(worksheet!==undefined)state.worksheets[id]=worksheet;
 if(save())return true;
 if(previous===undefined)delete state.records[id];else state.records[id]=previous;
 if(hadSheet)state.worksheets[id]=previousSheet;else delete state.worksheets[id];
 return false;
}
