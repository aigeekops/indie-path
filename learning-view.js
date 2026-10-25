import {isMobile,isWechat,isGame,isPlatformProduct,mobileData,mobilePlatform,mobileStore,mobilePlatformPanel} from './product-paths.js';
import {content} from './generated/content.js';
import {contentActions,topicsSection} from './content-view.js';
import {responsibility} from './growth-view.js';
import {icon} from './ui.js';
import {businessStages,businessCheckedAt,acquisitionOptional,stageSearchText} from './business-learning.js';
import {resolveLesson} from './lesson-materials.js';
import {taskMarketContent} from './market-view.js';
import {caseSearchText} from './market-content.js';
import {resultMatches} from './acceptance.js';
import {adaptLesson, curriculum, roleAdvice, checkedAt, prerequisiteIds} from './curriculum.js';

export const safe=(value='')=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function learningContent(task,profile,records={},allTasks=[],{taskHref=id=>`#/task/${id}`,worksheet=null,initialSection='resources'}={}){
 const l=resolveLesson(task,profile),stage=businessStages.find(s=>s.task===task.id);
 const sources=[stage?.primary,...(stage?.secondary||[])].filter(Boolean);
 const candidates=[...l.readings,...sources].map(r=>({...r,...sources.find(source=>source.url===r.url&&source.chapter===r.chapter)}));
 const readings=candidates.filter((r,i)=>candidates.findIndex(x=>x.url===r.url&&x.chapter===r.chapter)===i);
 const stepReadings=Object.values(l.stepReadings||{}).flat();
 const additional=readings.slice(1).filter(r=>!stepReadings.some(source=>source.url===r.url&&source.chapter===r.chapter));
 const reading=(r,primary=false)=>`<article class="lesson-reading ${primary?'primary-reading':''}"><a href="${safe(r.url)}" class="lesson-reading-title" target="_blank" rel="noopener noreferrer">${safe(r.name)}${icon('external')}</a><dl><div><dt>看哪些</dt><dd>${r.chapterHtml||safe(r.chapter)}</dd></div><div><dt>读到能</dt><dd>${safe(r.goal)}</dd></div></dl>${r.access?`<p class="quiet">${safe(r.access)}</p>`:''}<small>核验 ${safe(r.checkedAt||businessCheckedAt)}</small>${r.note?`<details class="source-scope"><summary>查看核验范围</summary><div class="markdown-body">${r.noteHtml||safe(r.note)}</div></details>`:''}</article>`;
 const prerequisites=prerequisiteIds(task.id,profile);
 return `<div class="lesson-start"><strong>开始前</strong><div class="markdown-body">${l.html.prerequisite}</div>${prerequisites.length?`<details class="prerequisite-links"><summary>缺前置知识？按需补齐</summary>${prerequisites.map(id=>{const t=allTasks.find(x=>x.id===id);return `<a href="${taskHref(id)}">${safe(t?.title||id)} <small>${resultMatches(records[id],t)?'已保存成果，核对本次是否适用':'按缺口选读'}</small></a>`;}).join('')}</details>`:''}</div>
 ${mobilePlatformPanel(task,profile)}
 <details class="task-section task-block lesson-study" name="task-panels" id="resources" ${initialSection==='resources'?'open':''}><summary><span class="section-index">01</span><strong>先学什么</strong><small>精选资源</small></summary><div class="task-block-content">
  ${readings[0]?reading(readings[0],true):'<p>直接按下方步骤实践。</p>'}
  <p class="lesson-handoff">先完成：${safe(l.practice[0].title)}。后续所需章节放在对应步骤旁，已经掌握的部分可直接做。</p>
  ${additional.length||stage?`<details class="supplement-readings"><summary>补充资料与选读范围${additional.length?`（${additional.length} 项）`:''}</summary>${stage?`<p>${safe(stage.watch)}</p>`:''}${additional.map(r=>reading(r)).join('')}${stage?.id==='acquisition'&&profile?.market==='海外市场（产品出海）'?`<a class="text-link" href="${safe(acquisitionOptional.url)}" target="_blank" rel="noopener noreferrer">按需查看 Product Hunt 官方发布指南${icon('external')}</a>`:''}</details>`:''}
  <a class="task-handoff-link" href="#practice" data-scroll="practice">开始实践 →</a>
 </div></details>
 <details class="task-section task-block " name="task-panels" id="practice" ${initialSection==='practice'?'open':''}><summary><span class="section-index">02</span><strong>按这个顺序做</strong><small>实践步骤</small></summary><div class="task-block-content">
  ${l.pathNote?`<div class="notice">${safe(l.pathNote)}</div>`:''}
  <ol class="lesson-action-steps">${l.practice.map((step,i)=>`<li><div class="lesson-step-heading"><span>${i+1}</span><h3>${safe(step.title)}</h3></div><div class="lesson-step-body">${l.stepReadings?.[step.title]?.length?`<div class="step-readings"><span>这一步用到</span>${l.stepReadings[step.title].map(r=>`<a href="${safe(r.url)}" target="_blank" rel="noopener noreferrer">${safe(r.name)}${icon('external')}<small>${safe(r.chapterText||r.chapter)}</small>${r.access?`<small>${safe(r.access)} · 核验 ${safe(r.checkedAt||businessCheckedAt)}</small>`:''}</a>`).join('')}</div>`:''}<div class="markdown-body">${step.actionHtml}</div><div class="lesson-step-output"><strong>留下</strong><div class="markdown-body">${step.resultHtml}</div></div></div></li>`).join('')}</ol>
  <details class="lesson-context" id="why"><summary>为什么做、学到什么，以及 AI 怎样辅助</summary><div class="markdown-body">${l.html.why}</div><p>练习能力：${l.learn.map(safe).join('、')}</p>${stage?`<p>本阶段行动：${safe(stage.practice)}</p>`:''}${task.reason?`<p>为你推荐：${safe(task.reason)}</p>`:''}${responsibility(task,profile)}<p class="quiet">Cursor 或 Claude Code 任选一个，先核对当期支持条件。限定任务和完成标准，检查差异与实际运行结果。</p></details>
  ${taskMarketContent(task,profile,{compact:true,taskHref})}<a class="task-handoff-link" href="#template" data-scroll="template">按成果模板记录实践 →</a>
 </div></details>
 <details class="task-section task-block lesson-delivery" name="task-panels" id="template" ${initialSection==='template'?'open':''}><summary><span class="section-index">03</span><strong>交这份成果</strong><small>成果模板</small></summary><div class="task-block-content">
  <ul class="lesson-deliverables">${l.deliverables.map(x=>`<li>${safe(x)}</li>`).join('')}</ul>
  ${stage?`<details class="lesson-output-note"><summary>阶段成果要求</summary><p>${safe(stage.output)}</p></details>`:''}
  <details class="lesson-example-details" id="example"><summary>先看一份成果示例与常见卡点（教学模拟）</summary><div class="lesson-example markdown-body">${l.html.example}</div><h3>卡住时查这里</h3><ul>${l.html.pitfalls.map(x=>`<li>${x}</li>`).join('')}</ul></details>
  <div class="lesson-template-heading"><label for="start-worksheet">把每一步的结果填进模板</label><button class="text-link" id="copy-template">${icon('copy')}复制当前内容</button></div>
  <textarea class="route-worksheet" id="start-worksheet" data-worksheet-id="${task.id}">${safe(worksheet??l.template)}</textarea>
  ${task.id==='code-basics'?`<details class="starter"><summary>打开最小练习输入</summary><pre class="worksheet">${safe('const records = [\n  { id: "r1", project: "A", minutes: 30 },\n  { id: "r2", project: "B", minutes: 20 },\n  { id: "r3", project: "A", minutes: 40 }\n];\n// 在控制台或课程运行环境中，编写只返回项目 A 记录的函数。\n// 先预测结果，再运行；增加空列表和缺字段样例。')}</pre></details>`:''}
  <div class="free-actions"><button class="button small" id="save-worksheet" data-after-save="acceptance">保存草稿，核对成果</button><span class="quiet" id="worksheet-status" role="status">草稿单独保存，不计为验收完成。</span></div>
 </div></details>
 <details class="lesson-extra"><summary>需要公司、收款或财税资料，或想改进本页？</summary>${topicsSection(task.id)}${contentActions(l.contentPath)}</details>
 `;
}

