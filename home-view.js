import {isMobile,isWechat} from './product-paths.js';
import {renderExample,bindExample} from './home-example.js';
import {actionStages} from './action-map.js';
const esc=(value='')=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderHome(profile,journey){
 const selected=Math.max(0,journey.stages.findIndex(s=>s.current)),preview=homePreview(journey.stages[selected]);
 return `<div class="home-page"><div class="dark-stage"><section class="hero shell">
<div class="hero-copy"><div class="eyebrow"><span class="live-dot"></span> INDEPENDENT BUILDER / 开源实践指南</div><h1>借助 AI，<br>把已有经验<br><span>变成产品。</span></h1><p class="hero-description">把已有经验变成产品，在实践中补齐能力。<br>从验证需求到持续经营，向自己的盈利目标前进。</p><div class="hero-workflow"><span>01 验证问题</span><b>→</b><span>02 交付产品</span><b>→</b><span>03 验证收入</span></div><div class="hero-actions"><a class="primary-button" href="#/profile">生成我的实践路线 <svg class="icon" aria-hidden="true" focusable="false"><use href="./assets/brand/icons.svg#next"/></svg></a><a class="quiet-button" href="#/map"><svg class="icon" aria-hidden="true" focusable="false"><use href="./assets/brand/icons.svg#map"/></svg>探索行动地图</a></div>${profile?'<a class="returning-link" href="#/route">继续我的路线</a>':''}</div>
<div class="builder-workspace" aria-label="六阶段行动路线，悬停或聚焦预览，点击进入任务">
<div class="workbench-caption"><span><i></i> INDIE PATH / WORKSPACE</span><span>${profile?'个人路线':'公共路线'}</span></div>
<div class="map-workspace-head"><strong>从问题，到持续经营。</strong><span>${journey.completed} / ${journey.list.length} 已自检</span></div>
<div class="workspace-nodes"><svg class="workspace-wires" viewBox="0 0 600 240" preserveAspectRatio="none" aria-hidden="true">${['M100 42H300','M300 42H500','M500 42V162','M500 162H300','M300 162H100'].map((d,i)=>`<path d="${d}" data-wire="${i}" class="${i===selected||i===selected-1?'selected':''}"/>`).join('')}</svg>
${journey.stages.map((stage,i)=>`<button class="workspace-node workspace-stop-${i+1} ${i===selected?'active':''} ${stage.current?'is-current':''}" data-stage="${i}" aria-pressed="${i===selected}"><span class="workspace-dot">0${i+1}</span><span class="workspace-title">${stage.title}<small>${stage.current?'当前推荐':stage.status} · ${stage.completed}/${stage.tasks.length}</small></span></button>`).join('')}
</div>
<a class="workspace-task" id="next-card" href="${preview.href}"><div class="workspace-task-top"><span><i></i> <span id="preview-label">阶段预览</span></span><span id="preview-number">0${selected+1} / 06</span></div><strong id="preview-title">${esc(preview.title)}</strong><p id="preview-detail">${esc(preview.detail)}</p><div class="workspace-task-bottom"><span id="preview-output">${esc(preview.output)}</span><span class="workspace-enter">进入任务 ↗</span></div></a>
<div class="workspace-status"><span>● 本地进度 · 自动保存</span><span>聚焦预览 / 点击进入</span></div>
</div>
</section>
<div class="proof-strip shell"><div class="strip-intro">从已有经验出发，<br><strong>推进自己的产品。</strong></div><div><strong>学<span>能力</span></strong><p>按当前缺口选读资源</p></div><div><strong>做<span>产品</span></strong><p>用真实反馈检验方案</p></div><div><strong>看<span>经营</span></strong><p>用实际收支对照目标</p></div></div>
</div>
<section class="start-section shell" id="start"><div class="section-heading"><div><div class="eyebrow light-eyebrow">01 / START WHERE YOU ARE</div><h2>你现在，<br>卡在哪里？</h2></div><p>不必从头学一遍。<br>选择当前阶段，先完成一项具体行动。</p></div>
<div class="start-grid">
<a class="start-card" href="#/start/find"><div class="start-top"><span>01 / DISCOVER</span></div><div class="card-graphic graphic-discover" aria-hidden="true"><span></span><span></span><span></span><i></i></div><h3>不知道做什么</h3><p>从一次真实经历开始，<br>找到值得继续验证的问题。</p><div class="start-bottom"><span>问题访谈模板</span><span>开始填写</span></div></a>
<a class="start-card" href="#/start/scope"><div class="start-top"><span>02 / BUILD</span></div><div class="card-graphic graphic-build" aria-hidden="true"><i></i><i></i><i></i></div><h3>正在开发</h3><p>裁掉无关功能，<br>留下一条能验证价值的主流程。</p><div class="start-bottom"><span>首版范围裁剪表</span><span>开始填写</span></div></a>
<a class="start-card featured" href="${isMobile(profile)?'#/task/app-store-growth':isWechat(profile)?'#/task/wx-growth':'#/start/reach'}"><div class="start-top"><span>03 / REACH</span></div><div class="card-graphic graphic-reach" aria-hidden="true"><i></i><i></i><i></i><svg class="hero-icon" aria-hidden="true" focusable="false"><use href="./assets/brand/icons.svg#people"/></svg></div><h3>已经上线没人用</h3><p>从一个渠道接触目标用户，<br>追踪到一次真正的使用。</p><div class="start-bottom"><span>首批用户接触计划</span><span>开始填写</span></div></a>
</div></section>
${renderExample(journey)}<section class="field-guide"><div class="shell guide-layout"><div><div class="eyebrow light-eyebrow">02 / A PRACTICAL FIELD GUIDE</div><h2>把每个问题，<br>推进成一次行动。</h2><p>每项实践都有精选资源、操作步骤和验收标准。<br>学习结果与经营反馈分别记录，决定下一轮行动。</p><a class="dark-button" href="#/map"><svg class="icon" aria-hidden="true" focusable="false"><use href="./assets/brand/icons.svg#map"/></svg>查看完整行动地图</a></div><div class="guide-links"><a href="#/learn"><svg class="icon" aria-hidden="true" focusable="false"><use href="./assets/brand/icons.svg#book"/></svg><div><strong>六阶段行动与模板</strong><p>中文说明直接开始，国外课程按需选读。</p></div></a><a href="#/profile"><svg class="icon" aria-hidden="true" focusable="false"><use href="./assets/brand/icons.svg#sliders"/></svg><div><strong>按我的情况规划</strong><p>复用已有能力，只补当前需要的缺口。</p></div></a><a href="#/cases"><svg class="icon" aria-hidden="true" focusable="false"><use href="./assets/brand/icons.svg#case"/></svg><div><strong>按需对照教学案例</strong><p>看完整过程；人物与经营数字均为模拟。</p></div></a></div></div></section>
</div>`;
}

