import {isPlatformProduct} from './product-paths.js';
import {content} from './generated/content.js';
import {tasks} from './data.js';
import {resolveLesson} from './lesson-materials.js';
import {mapTaskHref} from './map-view.js';
import {safe} from './learning-view.js';

// 演示选择只留在本次页面会话，不写入个人路线或成果记录。
let selectedStep=0;
export function renderExample(journey){
 const guide=content.guides['home-example'];
 return `<section class="home-example shell" id="practice-demo" aria-labelledby="example-heading"><header class="example-heading"><div><div class="eyebrow">PRACTICE LAB / 从一个具体例子开始</div><h2 id="example-heading">${safe(guide.title)}</h2><p>${safe(guide.intro)}</p></div><span class="example-demo-tag">${isPlatformProduct(journey.profile)?'网页产品教学模拟 · 不替代应用上架':'教学模拟'}</span></header><div class="example-workbench"><div class="example-step-nav" role="tablist" aria-label="浏览四步实践示例">${guide.walkthrough.map((step,i)=>`<button type="button" role="tab" id="example-tab-${i}" data-example-step="${i}" aria-selected="${i===selectedStep}" aria-controls="example-panel-${i}" tabindex="${i===selectedStep?0:-1}"><span class="example-step-number">0${i+1}</span><span><strong>${safe(step.title)}</strong><small>${safe(step.caption)}</small></span><span class="example-step-arrow" aria-hidden="true">→</span></button>`).join('')}<p>点一步，看对应成果。<br>浏览示例不会改变学习进度。</p></div><div class="example-output-panels">${guide.walkthrough.map((step,i)=>{
 const task=journey.list.find(t=>t.id===step.task)||tasks.find(t=>t.id===step.task),lesson=resolveLesson(task,journey.profile),reading=lesson.readings[0];
 return `<section class="example-step-panel ${i===selectedStep?'is-active':''}" role="tabpanel" id="example-panel-${i}" aria-labelledby="example-tab-${i}" ${i===selectedStep?'':'inert aria-hidden="true"'}><div class="example-panel-caption"><span>0${i+1} / 04 · ${safe(step.caption)}</span><span>示例预览</span></div><div class="example-artifact markdown-body" data-example-artifact="${i}">${step.html}</div><div class="example-guidance"><div><span>做什么</span><p>${safe(step.action)}</p></div><div><span>补学什么</span><p>${reading?`<a href="${safe(reading.url)}" target="_blank" rel="noopener noreferrer">${safe(reading.name)} ↗</a><small>${safe(reading.chapterText||reading.chapter)}</small>`:'按任务步骤完成实践。'}</p></div><div><span>交什么成果</span><p>${safe(step.output)}</p></div></div><div class="example-exit"><p><strong>完成标准</strong>${safe(step.check)}</p><a class="button green small" href="${mapTaskHref(journey,step.task)}">开始这一步 <span aria-hidden="true">→</span></a></div></section>`;
 }).join('')}</div></div></section>`;
}
export function bindExample(){
 const root=document.getElementById('practice-demo');if(!root)return;
 const tabs=[...root.querySelectorAll('[data-example-step]')],panels=[...root.querySelectorAll('.example-step-panel')];
 const select=index=>{
  if(index===selectedStep)return;
  selectedStep=index;
  tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
  panels.forEach((panel,i)=>{const active=i===index;panel.classList.toggle('is-active',active);panel.inert=!active;if(active)panel.removeAttribute('aria-hidden');else panel.setAttribute('aria-hidden','true');});
 };
 tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>select(index));
  tab.addEventListener('keydown',event=>{
   const offsets={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1};
   const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:offsets[event.key]?(index+offsets[event.key]+tabs.length)%tabs.length:null;
   if(next===null)return;event.preventDefault();tabs[next].focus({preventScroll:true});select(next);
  });
 });
}
