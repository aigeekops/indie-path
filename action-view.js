import {content} from './generated/content.js';
import {icon} from './ui.js';
import {stageForTask,stageMarketPractice} from './business-learning.js';
import {resolveLesson} from './lesson-materials.js';
import {safe} from './learning-view.js';

export const starts=content.starts;

export {renderHome as actionHome} from './home-view.js';

export function startPage(id,profile,worksheets,tasks) {
 const start=starts.find(s=>s.id===id),task=tasks.find(t=>t.id===id);
 if(!start||!task)return '<div class="page empty"><h1>没有找到这个行动入口</h1><a href="#/">返回首页</a></div>';
 const lesson=resolveLesson(task,profile),value=worksheets[id]??lesson.template,stage=stageForTask(task),marketPractice=stage?stageMarketPractice(stage,profile):'';
 return `<div class="page quick-start"><div class="breadcrumb"><a href="#/">首页</a><span>/</span><span>${start.title}</span></div><div class="page-title"><div class="eyebrow">先完成一个小行动</div><h1>${start.name}</h1><p>${start.description}</p></div><div class="worksheet-layout"><section class="worksheet-editor"><h2>现在先填这一处</h2><p>${start.first}</p><label for="start-worksheet">我的行动草稿</label><textarea id="start-worksheet" rows="12" spellcheck="false">${safe(value)}</textarea><div class="free-actions"><button class="button green" id="save-worksheet">${icon('save')}保存草稿</button><button class="button" id="copy-worksheet">${icon('copy')}复制当前内容</button></div><p class="quiet" id="worksheet-status" role="status">${worksheets[id]!==undefined?'已载入本浏览器保存的草稿。':'填写后请保存；内容只留在本浏览器。'} 保存草稿不计为任务完成。</p></section><aside class="start-guidance"><h2>接下来怎么做</h2>${marketPractice?`<p>${safe(marketPractice)}</p><a class="text-link" href="#/task/${id}/market-practice">核对本轮市场条件</a>`:''}<ol>${lesson.practice.map(s=>`<li><strong>${safe(s.title)}</strong><p>${safe(s.action)}</p></li>`).join('')}</ol><div class="start-check"><strong>完成后应能拿出</strong><ul>${lesson.deliverables.map(s=>`<li>${safe(s)}</li>`).join('')}</ul><a class="text-link" href="#/task/${id}">查看实例、资料与完整验收</a></div></aside></div><a class="back-link" href="#/map">查看行动地图，选择下一步</a></div>`;
}

export {actionMapPage} from './map-view.js';