function homePreview(stage){
 const summary=actionStages.find(s=>s.id===stage.id);
 return {title:stage.entry?.title||stage.title,detail:summary.action,output:`${stage.status} · ${stage.completed}/${stage.tasks.length} 已自检`,href:stage.href};
}
export function bindHome(journey){
 bindExample();
 for(const button of document.querySelectorAll('[data-stage]')){
 const preview=()=>{
  const i=Number(button.dataset.stage),p=homePreview(journey.stages[i]);
  for(const node of document.querySelectorAll('[data-stage]')){const active=node===button;node.classList.toggle('active',active);node.setAttribute('aria-pressed',String(active));}
  for(const wire of document.querySelectorAll('[data-wire]'))wire.classList.toggle('selected',Number(wire.dataset.wire)===i||Number(wire.dataset.wire)===i-1);
  document.getElementById('preview-label').textContent=journey.stages[i].title+' / 阶段预览';
  document.getElementById('preview-number').textContent=`0${i+1} / 06`;
  document.getElementById('preview-title').textContent=p.title;
  document.getElementById('preview-detail').textContent=p.detail;
  document.getElementById('preview-output').textContent=p.output;
  document.getElementById('next-card').href=p.href;
 };
 button.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')preview();});
 button.addEventListener('focus',preview);
 button.addEventListener('keydown',event=>{const keys={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1};if(keys[event.key]){event.preventDefault();const nodes=[...document.querySelectorAll('[data-stage]')];nodes[(Number(button.dataset.stage)+keys[event.key]+nodes.length)%nodes.length].focus();}});
 button.addEventListener('click',()=>{preview();location.hash=homePreview(journey.stages[Number(button.dataset.stage)]).href.slice(1);});
 }
}
