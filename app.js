import {isMobile,isWechat,isPlatformProduct,productForms,mobilePlatforms,mobileStores,mobileDataOptions,mobilePlatform,mobileStore,mobileData} from './product-paths.js';
import {acceptanceEditor,bindAcceptance,acceptanceDraft,syncAcceptanceWorksheet} from './acceptance-workbench.js';
import {mapSelection,mapTaskHref,bindMap} from './map-view.js';
import {libraryPage,libraryModel,libraryResults} from './library-view.js';
import {taskNavigation,resultReceipt,commitTaskRecord} from './task-workbench.js';
import {profilePreview} from './profile-preview.js';
import {titleWords} from './ui.js';
import {personalRoute,routeTaskHref,globalRoute} from './route-view.js';
import {topicsPage,topicPage,sourcesPage,searchTopics} from './content-view.js';
import {buildJourney,taskStatus} from './journey.js';
import {stages,stageForTaskId} from './stages.js';
import {validMonth} from './progress.js';
import {goalFields} from './growth-view.js';
import {bindHome} from './home-view.js';
import {actionHome,startPage,actionMapPage} from './action-view.js';
import {freeLibrary} from './direct-learning.js';
import {skills,roles,levels,stageLabels,blankProfile,personas,tasks,generateRoute,taskForProfile} from './data.js';
import {learningContent, learningAcceptance, searchTasks} from './learning-view.js';
import {adaptLesson} from './curriculum.js';
import {resultMatches} from './acceptance.js';
import {marketOptions,customerOptions,languageOptions,marketTopicByTask} from './market-content.js';
import {casePage,casesPage} from './market-view.js';
const $=(s)=>document.querySelector(s);
const escape=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state={profile:null,draft:blankProfile(),step:1,records:{},added:[],source:null,worksheets:{},businessMonths:{}};
try{const saved=JSON.parse(localStorage.getItem('indie-path-v1'));if(saved&&typeof saved==='object')state={...state,...saved,step:1};}catch{}
const taskEditorDrafts=new Map();
let mapViewState={stageId:null,taskId:null,scroll:0};
const libraryView={query:'',stage:'all',track:'all',scroll:0,focusId:null,helpOpen:false,resourcesOpen:false};
const persist=()=>{try{localStorage.setItem('indie-path-v1',JSON.stringify(state));return true;}catch{toast('浏览器无法保存，当前会话仍可继续');return false;}};
const journey=()=>buildJourney(state);
const route=()=>journey().list;
const statusText=t=>taskStatus(t,state.records,state.added);
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),2600);}
function loadPersona(i,edit=false){state.draft=structuredClone(personas[i].profile);state.source=personas[i].role+' · '+personas[i].name+'（模拟示例）';state.step=1;if(!edit){state.profile=structuredClone(state.draft);state.records={};state.added=[];state.businessMonths={};state.worksheets={};taskEditorDrafts.clear();mapViewState={stageId:null,taskId:null,scroll:0};}persist();location.hash=edit?'#/profile':'#/route';if(location.hash==='#/route'&&!edit)render();}
const personaButtons=()=>personas.map((p,i)=>`<button data-persona="${i}">${p.role}</button>`).join('');
function home(){return actionHome(state.profile,journey());}
function option(name,value,label,checked,small=''){return `<label class="option-card"><input type="radio" name="${name}" value="${value}" ${checked?'checked':''}><span>${label}${small?`<small>${small}</small>`:''}</span></label>`;}
function profilePage(){const p=state.draft;return `<div class="page profile-workbench"><div class="breadcrumb"><a href="#/">首页</a><span>/</span><span>规划我的路线</span></div><div class="page-title"><div class="eyebrow">ROUTE CONFIG / 个人路线配置</div><h1>配置起点，看到下一步。</h1><p>调整个人情况，即时查看路线变化与推荐原因。</p></div><div class="profile-layout"><aside class="profile-aside">${[['当前阶段','从真实进度开始'],['已有能力','复用你的经验'],['经营目标','安排投入与目标']].map((a,i)=>`<button type="button" data-profile-step="${i+1}" class="step-nav ${state.step===i+1?'active':''}" ${state.step===i+1?'aria-current="step"':''}><span class="step-dot">${'0'+(i+1)}</span><div>${a[0]}<small>${a[1]}</small></div></button>`).join('')}<div class="aside-note">这里是自述起点，不是能力考试。<br><br>不确定的部分会安排最小实践确认；已有能力可以通过成果跳过。</div></aside><form class="form-panel" id="profile-form">${state.step===1?`<h2>你现在走到哪里了？</h2><p class="intro">已有项目就从当前阶段继续，不需要重走所有基础。第三步可补充目标用户与实践安排；市场条件可留到获客、收费或交付时确认。</p><div class="option-list">${Object.entries(stageLabels).map(([key,label])=>option('stage',key,label,p.stage===key)).join('')}</div><div class="field"><label for="idea">用一句话描述你的想法或产品 <small>可选</small></label><textarea name="idea" id="idea" placeholder="例如：帮助自由职业者把工作记录整理成客户报告">${escape(p.idea)}</textarea></div><div class="field"><label><input type="checkbox" name="serviceMode" ${p.serviceMode?'checked':''}> 我正在手工提供这类服务，希望变成自助产品</label></div><div class="two-fields"><div class="field"><label><input type="checkbox" name="used" ${p.used?'checked':''}> 已有目标用户实际使用（不含自己测试）</label></div><div class="field"><label><input type="checkbox" name="paid" ${p.paid?'checked':''}> 已发生真实付费</label></div></div><div class="field"><label for="userContext">你能接触谁，已经得到什么反馈？ <small>可选</small></label><textarea name="userContext" id="userContext" placeholder="写真实对象、使用或报价反馈；尚未发生的事情留空。">${escape(p.userContext||'')}</textarea></div>${productFormFields(p)}${selectField('productType','产品与 AI 的关系',['暂未确定','用 AI 辅助开发普通产品','AI 能力产品'],p.productType||'暂未确定')}`:state.step===2?`<h2>你已经能独立完成什么？</h2><p class="intro">使用 AI 也可以算独立完成：你能明确需求、检查结果、处理异常并负责交付。“在帮助下”指仍需要他人替你判断或收尾。拿不准就选“不确定”。</p><div class="field-label">工作经历 <small>可多选，也可暂不选择</small></div><div class="chips">${roles.map(r=>`<label class="chip"><input name="roles" type="checkbox" value="${r}" ${p.roles.includes(r)?'checked':''}>${r}</label>`).join('')}</div><div class="skill-list">${skills.map(([id,name,desc])=>`<fieldset class="skill-assessment"><legend>${name}</legend><p>${desc}</p><div class="skill-options">${['0','1','2','unknown'].map(v=>`<label class="skill-option"><input type="radio" name="skill-${id}" value="${v}" ${String(p.skills[id])===v?'checked':''}><span>${levels[v]}</span></label>`).join('')}</div></fieldset>`).join('')}</div><div class="field"><label for="stack">熟悉的语言、框架或工具 <small>可选</small></label><input name="stack" id="stack" type="text" value="${escape(p.stack)}" placeholder="例如：Vue、Python、SQL、自动化测试"><small>保留熟悉的技术栈；填写 Python 可匹配服务端选读路径，其他框架按相同行为对照。</small></div>`:`<h2>明确目标，也控制投入。</h2>${goalFields(p)}<p class="intro">投入安排会影响任务拆分建议，不改变必要的验收要求。</p><div class="two-fields">${selectField('time','每周可投入时间',['3 小时以内','3–5 小时','6–8 小时','8 小时以上'],p.time)}${selectField('budget','持续工具与服务预算',['先控制在免费额度内','每月 200 元以内','每月 200–500 元','按验证结果投入'],p.budget)}</div><h3>这一轮服务谁？</h3><p class="quiet">先明确具体人群、任务和付款者；尚未确定也可以从访谈开始。</p>${selectField('customer','主要客户类型',customerOptions,p.customer||'尚未确定')}<details class="market-preferences" ${p.market&&p.market!=='尚未确定'?'open':''}><summary>获客、收费或交付时，再补市场条件（可选）</summary><p class="quiet">按客户所在地选择，不按你的所在地。不选择时共用行动主线，不默认进入出海路径。</p>${selectField('market','本轮目标客户市场',marketOptions,p.market||'尚未确定')}<div class="field" id="country-field" ${['海外市场（产品出海）','国内和海外'].includes(p.market)?'':'hidden'}><label for="country">首个目标国家或地区 <small>可选</small></label><input name="country" id="country" value="${escape(p.country||'')}" placeholder="例如：美国；先从一个市场开始"><small>这里填写产品用户所在地，不是你的居住地或公司注册地。</small></div>${selectField('language','主要交付语言',languageOptions,p.language||'中文')}</details>${selectField('access','是否能接触目标用户',['暂时找不到','可以找到几位目标用户','已经在服务这类用户'],p.access)}<div class="aside-note" style="display:block;margin-top:25px">路线由精选任务和前置关系组合。你可以看到推荐原因，也可以随时修改情况；不会将自述包装为认证。</div>`}<div class="form-actions"><div>${state.step>1?'<button type="button" class="text-link" id="profile-back">上一步</button>':'<span class="step-count">资料仅保存在本浏览器</span>'}</div><button type="submit" class="button green">${state.step===3?'查看我的路线':'下一步'} </button></div></form><aside class="profile-preview" id="profile-preview" aria-label="实时路线预览">${profilePreview(p,state)}</aside></div></div>`;}
function selectField(name,label,options,value){return `<div class="field"><label for="${name}">${label}</label><select name="${name}" id="${name}">${options.map(x=>`<option value="${escape(x)}" ${x===value?'selected':''}>${name==='form'&&x==='移动端'?'手机应用（iOS / Android）':escape(x)}</option>`).join('')}</select></div>`;}
function productFormFields(p){return `${selectField('form','这一轮做什么产品',productForms,p.form||'网页产品')}<div id="mobile-path-fields" ${isPlatformProduct(p)?'':'hidden'}><p class="quiet">产品形态决定实现与发布流程；买断、订阅、内购或广告在方案任务中选择，客户市场单独核对。</p><div id="phone-platform-fields" ${isMobile(p)?'':'hidden'}>${selectField('mobilePlatform','首发平台',mobilePlatforms,mobilePlatform(p))}<div id="mobile-store-field" ${mobilePlatform(p)==='国内安卓商店'?'':'hidden'}>${selectField('mobileStore','本轮国内安卓商店',mobileStores,mobileStore(p))}</div></div><p id="wechat-platform-note" class="quiet" ${isWechat(p)?'':'hidden'}>微信小程序与微信小游戏分别使用对应的注册、类目、开发和商业化规则。游戏先验证玩法并核对游戏发行条件。</p>${selectField('mobileData','主要业务数据如何处理',mobileDataOptions,mobileData(p))}<p class="quiet">本地业务数据不安排自建后端或账号；支付、广告等第三方服务的数据处理仍须单独核对。需要云端业务才加入云端实践。</p></div><div class="notice" id="form-notice" ${p.form==='网页产品'||isPlatformProduct(p)?'hidden':''}>插件与桌面专项尚未覆盖。形态未定时，先验证需求，当前实现练习以网页为起点。</div>`;}
function collectForm(){const form=$('#profile-form');if(!form)return;const fd=new FormData(form),p=state.draft;if(state.step===1){p.stage=fd.get('stage')||'none';p.idea=fd.get('idea')||'';p.serviceMode=fd.has('serviceMode');p.used=fd.has('used');p.paid=fd.has('paid');p.userContext=fd.get('userContext')||'';p.productType=fd.get('productType')||'暂未确定';p.form=fd.get('form')||'网页产品';for(const k of ['mobilePlatform','mobileStore','mobileData'])if(fd.has(k))p[k]=fd.get(k);}if(state.step===2){p.roles=fd.getAll('roles');p.stack=fd.get('stack')||'';skills.forEach(([id])=>{const v=fd.get('skill-'+id);p.skills[id]=v===null||v==='unknown'?'unknown':Number(v);});}if(state.step===3){p.incomeGoal=fd.get('incomeGoal')||'';p.currency=fd.get('currency')||'CNY';p.goalMonths=Number(fd.get('goalMonths')||3);if(fd.has('country'))p.country=fd.get('country');['time','budget','access','market','customer','language'].forEach(k=>p[k]=fd.get(k));}persist();}
function routePage(id=null){if(!state.profile)return `<div class="page empty"><div class="eyebrow" style="justify-content:center">YOUR PATH STARTS HERE</div><h2 style="margin-top:20px">先给这条路一个起点。</h2><p>可选填资料生成路线，也可以直接打开中文行动与模板。</p><a href="#/profile" class="button green">规划我的路线</a><div class="persona-switch" style="justify-content:center;margin-top:25px">${personaButtons()}</div></div>`;return personalRoute(journey(),{...state,activeTaskId:id,taskMarkup:id?taskPage(id,true):''});}
function taskPage(id,embedded=false,mapContext=null){
 const raw=tasks.find(t=>t.id===id);
 if(!raw)return `<div class="page empty"><h2>没有找到这项任务</h2><a class="button" href="#/library">返回指南</a></div>`;
 const list=route(),t=list.find(x=>x.id===id)||{...taskForProfile(raw,state.profile),mode:'required',reason:'公开指南任务，可直接学习或加入你的路线。'};
 const taskHref=mapContext?((id,section='')=>mapTaskHref(journey(),id,section)):embedded?routeTaskHref:(id,section='')=>`#/task/${id}${section?'/'+section:''}`;
 const record=state.records[id],valid=resultMatches(record,t),stage=stageForTaskId(id);
 const editorDraft=taskEditorDrafts.get(id);
 const initialSection=editorDraft?.section||(valid||record?.status==='stuck'?'acceptance':'resources');
 const heading=embedded?`<h1 class="route-workspace-title">${escape(t.title)}</h1>`:`<h1>${escape(t.title)}</h1>`;
 const body=`<article class="task-body task-learning task-console" data-task-id="${t.id}"><div class="workbench-caption"><span><i></i> TASK / ${escape(t.id.toUpperCase())}</span><span>${valid?'已自检':'实践中'}</span></div><div class="task-console-heading">${heading}<p class="subtitle">${escape(t.subtitle)}</p>
  <div class="task-meta"><span>${stage.title}</span><span>${t.effort} · 编辑估算</span><span>${statusText(t)}</span></div></div>${taskNavigation(t,record,state.worksheets[id]!==undefined)}
  ${record&&['done','skipped'].includes(record.status)&&!valid?'<p class="notice" role="status">验收条件已更新，请重新核对。原成果与草稿保留在下方。</p>':''}
  ${record?.status==='stuck'?`<p class="notice">当前卡点：${escape(record.blocker)}。可在下方继续记录。</p>`:''}
  ${learningContent(t,state.profile,state.records,tasks,{taskHref,worksheet:editorDraft?.worksheet??state.worksheets[id]??null,initialSection})}
  <details class="task-section task-block lesson-acceptance" name="task-panels" id="acceptance" ${initialSection==='acceptance'?'open':''}><summary><span class="section-index">04</span><strong>核对成果，决定下一步</strong><small>${valid?'已自检':'逐项确认'}</small></summary><div class="task-block-content">${resultReceipt(t,journey(),record,taskHref,editorDraft)}${acceptanceEditor(t,record,editorDraft,(Object.hasOwn(state.worksheets,id)||editorDraft?.dirty)?editorDraft?.worksheet??state.worksheets[id]:undefined,learningAcceptance(t,taskHref))}
   ${state.profile&&!list.some(x=>x.id===id)&&!state.added.includes(id)?'<button class="text-link" id="add-task">＋ 加入我的路线</button>':''}
  </div></details>
  <div class="task-bottom-links"><a class="text-link" ${mapContext?'data-map-return':''} href="${mapContext||'#/route'}">${mapContext?'返回阶段预览':'返回我的路线'}</a><a class="text-link" href="#community-title" data-scroll="community-title">学习交流：公众号“极客行动”</a></div>
 </article>`;
 if(mapContext)return body;
 return embedded?`<section class="route-task-workspace" id="route-workspace"><div class="route-workspace-heading"><span>当前任务 · ${stage.title}</span><a class="text-link" href="#/route">收起任务，查看路线</a></div>${body}</section>`:`<div class="page task-page"><div class="task-return"><a class="text-link" href="#/library">返回实践指南</a><a class="text-link" href="#/route">我的路线</a></div>${body}</div>`;
}