export function learningAcceptance(task,taskHref=id=>`#/task/${id}`){
 const stage=businessStages.find(s=>s.task===task.id);
 if(!stage)return '';
 return `<p>${safe(stage.accept)}</p>${stage.id==='monetization'?`<p class="quiet">定价指南不等于支付资格。具体渠道接入、模拟与真实交易区分见<a class="text-link" href="${taskHref('charge')}">收费交付任务</a>。</p>`:''}`;
}

export function nextStep(task,profile){return adaptLesson(task,profile).next;}

export function personalStudyNote(profile){
 if(!profile)return '';
 const selected=(profile.roles||[]).filter(r=>roleAdvice[r]);
 if(!selected.length)return '';
 return `<div class="study-note"><span class="eyebrow">从你的经验出发</span>${selected.map(r=>{const a=roleAdvice[r];return `<div><h3>${safe(r)}经验怎样用在这次实践</h3><p>${safe(a.advantage)}</p><p>${safe(a.gap)}</p><strong>${safe(a.practice)}</strong></div>`;}).join('')}<p class="quiet">这是岗位经验提示，是否补课仍由你的能力与当前项目决定。</p></div>`;
}

export function guideIntro(){return `<section class="guide-intro markdown-body"><div><h2>${safe(content.guides['guide-intro'].title)}</h2>${content.guides['guide-intro'].html}<div class="free-actions"><a class="text-link" href="#/cases">按需对照教学案例</a><a class="text-link" href="#/sources">原始资料与核验记录</a></div></div></section>`;}

