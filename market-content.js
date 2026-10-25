import {content} from './generated/content.js';
export const marketCheckedAt=content.checkedAt;
export const marketOptions=['尚未确定','国内客户','海外市场（产品出海）','国内和海外'];
export const customerOptions=['尚未确定','个人或自由职业者','企业或团队'];
export const languageOptions=['中文','英文','中英双语','其他语言'];
export const marketSources=content.marketSources;
export const cases=content.cases;
export const implementationSamples=content.implementationSamples;
export const sharedImplementation=content.sharedImplementation;
// 只在实际影响渠道、交易和交付的任务中增加市场条件。
export const marketTopicByTask={price:'收费',ui:'交付',usability:'交付',ship:'交付',reach:'获客',charge:'收费'};
export const selectedCaseIds=p=>p?.market==='国内客户'?['domestic']:p?.market==='海外市场（产品出海）'?['overseas']:['domestic','overseas'];
export function marketContext(p,phase){
 const market=p?.market||'尚未确定',customer=p?.customer||'尚未确定',language=p?.language||'中文';
 const vars={market,customer,language,country:p?.country?.trim()||'尚未确定，先选一个可接触且能验证的市场'};
 const c=content.contexts.market;
 const fill=text=>text.replace(/\{(market|customer|language|country)\}/g,(_,key)=>vars[key]);
 const parts=[fill(c.overview)];
 if(customer==='企业或团队')parts.push(c[phase<=2?'enterpriseEarly':phase===6?'enterpriseCharge':'enterprise']);
 if(customer==='个人或自由职业者')parts.push(c[phase<=2?'individualEarly':phase===6?'individualCharge':'individual']);
 if(customer==='尚未确定')parts.push(c.unknownCustomer);
 if(language!=='中文')parts.push(c.language);
 if(market==='海外市场（产品出海）')parts.push(fill(c.overseas));
 return parts;
}

export function marketTask(task,p){
 if(!marketTopicByTask[task.id])return {...task};
 const phase=task.caseChapter,market=p?.market||'尚未确定';
 const extra=market==='国内客户'?`已按国内客户情境核对本阶段成果及适用条件`:market==='海外市场（产品出海）'?`已写明目标国家，并按海外客户情境核对本阶段成果`:'已明确本轮客户市场，或记录尚未确定的证据缺口';
 const context=`客户：${p?.customer||'尚未确定'}；交付：${p?.language||'中文'}${market==='海外市场（产品出海）'?`；首个国家/地区：${p?.country?.trim()||'待确定'}`:''}`;
 return {...task,checks:[...task.checks,`${extra}（${context}）`],marketPhase:phase};
}
export function caseSearchText(task){
 return Object.values(cases).map(c=>{const x=c.phases[task.caseChapter];return [c.title,c.audience,x.title,...x.learn,...x.practice,x.artifact,x.bad,...x.checks,...x.branches.flatMap(b=>[b.when,b.action]),...x.resources.flatMap(r=>[r.name,r.chapter,r.goal])].join(' ');}).join(' ');
}