function libraryOptions(){return {...state,...libraryView,taskList:route(),drafts:taskEditorDrafts};}
function library(){return libraryPage(libraryOptions());}
function captureLibraryView(){
 if(!$('#library-search'))return;
 libraryView.scroll=window.scrollY;
 libraryView.helpOpen=$('#library-help').open;
 libraryView.resourcesOpen=$('.guide-catalog .technical-supplement').open;
 const task=document.activeElement.closest('[data-library-task]');if(task)libraryView.focusId=task.dataset.libraryTask;
}
function bindLibrary(){
 const input=$('#library-search');if(!input)return;
 $('#library-help').open=libraryView.helpOpen;
 $('.guide-catalog .technical-supplement').open=libraryView.resourcesOpen;
 const reset=()=>{libraryView.query='';libraryView.stage='all';libraryView.track='all';libraryView.focusId=null;input.value='';update();input.focus({preventScroll:true});};
 const update=()=>{
  const model=libraryModel(libraryOptions());$('#library-results').innerHTML=libraryResults(model);
  $('#library-result-count').innerHTML=`显示 ${model.shown} / ${model.total} 项任务 · 必修 ${model.trackCounts.core} 项构成一条最小闭环，参考 ${model.trackCounts.reference} 项按需查阅`;
  document.querySelectorAll('[data-library-stage]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.libraryStage===libraryView.stage)));
  document.querySelectorAll('[data-library-count]').forEach(count=>count.textContent=model.counts[count.dataset.libraryCount]);
  document.querySelectorAll('[data-library-track]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.libraryTrack===libraryView.track)));
  document.querySelectorAll('[data-library-track-count]').forEach(count=>count.textContent=model.trackCounts[count.dataset.libraryTrackCount]);
  $('#library-reset')?.addEventListener('click',reset);
 };
 input.addEventListener('input',()=>{libraryView.query=input.value;libraryView.focusId=null;update();});
 document.querySelectorAll('[data-library-stage]').forEach(button=>button.onclick=()=>{libraryView.stage=button.dataset.libraryStage;libraryView.focusId=null;update();});
 document.querySelectorAll('[data-library-track]').forEach(button=>button.onclick=()=>{libraryView.track=button.dataset.libraryTrack;libraryView.focusId=null;update();});
 $('#library-results').addEventListener('click',event=>{const task=event.target.closest('[data-library-task]');if(task)libraryView.focusId=task.dataset.libraryTask;});
 $('#library-reset')?.addEventListener('click',reset);
}
function compare(){return `<div class="page"><div class="breadcrumb"><a href="#/">首页</a><span>/</span><span>典型路线对照</span></div><div class="page-title"><div class="eyebrow">DIFFERENT STARTS. SHARED DESTINATION.</div><h1>不是五套课程，是五种起点。</h1><p>下列为模拟用户；差异来自项目进度、实际能力和已有服务，而不是岗位标签本身。</p></div><div class="compare-wrap"><table class="compare-table"><thead><tr><th>模拟用户</th>${personas.map(p=>`<th>${p.role} · ${p.name}</th>`).join('')}</tr></thead><tbody><tr><th>当前情况</th>${personas.map(p=>`<td>${p.caption}</td>`).join('')}</tr><tr><th>第一步</th>${personas.map(p=>`<td>${generateRoute(p.profile)[0].title}</td>`).join('')}</tr><tr><th>实现能力</th>${personas.map(p=>`<td>${['frontend','backend','security'].map(k=>skills.find(x=>x[0]===k)[1]+'：'+levels[p.profile.skills[k]]).join('<br>')}</td>`).join('')}</tr><tr><th>新增基础桥接</th>${personas.map(p=>`<td>${generateRoute(p.profile).filter(t=>['web-basics','code-basics'].includes(t.id)).map(t=>t.title).join('<br>')||'已有开发经验，不增加通用编程入门'}</td>`).join('')}</tr><tr><th>推荐学习重点</th>${personas.map(p=>`<td>${p.role==='产品'?'需求证据→Web基础→接口与界面→交付与收费':p.role==='运营'?'服务拆解→报价→编程桥接→自助流程→人工成本':p.role==='前端'?'用户验证→接口契约→服务端与权限→获客收费':p.role==='后端'?'找人群与问题→体验与界面→获客交易→经营': '回访使用→报价→实现缺口确认→交付与支持'}</td>`).join('')}</tr><tr><th>可验证跳过</th>${personas.map(p=>`<td>${generateRoute(p.profile).filter(t=>t.mode==='confirm').map(t=>t.title).join('<br>')||'先用最小实践确认'}</td>`).join('')}</tr><tr><th>进入路线</th>${personas.map((p,i)=>`<td><button class="text-link" data-persona="${i}">查看完整路线</button></td>`).join('')}</tr></tbody></table></div><div class="notice">验证逻辑：仅修改岗位，不修改能力与项目情况，不应改变核心路线；已有手工服务通过独立选项确认。</div><a class="button green" href="#/profile">按我的情况规划</a></div>`;}
function showSection(id,behavior='instant'){const target=document.getElementById(id);if(!target)return;for(let parent=target;parent;parent=parent.parentElement)if(parent instanceof HTMLDetailsElement)parent.open=true;document.querySelectorAll('[data-scroll]').forEach(link=>link.classList.toggle('active',link.dataset.scroll===id));target.scrollIntoView({behavior,block:'start'});}
function render(options={}){
 const previousScroll=window.scrollY,oldMap=$('#map-workbench');
 if(oldMap?.dataset.mapMode==='preview')mapViewState={stageId:oldMap.dataset.mapStageId,taskId:oldMap.dataset.mapTaskId,scroll:previousScroll,pickerScroll:$('.map-task-options')?.scrollTop||0,criteriaOpen:$('.map-stage-criteria')?.open||false};
 closeRoutePanel();captureLibraryView();if(options.capture!==false)captureTaskEditor();
 const hash=location.hash||'#/';if(!hash.startsWith('#/'))return;
 const path=hash.slice(2).split('/'),view=path[0]||'home',j=journey();
 const map=view==='map'?mapSelection(j,path[1]||mapViewState.stageId,path[2]||(!path[1]?mapViewState.taskId:null)):null;
 const mapLearning=Boolean(map?.task&&path[3]==='learn');
 const activeTaskId=view==='route'&&path[1]==='task'?path[2]:view==='task'?path[1]:mapLearning?map.task.id:null;
 document.body.dataset.view=view;
 $('#global-route').innerHTML=globalRoute(j,{...state,activeTaskId,...(view==='map'?{taskHref:(id,section)=>mapTaskHref(j,id,section)}:{})});
 document.body.classList.toggle('has-route',Boolean(state.profile));
 const previewHref=map?`#/map/${map.stage.id}${map.task?'/'+map.task.id:''}`:null;
 const mapMarkup=mapLearning?taskPage(map.task.id,false,previewHref):'';
 $('#app').innerHTML=view==='start'?startPage(path[1],state.profile,state.worksheets,tasks):view==='map'?actionMapPage(j,state.records,{stageId:map.stage.id,taskId:map.task?.id},mapMarkup):view==='profile'?profilePage():view==='route'?routePage(path[1]==='task'?path[2]:null):view==='task'?taskPage(path[1]):view==='library'?library():view==='topics'?topicsPage():view==='topic'?topicPage(path[1],state.worksheets):view==='sources'?sourcesPage():view==='compare'?compare():view==='learn'?`<div class="page">${freeLibrary(state.profile)}</div>`:view==='cases'?casesPage(state.profile):view==='case'?casePage(path[1],state.profile):home();
 if(map&&!mapLearning&&hash!==previewHref)history.replaceState(null,'',previewHref);
 document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===view));
 document.title=(view==='topic'?(document.querySelector('.page-title h1')?.textContent||'经营专题'):activeTaskId?(j.list.find(t=>t.id===activeTaskId)?.title||tasks.find(t=>t.id===activeTaskId)?.title||'实践任务'):({home:'借助 AI，把已有经验变成产品。',start:'开始一项行动',map:'独立产品行动地图',profile:'规划我的路线',route:'我的路线',library:'实践指南',topics:'公司、收款与财税专题',sources:'资料来源与核验记录',compare:'典型路线对照',cases:'国内与海外完整案例',case:'独立开发全流程案例',learn:'六阶段行动与模板'}[view]||'指南'))+' · 独立之路';
 bind();
 const restoreMap=map&&!mapLearning&&map.stage.id===mapViewState.stageId&&map.task?.id===mapViewState.taskId;
 if(view==='library')document.getElementById('library-task-'+libraryView.focusId)?.focus({preventScroll:true});
 window.scrollTo({top:view==='library'?libraryView.scroll:options.preserveScroll?previousScroll:restoreMap?mapViewState.scroll:0,behavior:'instant'});
 if(mapLearning)showSection('map-learning');
 const section=mapLearning?path[4]:view==='task'?path[2]:view==='route'&&path[1]==='task'?path[3]:null;
 if(['why','practice','template','example','market-practice','resources','acceptance'].includes(section))showSection(section);
 if(view==='route'&&stages.some(s=>s.id===path[1]))showSection('route-'+path[1]);
 if(view==='route'&&path[1]==='profit')openRoutePanel('profit');
 if(view==='case'&&/^[1-7]$/.test(path[2]||''))document.getElementById('case-phase-'+path[2])?.scrollIntoView({block:'start'});
}

