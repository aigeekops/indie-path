import {content} from './generated/content.js';
export const checkedAt=content.checkedAt;
export const readings=content.readings;
export const curriculum=content.curriculum;
export const roleAdvice=content.roleAdvice;
export const adaptedVariant=id=>content.variants[id];
// 路径只选择已编译的 Markdown 变体，教材正文只有一个来源。
export function adaptLesson(task,profile){
 const base=curriculum[task.id],python=/python|fastapi|django|flask/i.test(profile?.stack||'');
 let id;
 if(task.id==='ui'&&profile?.skills?.frontend!==2)id='ui--beginner';
 else if(['auth','verify'].includes(task.id)&&python)id=task.id+'--python';
 else if(['ship','api'].includes(task.id))id=task.id+(python?'--python':'--default');
 else if(task.id==='review'&&profile?.paid)id='review--paid';
 if(!id)return base;
 const variant=content.variants[id];
 const practice=variant.practice||base.practice;
 const stepReadings=Object.fromEntries(Object.entries({...base.stepReadings,...variant.stepReadings}).filter(([title])=>practice.some(step=>step.title===title)));
 return {...base,...variant,stepReadings,html:{...base.html,...variant.html}};
}
// 关系用于学习入口与路线顺序检查，不自动宣称用户已掌握，也不强制锁课。
export const prerequisiteIds=(id,profile)=>{
 const basic=profile?.skills?.frontend!==2;
 const map={evidence:['find'],service:['evidence'],scope:['find'],contract:['scope','web-basics'],price:['scope'],'code-basics':['web-basics'],api:['contract','code-basics'],ui:['api',...(basic?['web-basics','code-basics']:[])],auth:['api'],verify:['contract','ui','auth'],usability:['ui'],ship:['verify','usability'],reach:['scope','ship'],charge:['price','auth','ship'],support:['ship'],operate:['reach','support']};
 const optional={segment:['find'],alternatives:['find'],'validation-experiment':['find'],positioning:['find'],'landing-page':['scope'],onboarding:['ui'],'ai-cost':['api'],'ai-evaluation':['ai-cost'],'mobile-performance':['ui'],'content-plan':['scope'],'content-review':['content-plan'],'search-demand':['ship'],'community-launch':['ship'],'sales-demo':['scope'],'pricing-experiment':['price'],'trial-conversion':['price'],'entitlements':['auth','charge'],retention:['review'],prioritization:['review']};
 const apps={'app-plan':['scope'],'app-build':['app-plan'],'app-cloud':[profile?.form==='手机游戏'?'game-build':'app-build'],'app-test':[...(profile?.form==='手机游戏'?['game-build','game-test']:['app-build']),...(profile?.mobileData==='需要云端服务'?['app-cloud']:[])],'app-release':['app-test','app-monetize'],'app-store-growth':['app-release'],'app-monetize':['app-plan',profile?.form==='手机游戏'?'game-build':'app-build'],'app-operations':['app-release','app-monetize']};
 const more={'wx-plan':['scope'],'wx-build':['wx-plan'],'wx-cloud':[profile?.form==='微信小游戏'?'game-build':'wx-build'],'wx-release':[...(profile?.form==='微信小游戏'?['game-test']:['wx-build']),'wx-monetize'],'wx-growth':['wx-release'],'wx-monetize':['wx-plan',profile?.form==='微信小游戏'?'game-build':'wx-build'],'wx-operations':['wx-release','wx-monetize'],'game-loop':[profile?.form==='微信小游戏'?'wx-plan':'app-plan'],'game-build':['game-loop'],'game-test':['game-build',profile?.form==='微信小游戏'?'wx-monetize':'app-monetize']};
 return more[id]||apps[id]||map[id]||optional[id]||[];
};
