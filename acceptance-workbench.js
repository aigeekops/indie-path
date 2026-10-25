import {resultMatches} from './acceptance.js';
import {decisions} from './progress.js';
const e=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const blockers=['找不到目标用户','不会实现或缺少前置知识','结果不符合预期','任务不适合当前项目'];

export function selfCheckRecord(task,previous,{note,observation='',source='worksheet',mode='done'},now=new Date().toISOString()){
 const keepDecision=resultMatches(previous,task)&&decisions[previous.decision];
 return {...previous,status:mode,note:note.trim(),noteSource:source,observation:observation.trim(),criteria:JSON.stringify(task.checks),decision:keepDecision?previous.decision:null,nextTask:keepDecision&&previous.decision==='adjust'?previous.nextTask:null,blocker:null,blockerActive:false,date:now};
}
export function blockerRecord(task,previous,{blocker,note='',achievementNote,achievementSource},now=new Date().toISOString()){
 const completed=resultMatches(previous,task);
 return {...previous,status:completed?previous.status:'stuck',note:!completed&&achievementNote?.trim()?achievementNote.trim():previous?.note||'',noteSource:!completed&&achievementNote?.trim()?achievementSource:previous?.noteSource,blockerNote:note.trim(),blocker,criteria:previous?.criteria??null,decision:completed?previous.decision??null:null,nextTask:completed?previous.nextTask??null:null,blockerActive:true,date:now};
}
export function decisionRecord(task,previous,{decision,nextTask,observation},list,now=new Date().toISOString()){
 if(!resultMatches(previous,task)||!decisions[decision]||decision==='adjust'&&!list.some(t=>t.id===nextTask))return null;
 return {...previous,decision,blockerActive:false,nextTask:decision==='adjust'?nextTask:null,observation:observation===undefined?previous.observation||'':observation.trim(),date:now};
}
export function selfCheckError(task,checks,note){
 if(!note.trim())return {message:'先补充成果说明，或在上一步填写成果草稿。',target:'result-note'};
 const missing=task.checks.findIndex((_,i)=>!checks[i]);
 return missing<0?null:{message:`还有 ${task.checks.length-checks.filter(Boolean).length} 项待核对；未完成时可以记录卡点。`,target:`check-${missing}`};
}
export function acceptanceEditor(task,record,draft,worksheet,helpHtml){
 const valid=resultMatches(record,task),feedback=draft?.feedback||{};
 const hasSheet=worksheet!==undefined&&worksheet!==null&&Boolean(worksheet.trim());
 const artifact=record?.status!=='stuck'||record?.noteSource?record?.note||'':'';
 const source=draft?.noteSource==='worksheet'&&hasSheet?'worksheet':draft?.source||((artifact&&artifact!==worksheet)?'record':hasSheet?'worksheet':'manual');
 const note=feedback.note??artifact;
 const mode=draft?.mode||(record?.status==='stuck'||record?.blockerActive?'stuck':record?.status==='skipped'?'skipped':'done');
 const completeMode=draft?.completeMode||(mode==='skipped'||record?.status==='skipped'||record?.noteSource==='existing'?'skipped':'done');
 const checks=draft?.criteria===JSON.stringify(task.checks)?draft.checks:task.checks.map(()=>valid);
 const blocker=feedback.blocker??record?.blocker??'';
 const blockerNote=feedback.blockerNote??(draft?.mode==='stuck'?feedback.note:undefined)??record?.blockerNote??(record?.status==='stuck'?record.note:'')??'';
 const editorTag=record?'details':'div';
 return `<${editorTag} class="acceptance-editor ${record?'':'acceptance-editor-new'}" ${record&&!valid&&record.status!=='stuck'?'open':''}>${record?'<summary>更新本次记录</summary>':''}<div class="acceptance-workbench" id="acceptance-workbench" data-mode="${mode}" data-complete-mode="${completeMode}" data-source="${source}">
 <section id="completion-panel" ${mode==='stuck'?'hidden':''}><form id="result-form" novalidate>
 <div class="achievement-reference"><div class="achievement-reference-heading"><strong id="achievement-source-label">${source==='worksheet'?'已关联你的成果草稿':source==='record'?'已保存的成果说明':'成果说明或位置'}</strong><button type="button" class="text-link" id="use-existing">用已有成果确认</button></div><p class="achievement-preview" id="achievement-preview">${e(source==='worksheet'?worksheet:note||'还没有成果记录，先补充一份可核对的成果。')}</p><details class="achievement-source" id="achievement-source" ${!hasSheet&&!note?'open':''}><summary>查看 / 修改成果</summary><div id="worksheet-reference" ${source==='worksheet'?'':'hidden'}><pre id="linked-worksheet">${e(worksheet||'')}</pre><button class="text-link" type="button" id="edit-linked-worksheet">修改成果草稿 →</button></div><div id="existing-reference" ${source==='worksheet'?'hidden':''}><label for="result-note">成果说明或位置</label><textarea id="result-note" rows="3" placeholder="说明已完成的工作，或填写成果位置。">${e(note)}</textarea></div><button type="button" class="text-link" id="use-worksheet" ${hasSheet&&source!=='worksheet'?'':'hidden'}>引用当前成果草稿</button></details></div>
 <div class="checklist" aria-label="逐项核对成果">${task.checks.map((text,i)=>`<label><input type="checkbox" name="check-${i}" ${checks?.[i]?'checked':''}>${e(text)}</label>`).join('')}</div>
 <details class="acceptance-feedback" ${feedback.observationOpen?'open':''}><summary>补充本次反馈（选填）</summary><label for="result-observation">实际反馈或运行结果</label><textarea id="result-observation" rows="2" placeholder="草稿中已有的内容无需重复填写。">${e(feedback.observation??record?.observation??'')}</textarea></details>
 
 <p class="form-error" id="result-error" role="alert" hidden></p><div class="acceptance-actions"><button type="submit" class="button small green">保存自检结果</button><button type="button" class="text-link" id="record-blocker">我卡住了</button></div><details class="lesson-check-help"><summary>查看本阶段的验收说明</summary>${helpHtml}<p class="quiet">逐项确认完成标准；草稿、自检与真实经营结果分别记录。</p></details></form></section>
 <section id="blocker-panel" ${mode==='stuck'?'':'hidden'}><form id="blocker-form" novalidate><fieldset class="blocker-choices"><legend>卡在哪里？</legend>${blockers.map(label=>`<label><input type="radio" name="blocker" value="${e(label)}" ${blocker===label?'checked':''}><span>${e(label)}</span></label>`).join('')}${blocker&&!blockers.includes(blocker)?`<label><input type="radio" name="blocker" value="${e(blocker)}" checked><span>${e(blocker)}</span></label>`:''}</fieldset><p class="blocker-help" id="blocker-help"></p><details class="blocker-extra" ${blockerNote?'open':''}><summary>补充说明（选填）</summary><label for="blocker-note">记录现在发生了什么</label><textarea id="blocker-note" rows="2">${e(blockerNote)}</textarea></details><p class="form-error" id="blocker-error" role="alert" hidden></p><div class="acceptance-actions"><button type="submit" class="button small green">保存卡点</button><button type="button" class="text-link" id="return-checks">返回核对</button></div><p class="acceptance-footnote">记录卡点不增加完成数；已有自检成果会保留。</p></form></section>
 </div></${editorTag}>`;
}
export function acceptanceDraft(root){
 const work=root.querySelector('#acceptance-workbench');if(!work)return {};
 const q=s=>root.querySelector(s);
 return {mode:work.dataset.mode,completeMode:work.dataset.completeMode,source:work.dataset.source,noteSource:work.dataset.source,checks:[...root.querySelectorAll('.checklist input')].map(i=>i.checked),feedback:{note:q('#result-note').value,observation:q('#result-observation').value,observationOpen:q('.acceptance-feedback').open,blocker:q('[name="blocker"]:checked')?.value||'',blockerNote:q('#blocker-note').value},nextStep:{decision:q('[name="next-decision"]:checked')?.value||'',nextTask:q('#decision-target')?.value,observation:q('#decision-observation')?.value,open:q('#next-step-options')?.open||false}};
}
export function syncAcceptanceWorksheet(root,sheet,hasSaved){
 const q=s=>root.querySelector(s),work=q('#acceptance-workbench');if(!work||!sheet)return;
 const available=(hasSaved||sheet.value!==sheet.defaultValue)&&Boolean(sheet.value.trim());
 if(available&&work.dataset.source==='manual'&&!q('#result-note').value.trim()&&work.dataset.completeMode==='done'){
  work.dataset.source='worksheet';q('#worksheet-reference').hidden=false;q('#existing-reference').hidden=true;q('#achievement-source-label').textContent='已关联你的成果草稿';q('#achievement-source').open=false;
 }
 q('#linked-worksheet').textContent=available?sheet.value:'';
 q('#use-worksheet').hidden=!available||work.dataset.source==='worksheet';
 if(work.dataset.source==='worksheet')q('#achievement-preview').textContent=sheet.value;
}
export function bindAcceptance({root,task,list,record,draft,sheet,hasSaved,help,showSection,onChange,onSave,onDecision}){
 const q=s=>root.querySelector(s),work=q('#acceptance-workbench');if(!work)return;
 const mode=value=>{work.dataset.mode=value;q('#completion-panel').hidden=value==='stuck';q('#blocker-panel').hidden=value!=='stuck';onChange();};
 const source=(value,existing=false)=>{work.dataset.source=value;if(value==='worksheet')work.dataset.completeMode='done';else if(existing)work.dataset.completeMode='skipped';if(work.dataset.mode!=='stuck')work.dataset.mode=work.dataset.completeMode;q('#worksheet-reference').hidden=value!=='worksheet';q('#existing-reference').hidden=value==='worksheet';q('#achievement-source-label').textContent=value==='worksheet'?'已关联你的成果草稿':work.dataset.completeMode==='skipped'?'使用已有成果确认':'成果说明或位置';q('#achievement-preview').textContent=value==='worksheet'?sheet.value:q('#result-note').value||'填写已有成果的说明或位置。';q('#achievement-source').open=value!=='worksheet';syncAcceptanceWorksheet(root,sheet,hasSaved);};
 q('#use-existing').onclick=()=>{source('existing',true);q('#result-note').focus({preventScroll:true});};
 q('#use-worksheet').onclick=()=>source('worksheet');
 q('#edit-linked-worksheet').onclick=()=>showSection('template','smooth');
 q('#result-note').oninput=()=>{if(work.dataset.source!=='worksheet')q('#achievement-preview').textContent=q('#result-note').value;};
 q('#record-blocker').onclick=()=>{mode('stuck');q('[name="blocker"]')?.focus({preventScroll:true});showSection('acceptance');};
 q('#return-checks').onclick=()=>{mode(work.dataset.completeMode);root.querySelector('.checklist input')?.focus({preventScroll:true});showSection('acceptance');};
 const blockerHelp=()=>{const selected=q('[name="blocker"]:checked')?.value;q('#blocker-help').textContent=selected?help[blockers.indexOf(selected)]||'保留当前记录，再核对实际结果。':'';};
 root.querySelectorAll('[name="blocker"]').forEach(input=>input.onchange=blockerHelp);blockerHelp();
 q('#result-form').onsubmit=event=>{
  event.preventDefault();const note=work.dataset.source==='worksheet'?sheet.value:q('#result-note').value;
  const error=selfCheckError(task,[...root.querySelectorAll('.checklist input')].map(i=>i.checked),note);
  if(error){q('#result-error').hidden=false;q('#result-error').textContent=error.message;if(error.target==='result-note'){q('#achievement-source').open=true;source('manual');q('#result-note').focus();}else q(`[name="${error.target}"]`).focus();return;}
  if(!onSave(selfCheckRecord(task,record,{note,observation:q('#result-observation').value,source:work.dataset.source,mode:work.dataset.completeMode}))){q('#result-error').hidden=false;q('#result-error').textContent='未能保存到本浏览器，当前输入仍保留，请重试。';}
 };
 q('#blocker-form').onsubmit=event=>{event.preventDefault();const blocker=q('[name="blocker"]:checked')?.value;if(!blocker){q('#blocker-error').hidden=false;q('#blocker-error').textContent='选择一个当前卡点即可保存。';q('[name="blocker"]')?.focus();return;}if(!onSave(blockerRecord(task,record,{blocker,note:q('#blocker-note').value,achievementNote:work.dataset.source==='worksheet'?sheet.value:q('#result-note').value,achievementSource:work.dataset.source}))){q('#blocker-error').hidden=false;q('#blocker-error').textContent='未能保存到本浏览器，当前输入仍保留，请重试。';}};
 const nextForm=q('#next-step-form');
 if(nextForm){
  const target=()=>q('#decision-target-field').hidden=q('[name="next-decision"]:checked')?.value!=='adjust';
  root.querySelectorAll('[name="next-decision"]').forEach(input=>input.onchange=target);target();
  nextForm.onsubmit=event=>{event.preventDefault();const next=decisionRecord(task,record,{decision:q('[name="next-decision"]:checked')?.value,nextTask:q('#decision-target').value,observation:q('#decision-observation').value},list);if(!next){q('#decision-error').hidden=false;q('#decision-error').textContent='先选择下一步；需要调整时请选择一项实践。';return;}if(!onDecision(next)){q('#decision-error').hidden=false;q('#decision-error').textContent='下一步尚未保存，原成果和决定保持不变，请重试。';}};
 }
 const nextLink=q('[data-continue-task]');
 if(nextLink)nextLink.onclick=event=>{event.preventDefault();const href=nextLink.getAttribute('href'),next=decisionRecord(task,record,{decision:'continue'},list);if(next&&onDecision(next))location.hash=href;else{q('#decision-error').hidden=false;q('#decision-error').textContent='未能保存下一步，当前成果仍保留，请重试。';}};
 syncAcceptanceWorksheet(root,sheet,hasSaved);onChange();
}