function closeRoutePanel(){
 const dialog=$('#route-dialog');if(dialog?.open)dialog.close();document.documentElement.classList.remove('route-panel-open');
}
function openRoutePanel(pane){
 const dialog=$('#route-dialog');if(!dialog)return;
 document.querySelectorAll('[data-route-pane]').forEach(section=>section.hidden=section.dataset.routePane!==pane);
 $('#route-panel-title').textContent={route:'完整路线',profit:'经营目标与记录',profile:'个人情况与路线依据'}[pane];
 document.querySelectorAll('[data-route-panel]').forEach(button=>button.setAttribute('aria-expanded',String(button.dataset.routePanel===pane)));
 if(!dialog.open){dialog.showModal();document.documentElement.classList.add('route-panel-open');}
 if(pane==='route')dialog.querySelector('[aria-current="page"]')?.scrollIntoView({block:'nearest'});
}
function bindRoutePanel(){
 const dialog=$('#route-dialog');if(!dialog)return;
 document.querySelectorAll('[data-route-panel]').forEach(button=>button.onclick=()=>openRoutePanel(button.dataset.routePanel));
 $('#route-panel-close').onclick=closeRoutePanel;
 dialog.addEventListener('close',()=>{if(dialog!==$('#route-dialog')||dialog.open)return;document.documentElement.classList.remove('route-panel-open');document.querySelectorAll('[data-route-panel]').forEach(button=>button.setAttribute('aria-expanded','false'));});
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeRoutePanel();}});
 dialog.querySelectorAll('a').forEach(link=>link.addEventListener('click',event=>{if(link.dataset.routeTask&&link.dataset.routeTask===$('.task-body[data-task-id]')?.dataset.taskId)event.preventDefault();closeRoutePanel();}));
}
function bind(){
 bindLibrary();
 bindRoutePanel();
 bindHome(journey());
 bindMap(journey(),state.records,(stageId,taskId)=>{mapViewState={stageId,taskId,scroll:window.scrollY};});
 bindProfit();
 document.querySelectorAll('[data-market-settings]').forEach(button=>button.onclick=()=>{state.draft=structuredClone(state.profile||state.draft);state.step=3;location.hash='#/profile';});
 $('#save-worksheet')?.addEventListener('click',event=>{
  const rawId=location.hash.split('/')[2],id=$('[data-worksheet-id]')?.dataset.worksheetId||(location.hash.startsWith('#/topic/')?'topic:'+rawId:rawId);
  const hadSheet=Object.hasOwn(state.worksheets,id),previous=state.worksheets[id];
  state.worksheets[id]=$('#start-worksheet').value;const saved=persist();
  if(!saved){if(hadSheet)state.worksheets[id]=previous;else delete state.worksheets[id];}
  syncWorksheetNote();updateTaskIndicators();
  $('#worksheet-status').textContent=saved?(event.currentTarget.dataset.afterSave?'已保存草稿，继续核对下方成果。':'已保存到本浏览器；草稿不计为任务完成。'):'本次未能写入浏览器存储，输入仍保留，请复制内容留存或重试。';
  if(saved&&event.currentTarget.dataset.afterSave)showSection(event.currentTarget.dataset.afterSave,'smooth');
 });
 $('#copy-worksheet')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#start-worksheet').value);toast('已复制当前内容');}catch{toast('无法自动复制，请选中模板手动复制');}});
document.querySelectorAll('[data-persona]').forEach(b=>b.onclick=()=>{if(state.profile&&(Object.keys(state.records).length||Object.keys(state.businessMonths).length||Object.keys(state.worksheets).length)&&!confirm('切换模拟用户会重置当前任务、经营记录和行动草稿。继续？'))return;loadPersona(Number(b.dataset.persona));});$('#profile-form')?.addEventListener('submit',e=>{e.preventDefault();collectForm();if(state.step<3){state.step++;render();}else{state.profile=structuredClone(state.draft);state.source=null;persist();location.hash='#/route';}});$('#profile-back')?.addEventListener('click',()=>{collectForm();state.step--;render();});const updatePreview=e=>{const before=generateRoute(state.draft,state.added);collectForm();const preview=$('#profile-preview');if(!preview)return;const opened=[...preview.querySelectorAll('details[open]')].map(d=>d.dataset.previewStage);preview.innerHTML=profilePreview(state.draft,{...state,before,field:e.target.name});preview.scrollTop=0;for(const id of opened)preview.querySelector(`[data-preview-stage="${id}"]`)?.setAttribute('open','');const country=$('#country-field');if(country)country.hidden=!['海外市场（产品出海）','国内和海外'].includes(state.draft.market);const notice=$('#form-notice');if(notice)notice.hidden=state.draft.form==='网页产品'||isPlatformProduct(state.draft);const mobileFields=$('#mobile-path-fields');if(mobileFields)mobileFields.hidden=!isPlatformProduct(state.draft);const phoneFields=$('#phone-platform-fields');if(phoneFields)phoneFields.hidden=!isMobile(state.draft);const wechatNote=$('#wechat-platform-note');if(wechatNote)wechatNote.hidden=!isWechat(state.draft);const store=$('#mobile-store-field');if(store)store.hidden=mobilePlatform(state.draft)!=='国内安卓商店';};$('#profile-form')?.addEventListener('input',updatePreview);document.querySelectorAll('[data-profile-step]').forEach(b=>b.onclick=()=>{collectForm();state.step=Number(b.dataset.profileStep);render();});document.querySelectorAll('#edit-profile,#edit-product-path').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();state.draft=structuredClone(state.profile||state.draft);state.step=1;persist();if(location.hash==='#/profile')render();else location.hash='#/profile';}));document.querySelectorAll('[data-scroll]').forEach(a=>a.onclick=e=>{e.preventDefault();document.querySelectorAll('[data-scroll]').forEach(x=>x.classList.toggle('active',x===a));showSection(a.dataset.scroll,'smooth');});document.addEventListener('click',async event=>{const button=event.target.closest('[data-copy]');if(!button)return;const target=document.querySelector(button.dataset.copy);try{await navigator.clipboard.writeText(target?.value??target?.textContent??'');toast('已复制到剪贴板');}catch{toast('无法自动复制，请选中后手动复制');}});$('#copy-template')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(($('#worksheet')||$('#start-worksheet')).value??$('#worksheet').textContent);toast('已复制模板，填写真实实践结果');}catch{toast('无法自动复制，请选中模板手动复制');}});$('#add-task')?.addEventListener('click',()=>{const id=$('.task-body[data-task-id]').dataset.taskId;if(!state.added.includes(id))state.added.push(id);persist();toast('已加入路线，保留主动加入标记');render();});
 if($('.task-body[data-task-id]')&&$('#acceptance-workbench')){
  const id=$('.task-body[data-task-id]').dataset.taskId,list=route(),task=list.find(t=>t.id===id)||taskForProfile(tasks.find(t=>t.id===id),state.profile),record=state.records[id],draft=taskEditorDrafts.get(id),sheet=$('#start-worksheet'),lesson=adaptLesson(task,state.profile);
  const afterSave=()=>{render({capture:false});showSection('acceptance');$('#saved-result')?.focus({preventScroll:true});};
  bindAcceptance({root:$('#acceptance'),task,list:list.some(t=>t.id===id)?list:[task,...list],record,draft,sheet,hasSaved:Object.hasOwn(state.worksheets,id)||Boolean(draft?.dirty),showSection,onChange:updateTaskIndicators,help:['先联系熟悉的同行、原同事或行业社区中的一位目标用户。',lesson.pitfalls[0],lesson.pitfalls[1]||'保存实际输出，对照样例调查。','核对个人情况与当前项目，选择更贴近本轮问题的任务。'],onSave:next=>{
   const card=Boolean(next.blocker);if(card)captureTaskEditor();
   const worksheet=sheet&&(Object.hasOwn(state.worksheets,id)||sheet.value!==sheet.defaultValue||taskEditorDrafts.get(id)?.dirty)?sheet.value:undefined;
   if(!commitTaskRecord(state,id,next,worksheet,persist))return false;
   if(!card)taskEditorDrafts.delete(id);else delete taskEditorDrafts.get(id).nextStep;afterSave();return true;
  },onDecision:next=>{
   captureTaskEditor();
   if(!commitTaskRecord(state,id,next,undefined,persist))return false;
   const pending=taskEditorDrafts.get(id);if(pending){delete pending.nextStep;if(pending.feedback.observation===(record?.observation||''))delete pending.feedback.observation;}
   afterSave();return true;
  }});
  $('.acceptance-editor').addEventListener('toggle',updateTaskIndicators);
  $('#start-worksheet')?.addEventListener('input',()=>{syncWorksheetNote();updateTaskIndicators();});
  document.querySelectorAll('.checklist input').forEach(input=>input.addEventListener('change',updateTaskIndicators));
  document.querySelectorAll('.task-block').forEach(block=>block.addEventListener('toggle',()=>{if(block.open){document.querySelectorAll('.task-workflow [data-scroll]').forEach(link=>{const active=link.dataset.scroll===block.id;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});}}));
  updateTaskIndicators();
 }

}
function captureTaskEditor(){
 const body=$('.task-body[data-task-id]'),sheet=$('#start-worksheet');if(!body||!sheet)return;
 const id=body.dataset.taskId,task=route().find(t=>t.id===id)||taskForProfile(tasks.find(t=>t.id===id),state.profile);
 taskEditorDrafts.set(id,{...acceptanceDraft($('#acceptance')),worksheet:sheet.value,dirty:state.worksheets[id]!==undefined?sheet.value!==state.worksheets[id]:sheet.value!==sheet.defaultValue||Boolean(taskEditorDrafts.get(id)?.dirty),criteria:JSON.stringify(task.checks),section:$('.task-block[open]')?.id||'resources'});
}
function updateTaskIndicators(){
 const body=$('.task-body[data-task-id]');if(!body)return;const id=body.dataset.taskId,sheet=$('#start-worksheet');
 const hasSaved=Object.hasOwn(state.worksheets,id),dirty=sheet&&(hasSaved?sheet.value!==state.worksheets[id]:sheet.value!==sheet.defaultValue||Boolean(taskEditorDrafts.get(id)?.dirty));
 if($('#draft-indicator'))$('#draft-indicator').textContent=dirty?'尚未保存':hasSaved?'已存草稿':'填写模板';
 if($('#worksheet-status')&&dirty)$('#worksheet-status').textContent='内容已修改，尚未保存到本浏览器。切换任务会暂存输入，刷新前请保存。';
 const checks=[...document.querySelectorAll('.checklist input')],checked=checks.filter(i=>i.checked).length;
 if($('#check-indicator'))$('#check-indicator').textContent=$('#acceptance-workbench')?.dataset.mode==='stuck'?($('.acceptance-editor').tagName!=='DETAILS'||$('.acceptance-editor').open?'记录卡点':'卡点已记录'):`${checked}/${checks.length} 核对`;
}
function syncWorksheetNote(){
 const id=$('.task-body[data-task-id]')?.dataset.taskId;if(id)syncAcceptanceWorksheet($('#acceptance'),$('#start-worksheet'),Object.hasOwn(state.worksheets,id)||Boolean(taskEditorDrafts.get(id)?.dirty));
}
function bindProfit(){
 const form=$('#profit-form');if(!form)return;
 const loadMonth=()=>{const month=$('#profit-month').value,entry=state.businessMonths[month+'-'+(state.profile.currency||'CNY')];for(const name of ['income','cost','hours','evidence'])$('#profit-'+name).value=entry?.[name]??'';};
 $('#profit-month').onchange=loadMonth;loadMonth();
 document.querySelectorAll('[data-edit-month]').forEach(button=>button.onclick=()=>{if(button.dataset.monthCurrency!==(state.profile.currency||'CNY')){toast('请先在个人情况中选择这条记录的币种');return;}$('#profit-details').open=true;$('#profit-month').value=button.dataset.editMonth;loadMonth();form.scrollIntoView({behavior:'smooth'});});
 form.onsubmit=e=>{e.preventDefault();const entry={month:$('#profit-month').value,currency:state.profile.currency||'CNY',income:$('#profit-income').value,cost:$('#profit-cost').value,hours:$('#profit-hours').value,evidence:$('#profit-evidence').value.trim()};if(!validMonth(entry)){$('#profit-error').hidden=false;$('#profit-error').textContent='请填写已结束月份、非负收支与工时，并写下记录依据。';return;}const key=entry.month+'-'+entry.currency,previous=state.businessMonths[key];state.businessMonths[key]=entry;if(persist()){toast('经营记录已保存；按自填数据对照目标');render({preserveScroll:true});openRoutePanel('profit');}else{if(previous===undefined)delete state.businessMonths[key];else state.businessMonths[key]=previous;$('#profit-error').hidden=false;$('#profit-error').textContent='未能保存，请保留当前输入后重试。';}};
}
function openSearch(){const dialog=$('#search-dialog');if(!dialog.open)dialog.showModal();$('#search-input').value='';search('');$('#search-input').focus();}
function search(query){
 const matches=searchTasks(tasks,query),topicMatches=query.trim()?searchTopics(query):[];
 const topicResults=topicMatches.map(({topic:t,snippet})=>`<a class="search-result" href="#/topic/${t.id}"><small>按需经营专题 · ${escape(t.jurisdiction)}</small><br><strong>${escape(t.title)}</strong><p>${escape(snippet)}…</p></a>`).join('');
 $('#search-results').innerHTML=matches.length||topicMatches.length?topicResults+matches.map(({task:t,snippet})=>`<a class="search-result" href="#/task/${t.id}"><small>学习任务 · ${stageForTaskId(t.id).title}</small><br><strong>${escape(t.title)}</strong><p>${escape(snippet)}…</p><small>${escape(t.resources.map(r=>r.name).join(' / '))}</small></a>`).join(''):'<div class="no-results">没有匹配结果。试试“不会编程”“用户”“接口”“退款”或“FastAPI”。</div>';
 document.querySelectorAll('.search-result').forEach(a=>a.onclick=()=>$('#search-dialog').close());
}
$('#search-open').onclick=openSearch;$('#mobile-search').onclick=openSearch;$('#search-close').onclick=()=>$('#search-dialog').close();$('#search-input').oninput=e=>search(e.target.value);$('#search-dialog').onclick=e=>{if(e.target===$('#search-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}};document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();openSearch();}});
// Umami 只接管 pushState；本站是 hash 路由，导航后需手动补一次页面浏览（url 取当前完整地址）。
const trackPageview=()=>window.umami?.track(props=>({...props,url:location.href}));
window.addEventListener('hashchange',()=>{render();trackPageview();});
render();

window.addEventListener('storage',event=>{if(event.key!=='indie-path-v1'||!event.newValue)return;try{const saved=JSON.parse(event.newValue);if(!saved||typeof saved!=='object')return;state={...state,...saved};const [view,section,,mode]=location.hash.slice(2).split('/');if(['map','route',''].includes(view)&&!(view==='route'&&section==='task')&&!(view==='map'&&mode==='learn'))render({preserveScroll:true});}catch{}});