export function studyPlan(profile,taskList){
 if(isPlatformProduct(profile))return `<div class="route-study-plan"><h3>${safe(profile.form==='移动端'?'手机应用':profile.form)}路线</h3><p>先验证需求${isGame(profile)?'与核心玩法':'与最小范围'}，核对平台与变现条件，再实现、真机测试、审核发布及持续运营。</p><div class="tags"><span class="tag">${safe(isWechat(profile)?profile.form:mobilePlatform(profile))}${isMobile(profile)&&mobilePlatform(profile)==='国内安卓商店'?' · '+safe(mobileStore(profile)):''}</span><span class="tag">${safe(mobileData(profile))}</span></div><p class="quiet">只有明确需要云端服务时才安排云端任务。平台与客户市场独立选择；测试通过、上架、下载、真实收入分别记录。</p></div>`;
 const beginner=taskList.some(t=>t.id==='code-basics');
 const focus=profile.stage==='live'?'先回访实际使用与购买，再用已有产品确认实现；不从新想法重开。':profile.serviceMode?'从一笔真实服务拆出自助环节，分别验证软件价值与人工成本。':beginner?'先检查需求，再补 Web 与编程桥接；从最小读写开始，不直接委托生成整站。':profile.skills.frontend===2?'复用界面能力，重点补需求、服务端、权限、交易和经营。':profile.skills.backend===2?'复用服务端能力，先找真实问题，再补界面体验、获客与交易。':'按当前缺口推进一条完整产品流程，用成果校正自述。';
 return `<div class="route-study-plan"><h3>这条路线怎样学</h3><p>${safe(focus)}</p><div class="tags"><span class="tag green">${taskList.length} 项可执行任务</span><span class="tag">${taskList.filter(t=>t.mode==='confirm').length} 项可用已有成果确认</span></div><p class="quiet">每项都有中文步骤、模板、示例与完成标准。国内外共用主线，获客、收费和交付时再核对市场条件；国外课程按需选读。</p></div>`;
}

export function taskSearchText(task){
 const l=curriculum[task.id];
 const variants=[adaptLesson(task,{stack:"Python",skills:{frontend:0}}),adaptLesson(task,{stack:"Node.js",skills:{frontend:2}})];
 return [stageSearchText(task),caseSearchText(task),task.title,task.subtitle,task.ai,...task.checks,l.why,l.prerequisite,...l.learn,...l.practice.flatMap(s=>[s.title,s.action,s.result]),l.template,l.example,...l.pitfalls,...l.deliverables,l.next,...variants.flatMap(v=>[...v.readings,...Object.values(v.stepReadings||{}).flat()].flatMap(r=>[r.name,r.chapter,r.goal])),...[...l.readings,...Object.values(l.stepReadings||{}).flat()].flatMap(r=>[r.name,r.chapter,r.goal])].join(' ');
}

export function searchTasks(allTasks,query){
 const aliases={'不会后端':'接口','不会开发':'小程序','不会编程':'小程序','找用户':'用户','收费':'收费','上线':'上线'};
 const q=(aliases[query.trim()]||query.trim()).toLowerCase();
 return allTasks.map(t=>({task:t,text:taskSearchText(t)})).filter(({text})=>!q||q.split(/\s+/).every(word=>text.toLowerCase().includes(word))).map(({task,text})=>{
  const index=text.toLowerCase().indexOf(q);const start=index>=0?Math.max(0,index-30):0;
  return {task,snippet:text.slice(start,start+135)};
 });
}
