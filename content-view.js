import {content} from './generated/content.js';
import {icon} from './ui.js';
const e=(value='')=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const repo='https://github.com/aigeekops/indie-path';

export function contentActions(contentPath){
 const issue=new URL(repo+'/issues/new');issue.searchParams.set('template','content.yml');issue.searchParams.set('title','内容反馈：'+contentPath);issue.searchParams.set('body','原文位置：'+contentPath+'\n\n问题、适用场景与原始来源：\n');
 return `<div class="content-actions"><a class="text-link" href="${repo}/edit/main/${encodeURI(contentPath)}" target="_blank" rel="noopener noreferrer">编辑本页 Markdown ${icon('external')}</a><a class="text-link" href="${e(issue.href)}" target="_blank" rel="noopener noreferrer">反馈内容问题</a></div>`;
}
const card=t=>`<a class="library-card topic-card" href="#/topic/${t.id}"><span class="tag">${e(t.jurisdiction)}</span><h3>${e(t.title)}</h3><p>${e(t.summary)}</p><span class="text-link">按当前需要查阅</span></a>`;
export function topicsSection(taskId){
 const topics=taskId?content.topics.filter(t=>t.relatedTasks.includes(taskId)):content.topics;
 if(!topics.length)return '';
 return `<section class="topic-section${taskId?' task-section':''}" id="business-topics"><div class="section-heading"><div><div class="eyebrow">按需经营专题</div><h2>${taskId?'这一步涉及公司、收款或财税？':'准备经营时，再查公司、收款与财税'}</h2><p>按实际业务选择，不增加六阶段主线的必修任务。客户所在地、经营主体和税务责任分别核对。</p></div></div>${taskId?`<ul class="topic-links">${topics.map(t=>`<li><a class="text-link" href="#/topic/${t.id}">${e(t.title)}</a></li>`).join('')}</ul>`:`<div class="library-grid">${topics.map(card).join('')}</div>`}${taskId?'<a class="text-link" href="#/topics">查看全部经营专题</a>':''}</section>`;
}
export function topicsPage(){return `<div class="page"><div class="breadcrumb"><a href="#/library">实践指南</a><span>/</span><span>公司、收款与财税</span></div><div class="page-title"><h1>按当前经营问题，找到需要的资料。</h1><p>主体选择、国内与香港注册、银行及支付、对账、报税和年度维护。无需先填写个人资料，也不要求每篇都读。</p></div>${topicsSection()}</div>`;}

function sourceCard(s){return `<div class="resource-card reading-card"><a class="source-title" href="${e(s.url)}" target="_blank" rel="noopener noreferrer"><strong>${e(s.name)} ${icon('external')}</strong></a><div><b>选读：</b><div class="markdown-body">${s.chapterHtml||e(s.chapter)}</div></div><p><b>用途：</b>${e(s.goal)}</p><p class="quiet">核验 ${e(s.checkedAt)}</p>${s.noteHtml?`<details class="source-scope"><summary>查看核验范围</summary><div class="markdown-body">${s.noteHtml}</div></details>`:''}</div>`;}

export function topicPage(id,worksheets={}){
 const topic=content.topics.find(t=>t.id===id);
 if(!topic)return '<div class="page empty"><h1>没有找到这个专题</h1><a class="button" href="#/topics">返回经营专题</a></div>';
 const key='topic:'+id,draft=worksheets[key]??topic.template;
 return `<div class="page"><div class="breadcrumb"><a href="#/library">实践指南</a><span>/</span><a href="#/topics">经营专题</a><span>/</span><span>${e(topic.title)}</span></div><div class="page-title"><div class="eyebrow">按需查阅 · ${e(topic.jurisdiction)}</div><h1>${e(topic.title)}</h1><p>${e(topic.summary)}</p><p class="quiet">内容核对：${e(topic.reviewedAt)}。具体业务、所在地与办理时的规则仍需逐项核实；不填写证件号码、银行账号或客户隐私。</p></div><div class="task-layout"><aside class="task-nav"><h3>本专题</h3>${topic.sections.map(s=>`<a href="#${s.id}" data-scroll="${s.id}">${e(s.title)}</a>`).join('')}<a href="#topic-sources" data-scroll="topic-sources">官方资料与核验范围</a><a href="#/topics">返回全部专题</a></aside><article class="task-body topic-article">${topic.sections.map(s=>s.title==='成果模板'?`<section class="task-section" id="${s.id}"><h2>${e(s.title)}</h2><label for="start-worksheet">我的办理与核对草稿</label><textarea id="start-worksheet" data-worksheet-id="${e(key)}" rows="12" spellcheck="false">${e(draft)}</textarea><div class="free-actions"><button class="button green" id="save-worksheet">保存草稿</button><button class="button" id="copy-worksheet">复制当前内容</button></div><p class="quiet" id="worksheet-status" role="status">${worksheets[key]!==undefined?'已载入本浏览器草稿。':'资料仅保存在本浏览器。'} 保存不等同登记、开户或申报成功。</p></section>`:`<section class="task-section markdown-body" id="${s.id}"><h2>${e(s.title)}</h2>${s.html}</section>`).join('')}<section class="task-section" id="topic-sources"><h2>官方资料与核验范围</h2>${topic.sources.map(sourceCard).join('')}</section><section class="task-section"><h2>接下来按需要继续</h2><div class="free-actions">${topic.relatedTopics.map(id=>{const t=content.topics.find(x=>x.id===id);return `<a class="text-link" href="#/topic/${id}">${e(t.title)}</a>`;}).join('')}${topic.relatedTasks.map(id=>{const t=content.tasks.find(x=>x.id===id);return `<a class="text-link" href="#/task/${id}">返回实践：${e(t.title)}</a>`;}).join('')}</div></section>${contentActions(topic.contentPath)}</article></div></div>`;
}

export function sourcesPage(){return `<div class="page"><div class="page-title"><h1>原始资料与核验记录</h1><p>资料和选读范围由 Markdown 统一维护。核验日期表示当时读取的范围，不代表规则永久有效或个案已获批准。</p></div><div class="markdown-body">${content.guides['source-boundaries'].html}</div><div class="source-catalog">${Object.values(content.readings).map(sourceCard).join('')}</div></div>`;}

export function searchTopics(query){
 const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 return content.topics.map(topic=>({topic,text:[topic.title,topic.summary,topic.jurisdiction,topic.searchText,...topic.sources.map(s=>s.name)].join(' ')})).filter(x=>words.every(w=>x.text.toLowerCase().includes(w))).map(({topic,text})=>({topic,snippet:text.slice(Math.max(0,text.toLowerCase().indexOf(words[0]||'')-25),Math.max(0,text.toLowerCase().indexOf(words[0]||'')-25)+135)}));
}
