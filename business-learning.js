import {content} from './generated/content.js';
import {stageForTaskId} from './stages.js';
import {marketSources,marketTopicByTask} from './market-content.js';
export const businessCheckedAt=content.checkedAt;
export const businessReadings=content.businessReadings;
export const businessStages=content.stages;
export function stageMarketPractice(stage,profile){
 if(!marketTopicByTask[stage.task])return '';
 if(profile?.market==='国内客户')return stage.domesticPractice;
 if(profile?.market==='海外市场（产品出海）')return stage.exportPractice;
 return content.contexts.market[profile?.market==='国内和海外'?'stageBoth':'stageUnknown'];
}
export function stageForTask(task){return businessStages.find(s=>s.id===stageForTaskId(task.id)?.id);}
export function businessMaterials(task,profile,base){
 const stage=stageForTask(task);if(!stage)return base;
 if(task.id==='charge')return base;
 if(task.id==='support')return {...base,readings:[businessReadings.support,...base.readings]};
 if(task.id==='operate')return {...base,readings:[businessReadings.operations,businessReadings.support,...base.readings]};
 if(task.id==='scope')return {...base,readings:[businessReadings.design,businessReadings.observation]};
 if(task.id==='usability')return {...base,readings:[businessReadings.observation,businessReadings.localization]};
 if(task.id==='reach')return {...base,readings:[businessReadings.recruit,businessReadings.seo]};
 if(task.id==='price')return {...base,readings:[businessReadings.price]};
 return base;
}
export const acquisitionOptional=marketSources.hunt;
export function stageSearchText(task){const s=stageForTask(task);return s?[s.title,s.card.title,s.card.template,s.watch,s.practice,s.output,s.accept,s.exportPractice,s.domesticPractice,...[s.primary,...s.secondary].flatMap(r=>[r.name,r.chapter,r.goal])].join(' '):'';}
